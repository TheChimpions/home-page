import type { ChimpListing } from "@/types/listing";
import { summarizeChimpAsset, type HeliusAsset } from "@/lib/helius-asset";
import type { SwapListing } from "./accounts";

/**
 * Join on-chain listings with their Helius metadata. Listings whose asset
 * lookup failed are dropped rather than shown as blank cards.
 */
export function toChimpListings(
  listings: SwapListing[],
  assets: HeliusAsset[],
): ChimpListing[] {
  const byMint = new Map(assets.map((a) => [a.id, a]));
  const out: ChimpListing[] = [];
  for (const listing of listings) {
    const asset = byMint.get(listing.mint);
    if (!asset) continue;
    const summary = summarizeChimpAsset(asset);
    out.push({
      ...summary,
      holder: listing.owner,
      seller: listing.owner,
      listing: listing.address,
      tokenAccount: listing.tokenAccount,
      listedAt: listing.createdAt,
      source: "chimp-swap",
    });
  }
  return out.sort((a, b) => b.listedAt - a.listedAt);
}

/** The on-chain fields a swap transaction needs, recovered from an enriched listing. */
export function toSwapListing(listing: ChimpListing): SwapListing {
  return {
    address: listing.listing,
    owner: listing.seller,
    mint: listing.mint,
    tokenAccount: listing.tokenAccount,
    createdAt: listing.listedAt,
  };
}
