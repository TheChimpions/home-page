import { kv } from "@vercel/kv";

const KV_KEY = "chimpions:twitter-overrides:by-mint";
const KV_SCRAPED_KEY = "chimpions:twitter-scraped:by-username";

function isKvConfigured(): boolean {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
}

export async function setTwitterOverrides(
  entries: Record<string, string>,
): Promise<number> {
  if (!isKvConfigured()) {
    console.warn("[overrides] KV not configured — overrides not persisted");
    return 0;
  }
  const cleaned: Record<string, string> = {};
  for (const [mint, raw] of Object.entries(entries)) {
    const handle = raw.trim().replace(/^@/, "");
    if (mint && handle) cleaned[mint] = handle;
  }
  const count = Object.keys(cleaned).length;
  if (count === 0) return 0;
  await kv.hset(KV_KEY, cleaned);
  console.log(`[overrides] persisted ${count} mint→twitter pairs to KV`);
  return count;
}

export async function getTwitterOverrides(): Promise<Record<string, string>> {
  if (!isKvConfigured()) return {};
  try {
    const data = await kv.hgetall<Record<string, string>>(KV_KEY);
    return data ?? {};
  } catch (err) {
    console.warn("[overrides] failed to read KV:", err);
    return {};
  }
}

export async function deleteTwitterOverride(mint: string): Promise<void> {
  if (!isKvConfigured()) return;
  await kv.hdel(KV_KEY, mint);
}

export async function clearAllTwitterOverrides(): Promise<void> {
  if (!isKvConfigured()) return;
  await kv.del(KV_KEY);
  console.log("[overrides] cleared all twitter overrides");
}

const NULL_SENTINEL = "__null__";

export async function setScrapedTwitter(
  username: string,
  handle: string | null,
): Promise<void> {
  if (!isKvConfigured()) return;
  const value = handle ?? NULL_SENTINEL;
  await kv.hset(KV_SCRAPED_KEY, { [username]: value });
}

export async function getAllScrapedTwitters(): Promise<
  Record<string, string | null>
> {
  if (!isKvConfigured()) return {};
  try {
    const data =
      (await kv.hgetall<Record<string, string>>(KV_SCRAPED_KEY)) ?? {};
    const out: Record<string, string | null> = {};
    for (const [username, value] of Object.entries(data)) {
      out[username] = value === NULL_SENTINEL ? null : value;
    }
    return out;
  } catch (err) {
    console.warn("[twitter-cache] failed to read KV:", err);
    return {};
  }
}

export async function clearAllScrapedTwitters(): Promise<void> {
  if (!isKvConfigured()) return;
  await kv.del(KV_SCRAPED_KEY);
  console.log("[twitter-cache] cleared all scraped twitter entries");
}
