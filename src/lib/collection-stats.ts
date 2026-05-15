import { unstable_cache } from "next/cache";
import { getAllScrapedTwitters } from "./twitter-overrides";
import { getAllMatricaByWallet } from "./enrichment-cache";
import { fetchOrbPortfolioUSD } from "./orb-scraper";
import {
  fetchActiveListings,
  MARKETPLACE_ADDRESSES,
} from "./marketplace-listings";

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";
const COLLECTION = "the_chimpions";

const VALIDATOR_PUBKEY = "2AKKnirWVZMhnzuwqpizw9SwfZjGpRFLx2zCCNtPWpbc";

const TREASURY_MULTISIG = "Df7VuBkasBXHyEYUsuqQnEpDvLyZmfoxDnk932CUak2c";
const TREASURY_CACHE_SECONDS = 24 * 60 * 60;
const TREASURY_USD_FALLBACK = 140000;

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
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { floorPrice: null, listedCount: null };
  }
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
  const holders = await fetchHoldersWithProfiles();
  if (holders.length === 0) return { uniqueHolders: null, whales: null };

  return {
    uniqueHolders: holders.length,
    whales: holders.filter((h) => h.count >= 5).length,
  };
}

const HOLDER_COUNTS_TTL_SECONDS = 30 * 24 * 60 * 60;

const cachedHolderCounts = unstable_cache(
  async (): Promise<[string, number][]> => {
    const m = await fetchHolderCounts();
    return Array.from(m.entries());
  },
  ["holder-counts-v1"],
  { revalidate: HOLDER_COUNTS_TTL_SECONDS, tags: ["holder-counts"] },
);

export async function fetchHoldersWithProfiles(
  limit?: number,
): Promise<HolderProfile[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return [];
  }
  const all = await assembleHoldersWithProfiles();
  return limit ? all.slice(0, limit) : all;
}

async function assembleHoldersWithProfiles(): Promise<HolderProfile[]> {
  const t0 = Date.now();
  const countEntries = await cachedHolderCounts();
  if (countEntries.length === 0) {
    console.warn("[holders] fetchHolderCounts returned empty");
    return [];
  }
  const counts = new Map(countEntries);

  const [matricaByWallet, scrapedByUsername] = await Promise.all([
    getAllMatricaByWallet(),
    getAllScrapedTwitters(),
  ]);

  const grouped = new Map<string, HolderProfile>();
  const standalone: HolderProfile[] = [];

  for (const [wallet, count] of counts.entries()) {
    const entry = matricaByWallet[wallet];
    const userId = entry?.userId ?? null;
    const username = entry?.username ?? null;
    const pfp = entry?.pfp ?? null;

    if (userId && username) {
      const existing = grouped.get(userId);
      if (existing) {
        existing.count += count;
        if (!existing.pfp && pfp) existing.pfp = pfp;
      } else {
        grouped.set(userId, {
          wallet,
          count,
          username,
          twitter: scrapedByUsername[username] ?? null,
          pfp,
        });
      }
    } else {
      standalone.push({
        wallet,
        count,
        username: null,
        twitter: null,
        pfp: null,
      });
    }
  }

  const groupedHolders = [...grouped.values()];
  const merged = [...groupedHolders, ...standalone].sort(
    (a, b) => b.count - a.count,
  );
  const withTwitter = merged.filter((h) => h.twitter).length;
  console.log(
    `[holders] ${merged.length} merged (${groupedHolders.length} matrica + ${standalone.length} wallet-only, ${withTwitter} w/ twitter from KV) in ${((Date.now() - t0) / 1000).toFixed(1)}s — KV reads only`,
  );
  return merged;
}

interface VoteAccount {
  votePubkey: string;
  nodePubkey: string;
  activatedStake: number;
}

const STAKE_PROGRAM = "Stake11111111111111111111111111111111111111";

interface RpcStakeAccount {
  pubkey: string;
  account: { data: [string, string]; lamports: number };
}

let cachedVoteAccount: VoteAccount | null = null;
let voteAccountCachedAt = 0;
const VOTE_ACCOUNT_TTL_MS = 10 * 60 * 1000;

async function getValidatorVoteAccount(): Promise<VoteAccount | null> {
  if (
    cachedVoteAccount &&
    Date.now() - voteAccountCachedAt < VOTE_ACCOUNT_TTL_MS
  ) {
    return cachedVoteAccount;
  }
  if (!HELIUS_API_KEY) {
    console.warn("[validator] HELIUS_API_KEY not set");
    return null;
  }

  const data = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "vote-accounts",
        method: "getVoteAccounts",
        params: [{ votePubkey: VALIDATOR_PUBKEY }],
      }),
      next: { revalidate: 600 },
    },
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  let accounts: VoteAccount[] = [
    ...(data?.result?.current ?? []),
    ...(data?.result?.delinquent ?? []),
  ];
  let found = accounts.find((a) => a.votePubkey === VALIDATOR_PUBKEY);

  if (!found) {
    const allData = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "vote-accounts-all",
          method: "getVoteAccounts",
          params: [],
        }),
        next: { revalidate: 600 },
      },
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    accounts = [
      ...(allData?.result?.current ?? []),
      ...(allData?.result?.delinquent ?? []),
    ];
    found = accounts.find(
      (a) =>
        a.votePubkey === VALIDATOR_PUBKEY ||
        a.nodePubkey === VALIDATOR_PUBKEY,
    );
  }

  if (found) {
    cachedVoteAccount = found;
    voteAccountCachedAt = Date.now();
    console.log(
      `[validator] vote account resolved (vote=${found.votePubkey.slice(0, 8)}…, node=${found.nodePubkey.slice(0, 8)}…)`,
    );
  } else {
    console.warn(
      `[validator] vote account NOT FOUND for ${VALIDATOR_PUBKEY}`,
    );
  }
  return found ?? null;
}

export async function fetchValidatorDelegators(): Promise<{
  stakeAccountCount: number;
  uniqueDelegators: number;
  votePubkey: string;
} | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  if (!HELIUS_API_KEY) return null;

  const va = await getValidatorVoteAccount();
  if (!va) {
    console.warn(
      `Validator delegators: vote account not found for ${VALIDATOR_PUBKEY}`,
    );
    return null;
  }
  const votePubkey = va.votePubkey;

  const data = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "stake-accounts",
        method: "getProgramAccounts",
        params: [
          STAKE_PROGRAM,
          {
            encoding: "base64",
            filters: [
              { dataSize: 200 },
              { memcmp: { offset: 124, bytes: votePubkey } },
            ],
          },
        ],
      }),
      next: { revalidate: 3600 },
    },
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch((err) => {
      console.warn("[validator] getProgramAccounts(stake) failed:", err);
      return null;
    });

  if (data?.error) {
    console.warn(
      "[validator] getProgramAccounts(stake) returned error:",
      data.error,
    );
  }

  const accounts: RpcStakeAccount[] = data?.result ?? [];
  if (accounts.length === 0) {
    console.warn(
      `[validator] 0 stake accounts found (vote=${votePubkey.slice(0, 8)}…)`,
    );
    return null;
  }

  const stakers = new Set<string>();
  for (const acc of accounts) {
    const buf = Buffer.from(acc.account.data[0], "base64");
    if (buf.length < 44) continue;
    const stakerBytes = buf.subarray(12, 44);
    stakers.add(Buffer.from(stakerBytes).toString("base64"));
  }

  console.log(
    `[validator] delegators: ${stakers.size} unique / ${accounts.length} stake accounts`,
  );

  return {
    stakeAccountCount: accounts.length,
    uniqueDelegators: stakers.size,
    votePubkey,
  };
}

export async function fetchValidatorStake(): Promise<number | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  const va = await getValidatorVoteAccount();
  if (!va) {
    console.warn(
      `[validator] no vote account found for ${VALIDATOR_PUBKEY}`,
    );
    return null;
  }
  const sol = va.activatedStake / 1_000_000_000;
  console.log(
    `[validator] stake=${sol.toFixed(0)} SOL (vote=${va.votePubkey.slice(0, 8)}…)`,
  );
  return sol;
}

interface StakewizValidator {
  identity: string;
  vote_identity: string;
  credit_ratio: number;
  skip_rate: number;
  apy_estimate: number;
  commission: number;
  delinquent: boolean;
  uptime?: number;
}

export async function fetchValidatorStakewiz(): Promise<StakewizValidator | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  const va = await getValidatorVoteAccount();
  if (!va) return null;

  const data = await fetch(
    `https://api.stakewiz.com/validator/${va.votePubkey}`,
    { next: { revalidate: 3600 } },
  )
    .then((r) => (r.ok ? (r.json() as Promise<StakewizValidator>) : null))
    .catch((err) => {
      console.warn("[stakewiz] fetch failed:", err);
      return null;
    });

  if (!data) {
    console.warn("[stakewiz] no data returned");
  } else {
    console.log(
      `[stakewiz] apy=${data.apy_estimate?.toFixed(2)}% credit_ratio=${data.credit_ratio?.toFixed(2)}% commission=${data.commission}%`,
    );
  }
  return data;
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
  const roundedThousands = Math.max(1, Math.round(sol / 1000));
  return { end: roundedThousands, decimals: 0, suffix: "k" };
}

export function formatCount(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString();
}

export const TREASURY_ADDRESS = TREASURY_MULTISIG;
export const TREASURY_PORTFOLIO_URL = `https://orbmarkets.io/address/${TREASURY_MULTISIG}/portfolio`;

interface HeliusWalletBalances {
  totalUsdValue?: number;
  balances?: { mint: string; symbol?: string; usdValue?: number | null }[];
}

export async function fetchHeliusBalances(
  address: string,
): Promise<HeliusWalletBalances | null> {
  if (!HELIUS_API_KEY) return null;
  return fetch(
    `https://api.helius.xyz/v1/wallet/${address}/balances?api-key=${HELIUS_API_KEY}`,
    { next: { revalidate: TREASURY_CACHE_SECONDS } },
  )
    .then((r) => (r.ok ? (r.json() as Promise<HeliusWalletBalances>) : null))
    .catch(() => null);
}

function parseTreasuryEnv(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s_]/g, "").toLowerCase();
  let body = cleaned;
  let multiplier = 1;
  if (body.endsWith("k")) {
    multiplier = 1_000;
    body = body.slice(0, -1);
  } else if (body.endsWith("m")) {
    multiplier = 1_000_000;
    body = body.slice(0, -1);
  }
  const n = Number(body);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n * multiplier;
}

export async function fetchTreasuryValueUSD(): Promise<number | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }

  const override = parseTreasuryEnv(process.env.TREASURY_USD);
  if (override !== null) {
    console.log(`[treasury] using TREASURY_USD env override = ${override}`);
    return override;
  }

  console.log(`[treasury] using fallback = ${TREASURY_USD_FALLBACK}`);
  return TREASURY_USD_FALLBACK;
}

export function formatTreasuryUSD(usd: number | null): string {
  if (usd === null) return "—";
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1000)}k`;
  return `$${Math.round(usd).toLocaleString()}`;
}
