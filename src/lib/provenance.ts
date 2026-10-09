import { MARKETPLACE_ADDRESSES } from "./marketplace-listings";
import { isEscrowOrProgramAccount } from "./program-accounts";
import type { ProvenanceStep } from "./enrichment-cache";

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
// Helius rate-limits bursts; retry 429/5xx a couple of times before giving up.
const MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1000;

let warnedNoApiKey = false;

export interface ProvenanceFetchOptions {
  fetchImpl?: typeof fetch;
  /** Base backoff between retries; doubles each attempt. */
  retryDelayMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(
  url: string,
  fetchImpl: typeof fetch,
  retryDelayMs: number,
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetchImpl(url);
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= MAX_RETRIES) return res;
    await sleep(retryDelayMs * 2 ** attempt);
  }
}

/**
 * Reconstruct the ownership chain for a single mint from its on-chain transfer
 * history (Helius Enhanced Transactions API). Returns owners oldest-first, or
 * null when the history could not be read completely (no API key, HTTP error,
 * network failure). Callers must keep the stored chain on null rather than
 * replacing it with a partial one.
 *
 * Marketplace escrow/program addresses are dropped, and consecutive duplicate
 * owners are collapsed so a list → delist by the same wallet shows as one step
 * and a sale (owner → escrow → buyer) shows as two.
 */
export async function fetchProvenanceForMint(
  mint: string,
  opts: ProvenanceFetchOptions = {},
): Promise<ProvenanceStep[] | null> {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    if (!warnedNoApiKey) {
      console.warn("HELIUS_API_KEY is not set; skipping provenance lookups");
      warnedNoApiKey = true;
    }
    return null;
  }
  const fetchImpl = opts.fetchImpl ?? fetch;
  const retryDelayMs = opts.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  const events: { wallet: string; ts: number }[] = [];
  let before: string | undefined;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const url = new URL(
        `https://api.helius.xyz/v0/addresses/${mint}/transactions`,
      );
      url.searchParams.set("api-key", apiKey);
      url.searchParams.set("limit", String(PAGE_LIMIT));
      if (before) url.searchParams.set("before", before);

      const res = await fetchWithRetry(url.toString(), fetchImpl, retryDelayMs);
      if (!res.ok) {
        console.warn(
          `[provenance] tx lookup failed for ${mint}: ${res.status}`,
        );
        return null;
      }

      const txs = (await res.json()) as HeliusEnhancedTx[];
      if (!Array.isArray(txs)) return null;
      if (txs.length === 0) break;

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
    return null;
  }

  // Helius returns newest-first within and across pages; order oldest-first.
  events.sort((a, b) => a.ts - b.ts);

  const chain: ProvenanceStep[] = [];
  for (const e of events) {
    if (MARKETPLACE_ADDRESSES.has(e.wallet)) continue; // skip known marketplaces
    if (isEscrowOrProgramAccount(e.wallet)) continue; // skip escrow/PDA hops
    const last = chain[chain.length - 1];
    if (last && last.wallet === e.wallet) continue; // collapse consecutive dups
    chain.push({ wallet: e.wallet, acquiredAt: e.ts ?? null });
  }

  return chain;
}

export interface ProvenanceBatchResult {
  /** Chains for every mint whose history was read in full. */
  chains: Record<string, ProvenanceStep[]>;
  /** Mints whose lookup failed; absent from `chains`. */
  failed: string[];
}

/**
 * Fetch provenance for many mints with bounded concurrency.
 */
export async function fetchProvenanceBatch(
  mints: string[],
  opts: ProvenanceFetchOptions & { concurrency?: number } = {},
): Promise<ProvenanceBatchResult> {
  const result: ProvenanceBatchResult = { chains: {}, failed: [] };
  const concurrency = opts.concurrency ?? 5;
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, mints.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= mints.length) return;
        const mint = mints[i];
        const chain = await fetchProvenanceForMint(mint, opts);
        if (chain) result.chains[mint] = chain;
        else result.failed.push(mint);
      }
    }),
  );

  return result;
}
