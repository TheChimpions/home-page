import { Redis } from "@upstash/redis";
import path from "node:path";
import { promises as fs } from "node:fs";
import type { NFTListing } from "@/types/nft";

const KV_MATRICA = "chimpions:enrichment:matrica:by-wallet";
const KV_LISTINGS = "chimpions:enrichment:listings:by-mint";
const KV_PROVENANCE = "chimpions:enrichment:provenance:by-mint";

export interface MatricaEntry {
  username: string | null;
  userId: string | null;
  pfp: string | null;
}

/**
 * One step in a chimp's ownership history. Usernames/pfps are not stored here —
 * they're joined at read time from the matrica-by-wallet table so there is a
 * single source of truth for wallet → Matrica identity.
 */
export interface ProvenanceStep {
  wallet: string;
  acquiredAt: number | null;
}

function getRedisCreds(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "";
  if (!url || !token) return null;
  return { url, token };
}

let redisInstance: Redis | null = null;
function getRedis(): Redis | null {
  if (redisInstance) return redisInstance;
  const creds = getRedisCreds();
  if (!creds) return null;
  redisInstance = new Redis(creds);
  return redisInstance;
}

const LOCAL_DIR = path.join(process.cwd(), ".next", "cache", "chimpions");
const LOCAL_MATRICA_FILE = path.join(LOCAL_DIR, "matrica-by-wallet.json");
const LOCAL_LISTINGS_FILE = path.join(LOCAL_DIR, "listings-by-mint.json");
const LOCAL_PROVENANCE_FILE = path.join(LOCAL_DIR, "provenance-by-mint.json");

async function readLocalFile<T = string>(
  filepath: string,
): Promise<Record<string, T>> {
  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeLocalFile(
  filepath: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`[enrichment-cache] failed to write ${filepath}:`, err);
  }
}

export async function getAllMatricaByWallet(): Promise<
  Record<string, MatricaEntry>
> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw =
        (await redis.hgetall<Record<string, MatricaEntry>>(KV_MATRICA)) ?? {};
      return raw;
    } catch (err) {
      console.warn("[enrichment-cache] failed to read matrica KV:", err);
      return {};
    }
  }
  return readLocalFile<MatricaEntry>(LOCAL_MATRICA_FILE);
}

export async function setMatricaByWallet(
  entries: Record<string, MatricaEntry>,
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    const existingKeys = await redis.hkeys(KV_MATRICA);
    const newKeys = new Set(Object.keys(entries));
    const toRemove = existingKeys.filter((k) => !newKeys.has(k));

    if (newKeys.size > 0) {
      await redis.hset(KV_MATRICA, entries);
    }
    if (toRemove.length > 0) {
      await redis.hdel(KV_MATRICA, ...toRemove);
    }
    return;
  }
  await writeLocalFile(LOCAL_MATRICA_FILE, entries);
}

export async function clearAllMatrica(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(KV_MATRICA);
  } else {
    await writeLocalFile(LOCAL_MATRICA_FILE, {});
  }
}

export async function getAllListingsByMint(): Promise<
  Record<string, NFTListing>
> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw =
        (await redis.hgetall<Record<string, NFTListing>>(KV_LISTINGS)) ?? {};
      return raw;
    } catch (err) {
      console.warn("[enrichment-cache] failed to read listings KV:", err);
      return {};
    }
  }
  return readLocalFile<NFTListing>(LOCAL_LISTINGS_FILE);
}

export async function setListingsByMint(
  entries: Record<string, NFTListing>,
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    const existingKeys = await redis.hkeys(KV_LISTINGS);
    const newKeys = new Set(Object.keys(entries));
    const toRemove = existingKeys.filter((k) => !newKeys.has(k));

    if (newKeys.size > 0) {
      await redis.hset(KV_LISTINGS, entries);
    }
    if (toRemove.length > 0) {
      await redis.hdel(KV_LISTINGS, ...toRemove);
    }
    return;
  }
  await writeLocalFile(LOCAL_LISTINGS_FILE, entries);
}

export async function clearAllListings(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(KV_LISTINGS);
  } else {
    await writeLocalFile(LOCAL_LISTINGS_FILE, {});
  }
}

export async function getAllProvenanceByMint(): Promise<
  Record<string, ProvenanceStep[]>
> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw =
        (await redis.hgetall<Record<string, ProvenanceStep[]>>(
          KV_PROVENANCE,
        )) ?? {};
      return raw;
    } catch (err) {
      console.warn("[enrichment-cache] failed to read provenance KV:", err);
      return {};
    }
  }
  return readLocalFile<ProvenanceStep[]>(LOCAL_PROVENANCE_FILE);
}

export async function setProvenanceByMint(
  entries: Record<string, ProvenanceStep[]>,
): Promise<void> {
  const redis = getRedis();
  if (redis) {
    const existingKeys = await redis.hkeys(KV_PROVENANCE);
    const newKeys = new Set(Object.keys(entries));
    const toRemove = existingKeys.filter((k) => !newKeys.has(k));

    if (newKeys.size > 0) {
      await redis.hset(KV_PROVENANCE, entries);
    }
    if (toRemove.length > 0) {
      await redis.hdel(KV_PROVENANCE, ...toRemove);
    }
    return;
  }
  await writeLocalFile(LOCAL_PROVENANCE_FILE, entries);
}

export async function clearAllProvenance(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(KV_PROVENANCE);
  } else {
    await writeLocalFile(LOCAL_PROVENANCE_FILE, {});
  }
}
