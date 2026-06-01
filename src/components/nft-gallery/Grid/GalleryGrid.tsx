"use client";

import { useEffect, useRef } from "react";
import { NFTFilters } from "@/types/nft";
import { useNFTs } from "@/hooks/use-nfts";
import NFTCard from "./NFTCard";
import NFTCardSkeleton from "./NFTCardSkeleton";
import FadeUp from "@/components/ui/FadeUp";

interface GalleryGridProps {
  filters: NFTFilters;
}

export default function GalleryGrid({ filters }: GalleryGridProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useNFTs(filters);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-red-400 text-sm">
          Error loading NFTs. Please try again.
        </div>
      </div>
    );
  }

  const allNFTs = data?.pages.flatMap((page) => page.nfts) ?? [];

  if (allNFTs.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-modern-400 text-xl">
          No Chimpions found with these filters.
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
        {allNFTs.map((nft, i) => (
          <FadeUp key={nft.tokenId} delay={(i % 4) * 80}>
            <NFTCard nft={nft} />
          </FadeUp>
        ))}
      </div>

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="flex justify-center mt-8 xl:mt-18 min-h-12"
        >
          {isFetchingNextPage && (
            <span className="text-xl text-gray-modern-300 flex flex-row items-center gap-2">
              Loading
              <span className="animate-pulse">...</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
