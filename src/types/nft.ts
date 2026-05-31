export interface NFTListing {
  marketplace: "magiceden" | "tensor";
  url: string;
  price: number | null;
  seller: string;
}

export interface ProvenanceOwner {
  /** Wallet address of this owner. */
  wallet: string;
  /** Matrica username, when the wallet is linked to a Matrica profile. */
  username: string | null;
  /** Matrica profile picture, when available. */
  pfp: string | null;
  /** Unix timestamp (seconds) this owner acquired the NFT, when known. */
  acquiredAt: number | null;
  /** True for the present owner (first entry in the newest-first list). */
  current: boolean;
}

export interface ChimpionMetadata {
  tokenId: number;
  mint?: string;
  name: string;
  image: string;
  animationUrl?: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  tribe?: string;
  type?: string;
  holder?: string;
  holderName?: string;
  holderTwitter?: string;
  listing?: NFTListing;
  artist?: string;
  /** Ownership history (newest owner first), reconstructed from on-chain transfers. */
  provenance?: ProvenanceOwner[];
}

export interface NFTFilters {
  tribe?: string;
  type?: string;
  search?: string;
}

export interface PaginatedNFTs {
  nfts: ChimpionMetadata[];
  hasMore: boolean;
  nextPage: number;
  total: number;
}
