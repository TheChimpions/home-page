import { ChimpionMetadata } from "@/types/nft";
import {
  getMatricaProfileByWallet,
  getMatricaDisplayName,
  getMatricaTwitterHandle,
  getMatricaUsername,
} from "./matrica";
import { scrapeMatricaTwitter } from "./matrica-scraper";
import { fetchActiveListings } from "./marketplace-listings";

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
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchAllChimpions(): Promise<ChimpionMetadata[]> {
  if (cachedNFTs && Date.now() - lastFetch < CACHE_DURATION) {
    console.log("Returning cached NFTs");
    return cachedNFTs;
  }

  try {
    console.log("Fetching NFTs from Helius DAS API...");
    console.log("Creator Address:", CREATOR_ADDRESS);

    if (!HELIUS_API_KEY) {
      throw new Error(
        "HELIUS_API_KEY is not configured in .env.local",
      );
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
      console.warn(
        "No NFTs found. Check if the creator address is correct.",
      );
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

    if (nfts.length > 0) {
      console.log("First NFT example:", {
        name: nfts[0].name,
        tribe: nfts[0].tribe,
        type: nfts[0].type,
        holder: nfts[0].holder,
        holderName: nfts[0].holderName,
        hasImage: !!nfts[0].image,
      });
    }

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

  const CONCURRENCY = 8;
  const profileByHolder = new Map<
    string,
    { name: string | null; twitter: string | null }
  >();

  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(CONCURRENCY, uniqueHolders.length) },
    async () => {
      while (true) {
        const i = cursor++;
        if (i >= uniqueHolders.length) return;
        const wallet = uniqueHolders[i];
        const profile = await getMatricaProfileByWallet(wallet);
        const username = getMatricaUsername(profile);
        let twitter = getMatricaTwitterHandle(profile);
        if (!twitter && username) {
          twitter = await scrapeMatricaTwitter(username);
        }
        profileByHolder.set(wallet, {
          name: getMatricaDisplayName(profile),
          twitter,
        });
      }
    },
  );
  await Promise.all(workers);

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
  const listings = await fetchActiveListings();
  if (listings.size === 0) return;

  let listed = 0;
  for (const nft of nfts) {
    if (!nft.mint) continue;
    const listing = listings.get(nft.mint);
    if (listing) {
      nft.listing = listing;
      listed++;
    }
  }

  console.log(`Marketplace: ${listed}/${nfts.length} NFTs marked as Listed`);
}
