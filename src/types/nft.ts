export interface ChimpionMetadata {
  tokenId: number;
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
