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
