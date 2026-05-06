export interface NFTListing {
  marketplace: "magiceden" | "tensor";
  url: string;
  price: number;
  seller: string;
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
