import { ChimpionMetadata } from "@/types/nft";
import {
  getMatricaProfileByWallet,
  getMatricaDisplayName,
  getMatricaTwitterHandle,
  getMatricaUsername,
} from "./matrica";
import { scrapeTwitterForProfile } from "./matrica-scraper";
import {
  detectListingByHolder,
  fetchActiveListings,
} from "./marketplace-listings";
import { fetchTensorListingsBatch } from "./tensor-listings";

interface HeliusAssetFile {
  mime?: string;
  cdn_uri?: string;
  uri?: string;
}

interface HeliusAssetMetadata {
  name?: string;
  animation_url?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: HeliusAssetMetadata;
    json_uri?: string;
    files?: HeliusAssetFile[];
    links?: { image?: string };
  };
  ownership?: { owner?: string };
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const CREATOR_ADDRESS =
  process.env.NEXT_PUBLIC_CREATOR_ADDRESS ||
  "D7hKRyCsdaaSGVGwSAgcEfkSofBb6gn68UPD3yWW59zW";

let cachedNFTs: ChimpionMetadata[] | null = null;
let lastFetch: number = 0;
let refreshPromise: Promise<ChimpionMetadata[]> | null = null;
let refreshStartedAt: number = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export async function fetchAllChimpions(): Promise<ChimpionMetadata[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("[cache] build phase: returning []");
    return [];
  }

  const fresh = cachedNFTs && Date.now() - lastFetch < CACHE_DURATION;

  if (fresh) {
    const ageMin = Math.floor((Date.now() - lastFetch) / 60_000);
    console.log(
      `[cache] HIT (fresh, age=${ageMin}m, count=${cachedNFTs!.length})`,
    );
    return cachedNFTs!;
  }

  if (cachedNFTs) {
    if (!refreshPromise) {
      const ageMin = Math.floor((Date.now() - lastFetch) / 60_000);
      console.log(
        `[cache] STALE (age=${ageMin}m, count=${cachedNFTs.length}) → returning stale + background refresh`,
      );
      startBackgroundRefresh();
    } else {
      console.log("[cache] STALE → returning stale (refresh already in flight)");
    }
    return cachedNFTs;
  }

  console.log("[cache] EMPTY → blocking on first fetch");
  if (!refreshPromise) startBackgroundRefresh();
  return refreshPromise!;
}

export function startBackgroundRefresh(): void {
  if (refreshPromise) {
    console.log("[refresh] skip (already in flight)");
    return;
  }
  refreshStartedAt = Date.now();
  console.log("[refresh] starting background refresh");
  refreshPromise = doFetch().finally(() => {
    const ms = Date.now() - refreshStartedAt;
    console.log(`[refresh] complete in ${(ms / 1000).toFixed(1)}s`);
    refreshPromise = null;
  });
}

export function isRefreshing(): boolean {
  return refreshPromise !== null;
}

export function getRefreshStartedAt(): number | null {
  return refreshPromise ? refreshStartedAt : null;
}

async function doFetch(): Promise<ChimpionMetadata[]> {
  const t0 = Date.now();
  try {
    console.log(`[helius] fetching getAssetsByCreator (${CREATOR_ADDRESS})`);

    if (!HELIUS_API_KEY) {
      throw new Error("HELIUS_API_KEY is not configured in .env.local");
    }

    const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "the-chimpions",
        method: "getAssetsByCreator",
        params: {
          creatorAddress: CREATOR_ADDRESS,
          onlyVerified: true,
          limit: 1000,
          page: 1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Helius API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Helius API error: ${JSON.stringify(data.error)}`);
    }

    const assets = data.result?.items || [];
    console.log(
      `[helius] returned ${assets.length} assets in ${Date.now() - t0}ms`,
    );

    if (assets.length === 0) {
      console.warn("[helius] no NFTs found — creator address may be wrong");
      return [];
    }

    const nftsPromises = (assets as HeliusAsset[]).map(async (asset, index) => {
      try {
        const metadata = asset.content?.metadata;
        const jsonUri = asset.content?.json_uri;

        let fullMetadata: HeliusAssetMetadata | undefined = metadata;
        if (
          jsonUri &&
          (!metadata?.attributes || metadata.attributes.length === 0)
        ) {
          try {
            const metaResponse = await fetch(jsonUri);
            if (metaResponse.ok) {
              fullMetadata = await metaResponse.json();
            }
          } catch (err) {
            console.warn(`Failed to fetch metadata from ${jsonUri}:`, err);
          }
        }

        const attributes =
          fullMetadata?.attributes || asset.content?.metadata?.attributes || [];

        const tribe = attributes.find(
          (attr) => attr.trait_type === "Tribe",
        )?.value;

        const type = attributes.find(
          (attr) => attr.trait_type === "Type",
        )?.value;

        const artists = attributes
          .filter((attr) => attr.trait_type?.includes("Artist"))
          .map((attr) => attr.value)
          .join(", ");

        const files = asset.content?.files || [];
        const gifFile = files.find(
          (f) => f.mime === "image/gif" || f.cdn_uri?.includes(".gif"),
        );

        const image =
          fullMetadata?.animation_url ||
          gifFile?.cdn_uri ||
          gifFile?.uri ||
          asset.content?.links?.image ||
          fullMetadata?.image ||
          files[0]?.cdn_uri ||
          files[0]?.uri ||
          "";

        return {
          tokenId: index + 1,
          mint: asset.id,
          name:
            fullMetadata?.name || metadata?.name || `Chimpion #${index + 1}`,
          image,
          animationUrl: fullMetadata?.animation_url || image,
          attributes,
          tribe: tribe || "Unknown",
          type: type || "1/1",
          artist: artists || "Unknown",
          holder: asset.ownership?.owner || "Unknown",
        };
      } catch (error) {
        console.error(`Error processing NFT ${index}:`, error);
        return null;
      }
    });

    const nfts = (await Promise.all(nftsPromises)).filter(
      (nft) => nft !== null,
    ) as ChimpionMetadata[];

    nfts.sort((a, b) => a.name.localeCompare(b.name));

    nfts.forEach((nft, index) => {
      nft.tokenId = index + 1;
    });

    console.log(
      `[helius] assembled ${nfts.length} NFTs in ${Date.now() - t0}ms — running enrichment`,
    );

    await Promise.all([resolveHolderNames(nfts), applyListings(nfts)]);

    cachedNFTs = nfts;
    lastFetch = Date.now();

    console.log(
      `[cache] populated: ${nfts.length} NFTs in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
    );

    return nfts;
  } catch (error) {
    console.error("[cache] fetch error:", error);

    if (cachedNFTs) {
      console.log("[cache] returning stale due to error");
      return cachedNFTs;
    }

    console.log("[cache] no fallback available, returning []");
    return [];
  }
}

export function clearCache() {
  const had = cachedNFTs !== null;
  cachedNFTs = null;
  lastFetch = 0;
  console.log(`[cache] cleared (had=${had})`);
}

export function getCacheAgeMs(): number | null {
  return lastFetch > 0 ? Date.now() - lastFetch : null;
}

export function getCacheSnapshot(): {
  hasCache: boolean;
  ageMs: number | null;
  ttlMs: number;
  count: number;
  nfts: ChimpionMetadata[];
} {
  return {
    hasCache: cachedNFTs !== null,
    ageMs: lastFetch > 0 ? Date.now() - lastFetch : null,
    ttlMs: CACHE_DURATION,
    count: cachedNFTs?.length ?? 0,
    nfts: cachedNFTs ?? [],
  };
}

export async function scrapePendingTwitters(opts: {
  budgetMs?: number;
} = {}): Promise<{ total: number; attempted: number; resolved: number }> {
  if (!cachedNFTs) return { total: 0, attempted: 0, resolved: 0 };

  const targets = new Map<string, ChimpionMetadata[]>();
  for (const nft of cachedNFTs) {
    if (!nft.holder || !nft.holderName || nft.holderTwitter) continue;
    const list = targets.get(nft.holder) ?? [];
    list.push(nft);
    targets.set(nft.holder, list);
  }

  const wallets = [...targets.keys()];
  const total = wallets.length;
  if (total === 0) {
    console.log("[scrape-twitters] no pending users");
    return { total: 0, attempted: 0, resolved: 0 };
  }

  const SCRAPE_CONCURRENCY = 2;
  const budgetMs = opts.budgetMs ?? 50_000;
  const startedAt = Date.now();
  let cursor = 0;
  let attempted = 0;
  let resolved = 0;

  console.log(
    `[scrape-twitters] starting (pending=${total}, budget=${budgetMs / 1000}s, concurrency=${SCRAPE_CONCURRENCY})`,
  );

  await Promise.all(
    Array.from(
      { length: Math.min(SCRAPE_CONCURRENCY, wallets.length) },
      async () => {
        while (true) {
          if (Date.now() - startedAt > budgetMs) return;
          const i = cursor++;
          if (i >= wallets.length) return;
          const wallet = wallets[i];
          attempted++;
          const profile = await getMatricaProfileByWallet(wallet);
          const handle = await scrapeTwitterForProfile(profile);
          if (handle) {
            const nfts = targets.get(wallet) ?? [];
            for (const nft of nfts) nft.holderTwitter = handle;
            resolved++;
          }
        }
      },
    ),
  );

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `[scrape-twitters] done: resolved=${resolved} attempted=${attempted} pending_remaining=${total - attempted} elapsed=${elapsed}s`,
  );

  return { total, attempted, resolved };
}

async function resolveHolderNames(nfts: ChimpionMetadata[]): Promise<void> {
  const uniqueHolders = Array.from(
    new Set(
      nfts
        .map((nft) => nft.holder)
        .filter((h): h is string => !!h && h !== "Unknown"),
    ),
  );

  const API_CONCURRENCY = 8;
  const profileByHolder = new Map<
    string,
    { name: string | null; twitter: string | null }
  >();
  const needsScrape: {
    wallet: string;
    profile: Awaited<ReturnType<typeof getMatricaProfileByWallet>>;
  }[] = [];

  let apiCursor = 0;
  await Promise.all(
    Array.from(
      { length: Math.min(API_CONCURRENCY, uniqueHolders.length) },
      async () => {
        while (true) {
          const i = apiCursor++;
          if (i >= uniqueHolders.length) return;
          const wallet = uniqueHolders[i];
          const profile = await getMatricaProfileByWallet(wallet);
          const username = getMatricaUsername(profile);
          const aboutTwitter = getMatricaTwitterHandle(profile);
          profileByHolder.set(wallet, {
            name: getMatricaDisplayName(profile),
            twitter: aboutTwitter,
          });
          if (!aboutTwitter && username) {
            needsScrape.push({ wallet, profile });
          }
        }
      },
    ),
  );

  const SCRAPE_CONCURRENCY = 2;
  const SCRAPE_BUDGET_MS = 15_000;
  const scrapeStart = Date.now();
  let scrapeCursor = 0;
  let scrapesAttempted = 0;
  await Promise.all(
    Array.from(
      { length: Math.min(SCRAPE_CONCURRENCY, needsScrape.length) },
      async () => {
        while (true) {
          if (Date.now() - scrapeStart > SCRAPE_BUDGET_MS) return;
          const i = scrapeCursor++;
          if (i >= needsScrape.length) return;
          const { wallet, profile } = needsScrape[i];
          scrapesAttempted++;
          const handle = await scrapeTwitterForProfile(profile);
          if (handle) {
            const entry = profileByHolder.get(wallet);
            if (entry) entry.twitter = handle;
          }
        }
      },
    ),
  );

  if (scrapesAttempted < needsScrape.length) {
    console.log(
      `[matrica] scrape budget exhausted at ${scrapesAttempted}/${needsScrape.length} (next render will continue)`,
    );
  } else if (scrapesAttempted > 0) {
    console.log(
      `[matrica] scraped ${scrapesAttempted}/${needsScrape.length} pending users`,
    );
  }

  let nftsWithName = 0;
  for (const nft of nfts) {
    if (!nft.holder) continue;
    const entry = profileByHolder.get(nft.holder);
    if (!entry) continue;
    if (entry.name) {
      nft.holderName = entry.name;
      nftsWithName++;
    }
    if (entry.twitter) {
      nft.holderTwitter = entry.twitter;
    }
  }

  const uniqueResolved = [...profileByHolder.values()].filter(
    (p) => p.name !== null,
  ).length;
  console.log(
    `[matrica] resolved ${uniqueResolved}/${uniqueHolders.length} unique holders (${nftsWithName}/${nfts.length} NFTs labeled)`,
  );
}

async function applyListings(nfts: ChimpionMetadata[]): Promise<void> {
  const t0 = Date.now();
  const meListings = await fetchActiveListings();

  let listedFromApi = 0;
  for (const nft of nfts) {
    if (!nft.mint) continue;
    const apiListing = meListings.get(nft.mint);
    if (apiListing) {
      nft.listing = apiListing;
      listedFromApi++;
    }
  }

  const tensorCandidates = nfts
    .filter((n) => !n.listing && n.mint)
    .map((n) => n.mint!);

  let tensorListed = 0;
  if (tensorCandidates.length > 0) {
    const tensorListings = await fetchTensorListingsBatch(tensorCandidates);
    for (const nft of nfts) {
      if (nft.listing || !nft.mint) continue;
      const t = tensorListings.get(nft.mint);
      if (t) {
        nft.listing = t;
        tensorListed++;
      }
    }
  }

  let listedByHolder = 0;
  for (const nft of nfts) {
    if (nft.listing || !nft.mint) continue;
    const holderListing = detectListingByHolder(nft.holder, nft.mint);
    if (holderListing) {
      nft.listing = holderListing;
      listedByHolder++;
    }
  }

  const total = listedFromApi + tensorListed + listedByHolder;
  console.log(
    `[listings] ${listedFromApi} ME + ${tensorListed} Tensor + ${listedByHolder} holder = ${total}/${nfts.length} listed (${Date.now() - t0}ms)`,
  );
}
