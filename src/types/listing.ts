import type { ChimpAssetSummary } from "@/lib/helius-asset";

/** A Chimpion posted on the swap board, enriched with its metadata. */
export interface ChimpListing extends ChimpAssetSummary {
  /** Wallet that posted the listing (still holds the frozen NFT). */
  seller: string;
  /** Listing PDA. */
  listing: string;
  /** Seller's token account holding the NFT. */
  tokenAccount: string;
  /** Unix seconds. */
  listedAt: number;
  source: "chimp-swap";
}

/** A Chimpion in the connected wallet, as returned by /api/my-chimps. */
export type MyChimp = ChimpAssetSummary;
