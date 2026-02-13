import { useInfiniteQuery } from '@tanstack/react-query';
import { NFTFilters, PaginatedNFTs } from '@/types/nft';
import { NFTCache } from '@/lib/nft-cache';
import { getFilterHash } from '@/lib/utils';

async function fetchNFTs(
  page: number,
  filters: NFTFilters
): Promise<PaginatedNFTs> {
  const filterHash = getFilterHash(filters);

  const cached = NFTCache.get(page, filterHash);
  if (cached && cached.length > 0) {
    return {
      nfts: cached,
      hasMore: true, 
      nextPage: page + 1,
      total: 222,
    };
  }

  const params = new URLSearchParams({
    page: page.toString(),
    ...(filters.tribe && { tribe: filters.tribe }),
    ...(filters.type && { type: filters.type }),
    ...(filters.search && { search: filters.search }),
  });

  const response = await fetch(`/api/nfts?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch NFTs');
  }

  const data: PaginatedNFTs = await response.json();

  NFTCache.set(page, data.nfts, filterHash);

  return data;
}

export function useNFTs(filters: NFTFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['nfts', filters],
    queryFn: ({ pageParam = 1 }) => fetchNFTs(pageParam, filters),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, 
  });
}
