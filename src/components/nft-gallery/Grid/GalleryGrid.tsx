"use client";

import Image from "next/image";
import { NFTFilters } from "@/types/nft";
import { useNFTs } from "@/hooks/use-nfts";
import NFTCardSkeleton from "./NFTCardSkeleton";

const details = [
  { label: "Tribe", value: "tribe", icon: "/assets/tribe.svg" },
  { label: "Type", value: "type", icon: "/assets/type.svg" },
  { label: "Holder", value: "holder", icon: "/assets/holder.svg" },
  { label: "Artist", value: "artist", icon: "/assets/artist.svg" },
];

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        {allNFTs.map((nft) => (
          <div
            key={nft.tokenId}
            className="rounded-md border flex flex-col gap-4 border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)]"
          >
            <h3 className="text-white font-semibold text-xl">{nft.name}</h3>

            <div className="relative w-full aspect-square overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950">
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 240px, 100vw"
                className="object-cover [image-rendering:pixelated]"
                loading="lazy"
                unoptimized
              />
            </div>

            <div className="flex flex-col gap-2">
              {details.map((detail) => {
                const value = nft[detail.value as keyof typeof nft];
                return (
                  <div
                    key={`${nft.tokenId}-${detail.label}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={detail.icon}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5"
                      />
                      <span className="text-white text-xl">
                        {detail.label}:
                      </span>
                    </div>
                    <span
                      className="text-white text-xl truncate max-w-50"
                      title={String(value || "Unknown")}
                    >
                      {String(value || "Unknown")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-8 xl:mt-18">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex cursor-pointer text-xl items-center gap-2 border border-gray-modern-700 font-semibold px-4 py-2 text-xs font-sans text-white transition-colors hover:bg-gray-modern-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? (
              <span className="text-xl flex flex-row items-center gap-2">
                Loading
                <span className="animate-pulse">...</span>
              </span>
            ) : (
              <span className="text-xl flex flex-row items-center gap-2">
                See more
                <span className="text-3xl leading-none">+</span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
