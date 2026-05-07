import {
  getMatricaProfileByWallet,
  getMatricaDisplayName,
  getMatricaTwitterHandle,
  getMatricaPfp,
  getMatricaUsername,
  type MatricaProfile,
} from "./matrica";
import { scrapeTwitterForProfile } from "./matrica-scraper";
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

export async function fetchHoldersWithProfiles(
  limit?: number,
): Promise<HolderProfile[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return [];
  }

  const counts = await fetchHolderCounts();
  if (counts.size === 0) return [];

  const wallets = [...counts.entries()];
  const profileByWallet = new Map<string, MatricaProfile | null>();

  const CONCURRENCY = 8;
  let cursor = 0;
  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, wallets.length) },
      async () => {
        while (true) {
          const i = cursor++;
          if (i >= wallets.length) return;
          const [wallet] = wallets[i];
          const profile = await getMatricaProfileByWallet(wallet);
          profileByWallet.set(wallet, profile);
        }
      },
    ),
  );

  const grouped = new Map<string, HolderProfile>();
  const standalone: HolderProfile[] = [];

  for (const [wallet, count] of wallets) {
    const profile = profileByWallet.get(wallet) ?? null;
    const userId = profile?.user?.id;
    const username = getMatricaDisplayName(profile);

    if (userId && username) {
      const existing = grouped.get(userId);
      if (existing) {
        existing.count += count;
      } else {
        grouped.set(userId, {
          wallet,
          count,
          username,
          twitter: getMatricaTwitterHandle(profile),
          pfp: getMatricaPfp(profile),
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
  const SCRAPE_CONCURRENCY = 2;
  const SCRAPE_BUDGET_MS = 15_000;
  const scrapeStart = Date.now();
  let scrapeCursor = 0;
  await Promise.all(
    Array.from(
      { length: Math.min(SCRAPE_CONCURRENCY, groupedHolders.length) },
      async () => {
        while (true) {
          if (Date.now() - scrapeStart > SCRAPE_BUDGET_MS) return;
          const i = scrapeCursor++;
          if (i >= groupedHolders.length) return;
          const h = groupedHolders[i];
          if (h.twitter) continue;
          const profile = profileByWallet.get(h.wallet) ?? null;
          h.twitter = await scrapeTwitterForProfile(profile);
        }
      },
    ),
  );

  const merged = [...groupedHolders, ...standalone].sort(
    (a, b) => b.count - a.count,
  );
  return limit ? merged.slice(0, limit) : merged;
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
  if (!HELIUS_API_KEY) return null;

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
      console.warn("getProgramAccounts(stake) failed:", err);
      return null;
    });

  if (data?.error) {
    console.warn("getProgramAccounts(stake) returned error:", data.error);
  }

  const accounts: RpcStakeAccount[] = data?.result ?? [];
  if (accounts.length === 0) {
    console.warn(
      `Validator delegators: 0 stake accounts for vote=${votePubkey}`,
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

  return {
    stakeAccountCount: accounts.length,
    uniqueDelegators: stakers.size,
    votePubkey,
  };
}

export async function fetchValidatorStake(): Promise<number | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  const va = await getValidatorVoteAccount();
  return va ? va.activatedStake / 1_000_000_000 : null;
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
    .catch(() => null);

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
  if (override !== null) return override;

  return TREASURY_USD_FALLBACK;
}

export function formatTreasuryUSD(usd: number | null): string {
  if (usd === null) return "—";
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1000)}k`;
  return `$${Math.round(usd).toLocaleString()}`;
}
