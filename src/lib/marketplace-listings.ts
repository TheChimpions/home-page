import { NFTListing } from "@/types/nft";

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
    urlBuilder: (mint) => `https://www.tensor.trade/item/${mint}`,
  },
  TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN: {
    marketplace: "tensor",
    urlBuilder: (mint) => `https://www.tensor.trade/item/${mint}`,
  },
  "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix": {
    marketplace: "magiceden",
    urlBuilder: (mint) => `https://magiceden.io/item-details/${mint}`,
  },
  M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K: {
    marketplace: "magiceden",
    urlBuilder: (mint) => `https://magiceden.io/item-details/${mint}`,
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

export async function fetchActiveListings(): Promise<Map<string, NFTListing>> {
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
          .then((r) => (r.ok ? (r.json() as Promise<MEListing[]>) : []))
          .catch(() => [] as MEListing[]),
      ),
    );

    for (const page of pages) {
      for (const item of page) {
        result.set(item.tokenMint, {
          marketplace: "magiceden",
          url: `https://magiceden.io/item-details/${item.tokenMint}`,
          price: item.price,
          seller: item.seller,
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch active listings:", err);
  }

  return result;
}
