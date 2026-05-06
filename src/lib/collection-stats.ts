import {
  getMatricaProfileByWallet,
  getMatricaDisplayName,
  getMatricaTwitterHandle,
  getMatricaPfp,
} from "./matrica";
import { fetchActiveListings } from "./marketplace-listings";

const MARKETPLACE_ADDRESSES = new Set<string>([
  "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix",
  "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
  "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
  "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
]);

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";
const COLLECTION = "the_chimpions";

const TRILLIUM_URL =
  "https://api.trillium.so/validator_rewards/CHiaohVV2SQCFhiYP73iQzWT6HxnZqnAZJJqAYTeLAo";

const HELIUS_API_KEY =
  process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const CREATOR_ADDRESS =
  process.env.NEXT_PUBLIC_CREATOR_ADDRESS ||
  "D7hKRyCsdaaSGVGwSAgcEfkSofBb6gn68UPD3yWW59zW";

export interface MEStats {
  floorPrice: number | null;
  listedCount: number | null;
}

export interface HolderStats {
  uniqueHolders: number | null;
  whales: number | null;
}

export interface HolderProfile {
  wallet: string;
  count: number;
  username: string | null;
  twitter: string | null;
  pfp: string | null;
}

export async function fetchMEStats(): Promise<MEStats> {
  const data = await fetch(
    `${ME_BASE}/collections/${COLLECTION}/stats`,
    { next: { revalidate: 300 } },
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  return {
    floorPrice: data?.floorPrice ?? null,
    listedCount: data?.listedCount ?? null,
  };
}

async function fetchHolderCounts(): Promise<Map<string, number>> {
  if (!HELIUS_API_KEY) return new Map();

  const [data, listings] = await Promise.all([
    fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "holder-counts",
        method: "getAssetsByCreator",
        params: {
          creatorAddress: CREATOR_ADDRESS,
          onlyVerified: true,
          limit: 1000,
          page: 1,
        },
      }),
      next: { revalidate: 3600 },
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetchActiveListings(),
  ]);

  const assets: { id: string; ownership?: { owner?: string } }[] =
    data?.result?.items ?? [];

  const counts = new Map<string, number>();
  for (const asset of assets) {
    const listing = listings.get(asset.id);
    const owner = listing?.seller || asset.ownership?.owner;
    if (!owner) continue;
    if (MARKETPLACE_ADDRESSES.has(owner)) continue;
    counts.set(owner, (counts.get(owner) ?? 0) + 1);
  }
  return counts;
}

export async function fetchHolderStats(): Promise<HolderStats> {
  const counts = await fetchHolderCounts();
  if (counts.size === 0) return { uniqueHolders: null, whales: null };

  return {
    uniqueHolders: counts.size,
    whales: [...counts.values()].filter((c) => c >= 5).length,
  };
}

export async function fetchHoldersWithProfiles(
  limit?: number,
): Promise<HolderProfile[]> {
  const counts = await fetchHolderCounts();
  if (counts.size === 0) return [];

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = limit ? sorted.slice(0, limit) : sorted;

  const CONCURRENCY = 8;
  const results: HolderProfile[] = new Array(top.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, top.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= top.length) return;
        const [wallet, count] = top[i];
        const profile = await getMatricaProfileByWallet(wallet);
        results[i] = {
          wallet,
          count,
          username: getMatricaDisplayName(profile),
          twitter: getMatricaTwitterHandle(profile),
          pfp: getMatricaPfp(profile),
        };
      }
    }),
  );
  return results;
}

export async function fetchValidatorStake(): Promise<number | null> {
  const arr = await fetch(TRILLIUM_URL, { next: { revalidate: 3600 } })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[0].activated_stake ?? null;
}

export function formatSOL(lamports: number | null): string {
  if (lamports === null) return "—";
  return `${(lamports / 1_000_000_000).toFixed(1)} SOL`;
}

export function formatStakeSOL(sol: number | null): string {
  if (sol === null) return "—";
  if (sol >= 1_000_000) return `${(sol / 1_000_000).toFixed(1)}M SOL`;
  if (sol >= 1_000) return `${(sol / 1_000).toFixed(0)}K SOL`;
  return `${sol.toLocaleString()} SOL`;
}

export function parseStakeCountUp(
  sol: number | null,
): { end: number; decimals: number; suffix: string } | null {
  if (sol === null) return null;
  if (sol >= 1_000_000) return { end: sol / 1_000_000, decimals: 1, suffix: "M SOL" };
  if (sol >= 1_000) return { end: sol / 1_000, decimals: 0, suffix: "K SOL" };
  return { end: sol, decimals: 0, suffix: " SOL" };
}

export function formatCount(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString();
}
