import { unstable_cache } from "next/cache";
import { PublicKey } from "@solana/web3.js";
import { getAllScrapedTwitters } from "./twitter-overrides";
import { getAllMatricaByWallet } from "./enrichment-cache";
import { fetchOrbPortfolioUSD } from "./orb-scraper";
import {
  fetchActiveListings,
  MARKETPLACE_ADDRESSES,
} from "./marketplace-listings";
import { isEscrowOrProgramAccount } from "./program-accounts";
import { CHIAO_TREASURY } from "./known-wallets";
import { VALIDATOR_PUBKEY } from "./validator";

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";
const COLLECTION = "the_chimpions";

const TREASURY_MULTISIG = CHIAO_TREASURY;
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

export interface HolderNFT {
  id: string;
  name: string | null;
  image: string | null;
}

export interface HolderProfile {
  wallet: string;
  count: number;
  username: string | null;
  twitter: string | null;
  pfp: string | null;
  nfts: HolderNFT[];
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

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: { name?: string };
    links?: { image?: string };
    files?: { uri?: string; cdn_uri?: string }[];
  };
  ownership?: { owner?: string };
}

function assetImage(asset: HeliusAsset): string | null {
  return (
    asset.content?.links?.image ||
    asset.content?.files?.[0]?.cdn_uri ||
    asset.content?.files?.[0]?.uri ||
    null
  );
}

async function fetchHolderAssets(): Promise<Map<string, HolderNFT[]>> {
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

  const assets: HeliusAsset[] = data?.result?.items ?? [];

  const byOwner = new Map<string, HolderNFT[]>();
  for (const asset of assets) {
    const listing = listings.get(asset.id);
    const owner = listing?.seller || asset.ownership?.owner;
    if (!owner) continue;
    if (owner === TREASURY_MULTISIG) continue; // project treasury, not a holder
    if (MARKETPLACE_ADDRESSES.has(owner)) continue;
    // Drop NFTs parked in a listing escrow / program-derived account — they're
    // off-curve, so they aren't a real holder.
    if (isEscrowOrProgramAccount(owner)) continue;
    const nft: HolderNFT = {
      id: asset.id,
      name: asset.content?.metadata?.name ?? null,
      image: assetImage(asset),
    };
    const owned = byOwner.get(owner);
    if (owned) owned.push(nft);
    else byOwner.set(owner, [nft]);
  }
  return byOwner;
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

const cachedHolderAssets = unstable_cache(
  async (): Promise<[string, HolderNFT[]][]> => {
    const m = await fetchHolderAssets();
    return Array.from(m.entries());
  },
  ["holder-assets-v1"],
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
  const assetEntries = await cachedHolderAssets();
  if (assetEntries.length === 0) {
    console.warn("[holders] fetchHolderAssets returned empty");
    return [];
  }
  const assetsByWallet = new Map(assetEntries);

  const [matricaByWallet, scrapedByUsername] = await Promise.all([
    getAllMatricaByWallet(),
    getAllScrapedTwitters(),
  ]);

  const grouped = new Map<string, HolderProfile>();
  const standalone: HolderProfile[] = [];

  for (const [wallet, nfts] of assetsByWallet.entries()) {
    const count = nfts.length;
    const entry = matricaByWallet[wallet];
    const userId = entry?.userId ?? null;
    const username = entry?.username ?? null;
    const pfp = entry?.pfp ?? null;

    if (userId && username) {
      const existing = grouped.get(userId);
      if (existing) {
        existing.count += count;
        existing.nfts.push(...nfts);
        if (!existing.pfp && pfp) existing.pfp = pfp;
      } else {
        grouped.set(userId, {
          wallet,
          count,
          username,
          twitter: scrapedByUsername[username] ?? null,
          pfp,
          nfts: [...nfts],
        });
      }
    } else {
      standalone.push({
        wallet,
        count,
        username: null,
        twitter: null,
        pfp: null,
        nfts,
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
  /** Legacy u8 percent field — deprecated, truncates fractional rates. */
  commission?: number;
  /** Commission as u16 basis points: 500 = 5%. */
  inflationRewardsCommissionBps?: number;
  /** [epoch, credits, previousCredits] for the last few epochs. */
  epochCredits?: [number, number, number][];
}

async function heliusRpc<T>(
  id: string,
  method: string,
  params: unknown[],
  revalidate: number,
): Promise<T | null> {
  if (!HELIUS_API_KEY) return null;
  const data = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
      next: { revalidate },
    },
  )
    .then((r) => (r.ok ? r.json() : null))
    .catch((err) => {
      console.warn(`[rpc] ${method} failed:`, err);
      return null;
    });

  if (data?.error) {
    console.warn(`[rpc] ${method} returned error:`, data.error);
    return null;
  }
  return (data?.result as T) ?? null;
}

/**
 * Vote-account commission is now stored on chain as u16 basis points. The old
 * u8 `commission` percent field is still echoed by RPC but is deprecated and
 * rounds fractional rates, so prefer the bps field when the node returns it.
 */
function voteAccountCommissionPercent(va: VoteAccount): number | null {
  if (typeof va.inflationRewardsCommissionBps === "number") {
    return va.inflationRewardsCommissionBps / 100;
  }
  if (typeof va.commission === "number") return va.commission;
  return null;
}

const STAKE_PROGRAM = "Stake11111111111111111111111111111111111111";

interface RpcStakeAccount {
  pubkey: string;
  account: { data: [string, string]; lamports: number };
}

interface VoteAccountsSnapshot {
  validator: VoteAccount;
  delinquent: boolean;
  /** Best per-epoch vote credits earned by any validator, the uptime baseline. */
  bestCreditsByEpoch: Map<number, number>;
}

let cachedSnapshot: VoteAccountsSnapshot | null = null;
let snapshotCachedAt = 0;
const VOTE_ACCOUNT_TTL_MS = 10 * 60 * 1000;

function creditsEarnedInEpoch(va: VoteAccount, epoch: number): number {
  for (const [e, credits, previous] of va.epochCredits ?? []) {
    if (e === epoch) return credits - previous;
  }
  return 0;
}

/**
 * Fetches every vote account in one call. VALIDATOR_PUBKEY may be either the
 * identity or the vote address, and the full list doubles as the network
 * baseline for uptime, so there is nothing to gain from a filtered request.
 */
async function getVoteAccountsSnapshot(): Promise<VoteAccountsSnapshot | null> {
  if (cachedSnapshot && Date.now() - snapshotCachedAt < VOTE_ACCOUNT_TTL_MS) {
    return cachedSnapshot;
  }
  if (!HELIUS_API_KEY) {
    console.warn("[validator] HELIUS_API_KEY not set");
    return null;
  }

  const result = await heliusRpc<{
    current: VoteAccount[];
    delinquent: VoteAccount[];
  }>("vote-accounts", "getVoteAccounts", [], 600);

  const current = result?.current ?? [];
  const delinquent = result?.delinquent ?? [];
  const matches = (a: VoteAccount) =>
    a.votePubkey === VALIDATOR_PUBKEY || a.nodePubkey === VALIDATOR_PUBKEY;

  const validator = current.find(matches) ?? delinquent.find(matches);
  if (!validator) {
    console.warn(`[validator] vote account NOT FOUND for ${VALIDATOR_PUBKEY}`);
    return null;
  }

  const bestCreditsByEpoch = new Map<number, number>();
  for (const account of [...current, ...delinquent]) {
    for (const [epoch, credits, previous] of account.epochCredits ?? []) {
      const earned = credits - previous;
      if (earned > (bestCreditsByEpoch.get(epoch) ?? 0)) {
        bestCreditsByEpoch.set(epoch, earned);
      }
    }
  }

  cachedSnapshot = {
    validator,
    delinquent: delinquent.some(matches),
    bestCreditsByEpoch,
  };
  snapshotCachedAt = Date.now();
  console.log(
    `[validator] vote account resolved (vote=${validator.votePubkey.slice(0, 8)}…, node=${validator.nodePubkey.slice(0, 8)}…, ${current.length + delinquent.length} validators)`,
  );
  return cachedSnapshot;
}

async function getValidatorVoteAccount(): Promise<VoteAccount | null> {
  return (await getVoteAccountsSnapshot())?.validator ?? null;
}

let cachedStakeAccounts: RpcStakeAccount[] | null = null;
let stakeAccountsCachedAt = 0;
const STAKE_ACCOUNTS_TTL_MS = 60 * 60 * 1000;

async function getDelegatedStakeAccounts(
  votePubkey: string,
): Promise<RpcStakeAccount[]> {
  if (
    cachedStakeAccounts &&
    Date.now() - stakeAccountsCachedAt < STAKE_ACCOUNTS_TTL_MS
  ) {
    return cachedStakeAccounts;
  }

  const accounts = await heliusRpc<RpcStakeAccount[]>(
    "stake-accounts",
    "getProgramAccounts",
    [
      STAKE_PROGRAM,
      {
        encoding: "base64",
        filters: [
          { dataSize: 200 },
          { memcmp: { offset: 124, bytes: votePubkey } },
        ],
      },
    ],
    3600,
  );

  if (!accounts) return [];
  cachedStakeAccounts = accounts;
  stakeAccountsCachedAt = Date.now();
  return accounts;
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

  const accounts = await getDelegatedStakeAccounts(votePubkey);
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

export interface ValidatorChainStats {
  /** Commission percent, e.g. 5 for 5%. */
  commission: number | null;
  /** Vote credits earned as a percent of the best validator's, recent epochs. */
  uptime: number | null;
  /** Annualized percent return to a delegator, inflation + MEV, net of commission. */
  apyEstimate: number | null;
  /** Inflation rewards only. */
  stakingApy: number | null;
  /** Jito MEV tips only; null if the validator does not run Jito. */
  mevApy: number | null;
  delinquent: boolean;
}

interface EpochInfo {
  epoch: number;
  absoluteSlot: number;
  slotIndex: number;
  slotsInEpoch: number;
}

interface InflationReward {
  epoch: number;
  amount: number;
  postBalance: number;
}

const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;
/** Only used if block times are unavailable; mainnet runs slightly slower. */
const TARGET_SLOT_SECONDS = 0.4;
/** Epochs of vote credits to average uptime over. */
const UPTIME_EPOCHS = 4;
/** Stake accounts sampled when measuring realized rewards. */
const APY_SAMPLE_SIZE = 25;

/**
 * Epoch-boundary slots are often skipped, and a single leader owns four
 * consecutive slots, so step past whole leader windows when looking for a block.
 */
async function fetchBlockTimeNear(slot: number): Promise<number | null> {
  for (const offset of [0, 4, 8, 16, 32]) {
    const time = await heliusRpc<number>(
      "block-time",
      "getBlockTime",
      [slot + offset],
      86400,
    );
    if (typeof time === "number") return time;
  }
  return null;
}

/**
 * Measures how long the previous epoch actually took rather than assuming the
 * 400ms target slot time — mainnet currently runs closer to 415ms, which is a
 * ~4% swing in the compounded APY.
 */
async function fetchEpochsPerYear(epochInfo: EpochInfo): Promise<number> {
  const firstSlot = epochInfo.absoluteSlot - epochInfo.slotIndex;
  const [epochStart, previousEpochStart] = await Promise.all([
    fetchBlockTimeNear(firstSlot),
    fetchBlockTimeNear(firstSlot - epochInfo.slotsInEpoch),
  ]);

  if (epochStart && previousEpochStart && epochStart > previousEpochStart) {
    return SECONDS_PER_YEAR / (epochStart - previousEpochStart);
  }
  return SECONDS_PER_YEAR / (epochInfo.slotsInEpoch * TARGET_SLOT_SECONDS);
}

/**
 * Per-epoch return from inflation rewards actually paid to delegators, which
 * already accounts for commission, skipped slots and missed votes.
 */
async function fetchInflationRate(
  votePubkey: string,
  epoch: number,
): Promise<number | null> {
  // Largest accounts first: dust accounts are usually mid-activation and their
  // rewards round badly against a tiny principal.
  const sample = (await getDelegatedStakeAccounts(votePubkey))
    .slice()
    .sort((a, b) => b.account.lamports - a.account.lamports)
    .slice(0, APY_SAMPLE_SIZE)
    .map((a) => a.pubkey);
  if (sample.length === 0) return null;

  const rewards = await heliusRpc<(InflationReward | null)[]>(
    "inflation-reward",
    "getInflationReward",
    [sample, { epoch }],
    3600,
  );
  if (!rewards) return null;

  const rates: number[] = [];
  for (const reward of rewards) {
    if (!reward || reward.amount <= 0) continue;
    const principal = reward.postBalance - reward.amount;
    if (principal <= 0) continue;
    rates.push(reward.amount / principal);
  }
  return dominantRate(rates);
}

/** Rates within 0.1% of each other count as the same rate. */
const RATE_CLUSTER_TOLERANCE = 1.001;

/**
 * Every fully-activated stake account earns an identical rate, so the true rate
 * is the densest cluster: stake still warming up lands below it, and accounts
 * partially withdrawn mid-epoch report a principal that is too small, landing
 * above it. Plain min/max/average would pick up those artifacts.
 */
function dominantRate(rates: number[]): number | null {
  if (rates.length === 0) return null;

  const sorted = [...rates].sort((a, b) => a - b);
  let bestCount = 0;
  let bestRate = sorted[0];
  for (let start = 0; start < sorted.length; start++) {
    let end = start;
    while (
      end + 1 < sorted.length &&
      sorted[end + 1] <= sorted[start] * RATE_CLUSTER_TOLERANCE
    ) {
      end++;
    }
    if (end - start + 1 > bestCount) {
      bestCount = end - start + 1;
      bestRate = sorted[end];
    }
  }
  return bestRate;
}

/** Jito's tip distribution program, one account per validator per epoch. */
const JITO_TIP_DISTRIBUTION_PROGRAM = new PublicKey(
  "4R3gSG8BpU4t19KYj8CfnbtRpnT8gtk4dvTHxVRwc2r7",
);
/** Epochs to look back for a tip account whose merkle root has been uploaded. */
const MEV_LOOKBACK_EPOCHS = 4;

/**
 * Reads how much Jito tipped this validator's stakers in an epoch. MEV is paid
 * outside inflation, so `getInflationReward` misses it entirely.
 */
async function fetchMevTipsToStakers(
  votePubkey: string,
  epoch: number,
): Promise<number | null> {
  const epochBytes = Buffer.alloc(8);
  epochBytes.writeBigUInt64LE(BigInt(epoch));
  const [tipAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("TIP_DISTRIBUTION_ACCOUNT"),
      new PublicKey(votePubkey).toBuffer(),
      epochBytes,
    ],
    JITO_TIP_DISTRIBUTION_PROGRAM,
  );

  const account = await heliusRpc<{
    value: { data: [string, string] } | null;
  }>("tip-distribution", "getAccountInfo", [
    tipAccount.toBase58(),
    { encoding: "base64" },
  ], 3600);

  const encoded = account?.value?.data?.[0];
  if (!encoded) return null;

  // discriminator(8) + vote account(32) + upload authority(32), then an
  // Option<MerkleRoot>; the root is only present once the epoch is finalized.
  const data = Buffer.from(encoded, "base64");
  const rootOffset = 8 + 32 + 32;
  if (data.length < rootOffset + 1 || data[rootOffset] !== 1) return null;

  const maxTotalClaimOffset = rootOffset + 1 + 32;
  const commissionOffset = maxTotalClaimOffset + 8 * 4 + 8;
  if (data.length < commissionOffset + 2) return null;

  const maxTotalClaim = Number(data.readBigUInt64LE(maxTotalClaimOffset));
  const commissionBps = data.readUInt16LE(commissionOffset);
  return maxTotalClaim * (1 - commissionBps / 10_000);
}

/** Per-epoch MEV return, from the most recent epoch with finalized tips. */
async function fetchMevRate(
  votePubkey: string,
  activatedStake: number,
  epoch: number,
): Promise<number | null> {
  if (activatedStake <= 0) return null;
  for (let i = 1; i <= MEV_LOOKBACK_EPOCHS; i++) {
    const tips = await fetchMevTipsToStakers(votePubkey, epoch - i);
    if (tips !== null && tips > 0) return tips / activatedStake;
  }
  return null;
}

/** Vote credits over the recent epochs, against the best validator's. */
function computeUptime(snapshot: VoteAccountsSnapshot): number | null {
  const epochs = (snapshot.validator.epochCredits ?? [])
    .map(([epoch]) => epoch)
    .slice(-UPTIME_EPOCHS);
  if (epochs.length === 0) return null;

  let earned = 0;
  let best = 0;
  for (const epoch of epochs) {
    earned += creditsEarnedInEpoch(snapshot.validator, epoch);
    best += snapshot.bestCreditsByEpoch.get(epoch) ?? 0;
  }
  if (best <= 0) return null;
  return Math.min(100, (earned / best) * 100);
}

export async function fetchValidatorChainStats(): Promise<ValidatorChainStats | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;

  const snapshot = await getVoteAccountsSnapshot();
  if (!snapshot) return null;

  const { votePubkey, activatedStake } = snapshot.validator;
  const epochInfo = await heliusRpc<EpochInfo>(
    "epoch-info",
    "getEpochInfo",
    [],
    600,
  );

  let stakingApy: number | null = null;
  let mevApy: number | null = null;
  let apyEstimate: number | null = null;

  if (epochInfo) {
    const [inflationRate, mevRate, epochsPerYear] = await Promise.all([
      fetchInflationRate(votePubkey, epochInfo.epoch - 1),
      fetchMevRate(votePubkey, activatedStake, epochInfo.epoch),
      fetchEpochsPerYear(epochInfo),
    ]);
    const annualize = (rate: number) => ((1 + rate) ** epochsPerYear - 1) * 100;

    stakingApy = inflationRate === null ? null : annualize(inflationRate);
    mevApy = mevRate === null ? null : annualize(mevRate);
    if (inflationRate !== null) {
      apyEstimate = annualize(inflationRate + (mevRate ?? 0));
    }
  }

  const stats: ValidatorChainStats = {
    commission: voteAccountCommissionPercent(snapshot.validator),
    uptime: computeUptime(snapshot),
    apyEstimate,
    stakingApy,
    mevApy,
    delinquent: snapshot.delinquent,
  };

  console.log(
    `[validator] apy=${stats.apyEstimate?.toFixed(2) ?? "—"}% (staking=${stats.stakingApy?.toFixed(2) ?? "—"}% mev=${stats.mevApy?.toFixed(2) ?? "—"}%) uptime=${stats.uptime?.toFixed(2) ?? "—"}% commission=${stats.commission ?? "—"}%`,
  );
  return stats;
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
