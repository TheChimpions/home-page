import { MARKETPLACE_ADDRESSES } from "./marketplace-listings";
import { fetchProgramAccounts } from "./program-accounts";
import type { ProvenanceStep } from "./enrichment-cache";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

interface HeliusTokenTransfer {
  fromUserAccount?: string;
  toUserAccount?: string;
  mint?: string;
  tokenAmount?: number;
}

interface HeliusEnhancedTx {
  signature: string;
  timestamp: number;
  tokenTransfers?: HeliusTokenTransfer[];
}

// Most 1/1s have short histories; cap pages so a hot wallet can't stall the job.
const PAGE_LIMIT = 100;
const MAX_PAGES = 5;

let warnedNoApiKey = false;

/**
 * Reconstruct the ownership chain for a single mint from its on-chain transfer
 * history (Helius Enhanced Transactions API). Returns owners oldest-first.
 *
 * Marketplace escrow/program addresses are dropped, and consecutive duplicate
 * owners are collapsed so a list → delist by the same wallet shows as one step
 * and a sale (owner → escrow → buyer) shows as two.
 */
export async function fetchProvenanceForMint(
  mint: string,
): Promise<ProvenanceStep[]> {
  if (!HELIUS_API_KEY) {
    if (!warnedNoApiKey) {
      console.warn("HELIUS_API_KEY is not set; skipping provenance lookups");
      warnedNoApiKey = true;
    }
    return [];
  }

  const events: { wallet: string; ts: number }[] = [];
  let before: string | undefined;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = new URL(
        `https://api.helius.xyz/v0/addresses/${mint}/transactions`,
      );
      url.searchParams.set("api-key", HELIUS_API_KEY);
      url.searchParams.set("limit", String(PAGE_LIMIT));
      if (before) url.searchParams.set("before", before);

      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn(
          `[provenance] tx lookup failed for ${mint}: ${res.status}`,
        );
        break;
      }

      const txs = (await res.json()) as HeliusEnhancedTx[];
      if (!Array.isArray(txs) || txs.length === 0) break;

      for (const tx of txs) {
        for (const t of tx.tokenTransfers || []) {
          if (t.mint !== mint) continue;
          if (!t.toUserAccount) continue;
          // NFT transfers move exactly 1 token; be lenient if amount is omitted.
          if (t.tokenAmount != null && t.tokenAmount !== 1) continue;
          events.push({ wallet: t.toUserAccount, ts: tx.timestamp });
        }
      }

      before = txs[txs.length - 1]?.signature;
      if (txs.length < PAGE_LIMIT) break;
    }
  } catch (err) {
    console.warn(`[provenance] fetch error for ${mint}:`, err);
    return [];
  }

  // Helius returns newest-first within and across pages; order oldest-first.
  events.sort((a, b) => a.ts - b.ts);

  // Escrow/program-owned accounts aren't real owners. Known marketplaces are a
  // cheap fast-path; on-chain program detection catches any other escrow PDA.
  const programAccounts = await fetchProgramAccounts(
    events.map((e) => e.wallet).filter((w) => !MARKETPLACE_ADDRESSES.has(w)),
  );

  const chain: ProvenanceStep[] = [];
  for (const e of events) {
    if (MARKETPLACE_ADDRESSES.has(e.wallet)) continue; // skip escrows
    if (programAccounts.has(e.wallet)) continue; // skip other program accounts
    const last = chain[chain.length - 1];
    if (last && last.wallet === e.wallet) continue; // collapse consecutive dups
    chain.push({ wallet: e.wallet, acquiredAt: e.ts ?? null });
  }

  return chain;
}

/**
 * Fetch provenance for many mints with bounded concurrency.
 */
export async function fetchProvenanceBatch(
  mints: string[],
  concurrency = 5,
): Promise<Record<string, ProvenanceStep[]>> {
  const result: Record<string, ProvenanceStep[]> = {};
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, mints.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= mints.length) return;
        const mint = mints[i];
        result[mint] = await fetchProvenanceForMint(mint);
      }
    }),
  );

  return result;
}
