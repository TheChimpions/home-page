/**
 * Rebuild the wallet → Matrica identity table by scraping matrica.io NFT pages.
 *
 *   pnpm scrape-matrica                 # every chimp in the collection → KV
 *   pnpm scrape-matrica --dry-run       # fetch and print, write nothing
 *   pnpm scrape-matrica --mint <mint>   # one page, printed in full
 *   pnpm scrape-matrica --concurrency 8
 *
 * Reads HELIUS_API_KEY and the KV_REST_API_* variables from .env.local. Rows
 * are upserted, so wallets not seen in this run keep their stored identity.
 * Run this locally if the Inngest cron can't reach matrica.io from Vercel.
 */
import {
  fetchMatricaNftPage,
  scrapeMatricaOwners,
} from "../src/lib/matrica";
import {
  getAllMatricaByWallet,
  setMatricaByWallet,
} from "../src/lib/enrichment-cache";
import { COLLECTION_ADDRESS } from "../src/lib/collection";

function loadEnv() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fine when the variables are already in the environment.
  }
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function fetchCollectionMints(): Promise<string[]> {
  const key = process.env.HELIUS_API_KEY;
  if (!key) throw new Error("HELIUS_API_KEY is not set");
  const mints: string[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "scrape-matrica",
        method: "getAssetsByGroup",
        params: {
          groupKey: "collection",
          groupValue: COLLECTION_ADDRESS,
          limit: 1000,
          page,
        },
      }),
    });
    if (!res.ok) throw new Error(`Helius ${res.status} ${res.statusText}`);
    const body = (await res.json()) as {
      error?: unknown;
      result?: { items?: { id: string }[] };
    };
    if (body.error) throw new Error(`Helius: ${JSON.stringify(body.error)}`);
    const items = body.result?.items ?? [];
    mints.push(...items.map((i) => i.id));
    if (items.length < 1000) break;
  }
  return mints;
}

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  const single = arg("--mint");
  const concurrency = Number(arg("--concurrency") ?? 4);

  if (single) {
    const res = await fetchMatricaNftPage(single);
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  const mints = await fetchCollectionMints();
  console.log(`collection ${COLLECTION_ADDRESS}: ${mints.length} mints`);

  const t0 = Date.now();
  const scrape = await scrapeMatricaOwners(mints, { concurrency });
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  const withUsername = Object.values(scrape.entries).filter(
    (e) => e.username,
  ).length;

  console.log(
    `scraped in ${seconds}s: ${scrape.resolved} pages with owner (${withUsername} registered), ` +
      `${scrape.noOwner} without owner, ${scrape.notFound} unknown mints, ${scrape.failed} failed`,
  );
  if (scrape.firstError) console.log(`first error: ${scrape.firstError}`);

  if (dryRun) {
    for (const [wallet, e] of Object.entries(scrape.entries)) {
      if (e.username) {
        console.log(
          `${wallet}  ${e.username}${e.twitter ? `  @${e.twitter}` : ""}`,
        );
      }
    }
    console.log("dry run: nothing written");
    return;
  }

  if (scrape.resolved === 0) {
    console.error("no owners resolved; refusing to write");
    process.exitCode = 1;
    return;
  }

  const before = await getAllMatricaByWallet();
  const beforeNamed = Object.values(before).filter((e) => e.username).length;
  await setMatricaByWallet(scrape.entries);
  const after = await getAllMatricaByWallet();
  const afterNamed = Object.values(after).filter((e) => e.username).length;
  console.log(
    `KV matrica table: ${Object.keys(before).length} rows / ${beforeNamed} named → ` +
      `${Object.keys(after).length} rows / ${afterNamed} named`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
