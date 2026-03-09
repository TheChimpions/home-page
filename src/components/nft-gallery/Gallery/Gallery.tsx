"use client";

import { useState } from "react";
import Image from "next/image";
import GalleryHero from "../Hero/GalleryHero";
import GalleryGrid from "../Grid/GalleryGrid";
import { NFTFilters } from "@/types/nft";
import { useDebounce } from "@/hooks/use-debounce";

export default function Gallery() {
  const [filters, setFilters] = useState<NFTFilters>({});

  const debouncedFilters = {
    ...filters,
    search: useDebounce(filters.search, 500),
  };

  return (
    <section className="relative overflow-hidden bg-gray-modern-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
      >
        <Image
          src="/assets/texture_bottom-mobile.webp"
          alt=""
          width={390}
          height={740}
          priority
          unoptimized
          className="block w-full h-auto [image-rendering:pixelated] lg:hidden"
        />
        <Image
          src="/assets/texture-the-dao.webp"
          alt=""
          width={1440}
          height={946}
          priority
          unoptimized
          className="hidden w-full h-auto [image-rendering:pixelated] lg:block"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-20 sm:h-28 lg:h-36"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13, 18, 28, 0) 0%, rgba(13, 18, 28, 0.7) 55%, rgba(13, 18, 28, 1) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-480 mx-auto px-4 3xl:px-20 pt-16 pb-24 lg:pt-24 lg:pb-28 flex flex-col gap-10">
        <GalleryHero filters={filters} onFiltersChange={setFilters} />
        <GalleryGrid filters={debouncedFilters} />
      </div>
    </section>
  );
}
