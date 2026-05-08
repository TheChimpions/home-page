import { Redis } from "@upstash/redis";
import path from "node:path";
import { promises as fs } from "node:fs";

const KV_KEY = "chimpions:twitter-overrides:by-mint";
const KV_SCRAPED_KEY = "chimpions:twitter-scraped:by-username";

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

function isKvConfigured(): boolean {
  return getRedisCreds() !== null;
}

export function getStorageBackend(): "kv" | "local-file" {
  return isKvConfigured() ? "kv" : "local-file";
}

const LOCAL_DIR = path.join(process.cwd(), ".next", "cache", "chimpions");
const LOCAL_OVERRIDES_FILE = path.join(LOCAL_DIR, "twitter-overrides.json");
const LOCAL_SCRAPED_FILE = path.join(LOCAL_DIR, "twitter-scraped.json");

async function readLocalFile(
  filepath: string,
): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeLocalFile(
  filepath: string,
  data: Record<string, string>,
): Promise<void> {
  try {
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`[twitter-cache] failed to write ${filepath}:`, err);
  }
}

export async function setTwitterOverrides(
  entries: Record<string, string>,
): Promise<number> {
  const cleaned: Record<string, string> = {};
  for (const [mint, raw] of Object.entries(entries)) {
    const handle = raw.trim().replace(/^@/, "");
    if (mint && handle) cleaned[mint] = handle;
  }
  const count = Object.keys(cleaned).length;
  if (count === 0) return 0;

  const redis = getRedis();
  if (redis) {
    await redis.hset(KV_KEY, cleaned);
    console.log(`[overrides] persisted ${count} mint→twitter pairs to KV`);
  } else {
    const existing = await readLocalFile(LOCAL_OVERRIDES_FILE);
    await writeLocalFile(LOCAL_OVERRIDES_FILE, { ...existing, ...cleaned });
    console.log(
      `[overrides] persisted ${count} mint→twitter pairs to local file (KV not configured)`,
    );
  }
  return count;
}

export async function getTwitterOverrides(): Promise<Record<string, string>> {
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.hgetall<Record<string, string>>(KV_KEY);
      return data ?? {};
    } catch (err) {
      console.warn("[overrides] failed to read KV:", err);
      return {};
    }
  }
  return readLocalFile(LOCAL_OVERRIDES_FILE);
}

export async function deleteTwitterOverride(mint: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.hdel(KV_KEY, mint);
    return;
  }
  const data = await readLocalFile(LOCAL_OVERRIDES_FILE);
  delete data[mint];
  await writeLocalFile(LOCAL_OVERRIDES_FILE, data);
}

export async function clearAllTwitterOverrides(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(KV_KEY);
  } else {
    await writeLocalFile(LOCAL_OVERRIDES_FILE, {});
  }
  console.log("[overrides] cleared all twitter overrides");
}

const NULL_SENTINEL = "__null__";

export async function setScrapedTwitter(
  username: string,
  handle: string | null,
): Promise<void> {
  const value = handle ?? NULL_SENTINEL;
  const redis = getRedis();
  if (redis) {
    await redis.hset(KV_SCRAPED_KEY, { [username]: value });
    return;
  }
  const existing = await readLocalFile(LOCAL_SCRAPED_FILE);
  existing[username] = value;
  await writeLocalFile(LOCAL_SCRAPED_FILE, existing);
}

export async function getAllScrapedTwitters(): Promise<
  Record<string, string | null>
> {
  let raw: Record<string, string> = {};
  const redis = getRedis();
  if (redis) {
    try {
      raw =
        (await redis.hgetall<Record<string, string>>(KV_SCRAPED_KEY)) ?? {};
    } catch (err) {
      console.warn("[twitter-cache] failed to read KV:", err);
      return {};
    }
  } else {
    raw = await readLocalFile(LOCAL_SCRAPED_FILE);
  }
  const out: Record<string, string | null> = {};
  for (const [username, value] of Object.entries(raw)) {
    out[username] = value === NULL_SENTINEL ? null : value;
  }
  return out;
}

export async function clearAllScrapedTwitters(): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(KV_SCRAPED_KEY);
  } else {
    await writeLocalFile(LOCAL_SCRAPED_FILE, {});
  }
  console.log("[twitter-cache] cleared all scraped twitter entries");
}
