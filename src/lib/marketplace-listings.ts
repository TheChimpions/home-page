import { NFTListing } from "@/types/nft";
import { orbisItemUrl } from "@/lib/utils";

interface MEListing {
  tokenMint: string;
  price: number;
  seller: string;
}

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";
const COLLECTION = "the_chimpions";
const PAGE_LIMIT = 20;
const MAX_PAGES = 11;

interface MarketplaceMatch {
  marketplace: NFTListing["marketplace"];
  urlBuilder: (mint: string) => string;
}

export const MARKETPLACE_REGISTRY: Record<string, MarketplaceMatch> = {
  TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp: {
    marketplace: "tensor",
    urlBuilder: orbisItemUrl,
  },
  TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN: {
    marketplace: "tensor",
    urlBuilder: orbisItemUrl,
  },
  "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix": {
    marketplace: "magiceden",
    urlBuilder: orbisItemUrl,
  },
  M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K: {
    marketplace: "magiceden",
    urlBuilder: orbisItemUrl,
  },
};

export const MARKETPLACE_ADDRESSES = new Set<string>(
  Object.keys(MARKETPLACE_REGISTRY),
);

export function detectListingByHolder(
  holder: string | undefined,
  mint: string | undefined,
): NFTListing | null {
  if (!holder || !mint) return null;
  const match = MARKETPLACE_REGISTRY[holder];
  if (!match) return null;
  return {
    marketplace: match.marketplace,
    url: match.urlBuilder(mint),
    price: null,
    seller: "",
  };
}

/**
 * All active Magic Eden listings for the collection, or null when any page
 * failed to load. A partial result would read as "delisted" for every mint on
 * the missing pages, so callers should keep their previous listings on null.
 */
export async function fetchActiveListings(): Promise<Map<string, NFTListing> | null> {
  const result = new Map<string, NFTListing>();

  try {
    const offsets = Array.from(
      { length: MAX_PAGES },
      (_, i) => i * PAGE_LIMIT,
    );
    const pages = await Promise.all(
      offsets.map((offset) =>
        fetch(
          `${ME_BASE}/collections/${COLLECTION}/listings?offset=${offset}&limit=${PAGE_LIMIT}`,
          { next: { revalidate: 60 } },
        )
          .then((r) => (r.ok ? (r.json() as Promise<MEListing[]>) : null))
          .catch(() => null),
      ),
    );

    for (const page of pages) {
      if (!Array.isArray(page)) {
        console.warn("Failed to fetch active listings: a page did not load");
        return null;
      }
      for (const item of page) {
        result.set(item.tokenMint, {
          marketplace: "magiceden",
          url: orbisItemUrl(item.tokenMint),
          price: item.price,
          seller: item.seller,
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch active listings:", err);
    return null;
  }

  return result;
}
