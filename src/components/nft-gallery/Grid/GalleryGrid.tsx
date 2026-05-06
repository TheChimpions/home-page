"use client";

import Image from "next/image";
import { NFTFilters } from "@/types/nft";
import { useNFTs } from "@/hooks/use-nfts";
import { truncateAddress } from "@/lib/utils";
import NFTCardSkeleton from "./NFTCardSkeleton";
import FadeUp from "@/components/ui/FadeUp";

const details = [
  { label: "Tribe", value: "tribe", icon: "/assets/tribe.svg" },
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
          <div
            className="group rounded-md border flex flex-col gap-4 border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-gray-modern-400 hover:shadow-[0_0_28px_rgba(180,17,238,0.18)]"
          >
            <h3 className="text-white font-semibold text-xl">{nft.name}</h3>

            <div className="relative w-full aspect-square overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950">
              <Image
                src={nft.image}
                alt={nft.name}
                fill
                sizes="(min-width: 1900px) 17vw, (min-width: 1600px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover [image-rendering:pixelated] transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                unoptimized
              />
            </div>

            <div className="flex flex-col gap-2">
              {details.map((detail) => {
                let raw = String(
                  nft[detail.value as keyof typeof nft] || "Unknown",
                );
                if (detail.value === "holder") {
                  if (nft.listing) {
                    raw = "Listed";
                  } else if (nft.holderName) {
                    raw = `@${nft.holderName}`;
                  } else {
                    raw = truncateAddress(nft.holder);
                  }
                }
                const artists =
                  detail.value === "artist"
                    ? raw.split(",").map((v) => v.trim()).filter(Boolean)
                    : null;
                const firstLine = artists ? artists[0] : raw;
                const restLine =
                  artists && artists.length > 1
                    ? artists.slice(1).join(", ")
                    : null;
                let holderHref: string | null = null;
                if (detail.value === "holder") {
                  if (nft.listing) {
                    holderHref = nft.listing.url;
                  } else if (nft.holderTwitter) {
                    holderHref = `https://x.com/${nft.holderTwitter}`;
                  }
                }
                const firstLineNode = holderHref ? (
                  <a
                    href={holderHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-xl truncate max-w-full text-right hover:underline"
                    title={firstLine}
                  >
                    {firstLine}
                  </a>
                ) : (
                  <span
                    className="text-white text-xl truncate max-w-full text-right"
                    title={firstLine}
                  >
                    {firstLine}
                  </span>
                );
                return (
                  <div
                    key={`${nft.tokenId}-${detail.label}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 shrink-0">
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
                    <div className="flex flex-col items-end min-w-0">
                      {firstLineNode}
                      {restLine && (
                        <span
                          className="text-white text-xl truncate max-w-full text-right"
                          title={restLine}
                        >
                          {restLine}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </FadeUp>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-8 xl:mt-18">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="flex cursor-pointer text-xl items-center gap-2 border border-gray-modern-700 font-semibold px-4 py-2 font-sans text-white transition-colors hover:bg-gray-modern-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
