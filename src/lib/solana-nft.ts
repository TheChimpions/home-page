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
    return [];
  }

  const fresh = cachedNFTs && Date.now() - lastFetch < CACHE_DURATION;

  if (fresh) {
    console.log("Returning cached NFTs");
    return cachedNFTs!;
  }

  if (cachedNFTs) {
    if (!refreshPromise) {
      console.log("Cache stale: returning old data, refreshing in background");
      startBackgroundRefresh();
    }
    return cachedNFTs;
  }

  if (!refreshPromise) startBackgroundRefresh();
  return refreshPromise!;
}

export function startBackgroundRefresh(): void {
  if (refreshPromise) return;
  refreshStartedAt = Date.now();
  refreshPromise = doFetch().finally(() => {
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
  try {
    console.log("Fetching NFTs from Helius DAS API...");
    console.log("Creator Address:", CREATOR_ADDRESS);

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
    console.log(`Found ${assets.length} NFTs from Helius`);

    if (assets.length === 0) {
      console.warn("No NFTs found. Check if the creator address is correct.");
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

    await Promise.all([resolveHolderNames(nfts), applyListings(nfts)]);

    cachedNFTs = nfts;
    lastFetch = Date.now();

    console.log(`Successfully fetched and cached ${nfts.length} NFTs`);

    return nfts;
  } catch (error) {
    console.error("Error fetching Chimpions:", error);

    if (cachedNFTs) {
      console.log("Returning stale cache due to error");
      return cachedNFTs;
    }

    console.log("No cache available, returning empty array");
    return [];
  }
}

export function clearCache() {
  cachedNFTs = null;
  lastFetch = 0;
  console.log("Cache cleared");
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
      `Matrica scrape: budget exhausted at ${scrapesAttempted}/${needsScrape.length} (next render will continue)`,
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
    `Matrica: ${uniqueResolved}/${uniqueHolders.length} unique holders resolved (${nftsWithName}/${nfts.length} NFTs labeled)`,
  );
}

async function applyListings(nfts: ChimpionMetadata[]): Promise<void> {
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
    `Marketplace: ${listedFromApi} ME API + ${tensorListed} Tensor SDK + ${listedByHolder} holder fallback = ${total}/${nfts.length} NFTs marked as Listed`,
  );
}
