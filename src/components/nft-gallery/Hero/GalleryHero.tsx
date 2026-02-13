"use client";

import Image from "next/image";
import { NFTFilters } from "@/types/nft";
import CustomSelect from "./CustomSelect";

const tribeOptions = [
  "All Tribes",
  "Old World Cult",
  "Planeswalkers",
  "Future War Pack",
  "Proletariat",
];

const typeOptions = ["All Types", "1/1"];

interface GalleryHeroProps {
  filters: NFTFilters;
  onFiltersChange: (filters: NFTFilters) => void;
}

export default function GalleryHero({
  filters,
  onFiltersChange,
}: GalleryHeroProps) {
  const handleTribeChange = (value: string) => {
    onFiltersChange({ ...filters, tribe: value || undefined });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, type: value || undefined });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value || undefined });
  };

  return (
    <div className="text-center flex flex-col gap-8 xl:gap-24">
      <div className="flex flex-col gap-4">
        <h1 className="text-white font-title text-[2rem] leading-11 xs:text-[3rem] sm:leading-12">
          You&apos;ve entered the hallowed halls of
          <br />
          <span
            className="animate-gradient-flow"
            style={{
              background: "linear-gradient(90deg, #B411EE 0%, #11EEB4 25%, #B411EE 50%, #11EEB4 75%, #B411EE 100%)",
              backgroundSize: "200% 100%",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            } as React.CSSProperties}
          >
            Chimpianity
          </span>
        </h1>
        <p className=" text-gray-modern-400 text-sm leading-5.5 tracking-[-2px] max-w-5xl mx-auto">
          Here before you lies the collective history of Chimpions past,
          present, and future.{" "}
          <span className="md:block">
            Tread with care. Each of the 222 unique, hand-drawn, animated NFTs
            tells a story.
          </span>
        </p>
      </div>

      <div className="flex flex-col xl:flex-row xl:justify-between gap-6 sm:gap-4 text-left">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 w-full lg:w-auto">
          <CustomSelect
            value={filters.tribe || ""}
            onChange={handleTribeChange}
            options={tribeOptions}
            icon="/assets/tribe.svg"
          />

          <CustomSelect
            value={filters.type || ""}
            onChange={handleTypeChange}
            options={typeOptions}
            icon="/assets/type.svg"
          />
        </div>

        <div className="relative w-full xl:w-125  flex flex-row items-center">
          <input
            type="text"
            placeholder="Search"
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="w-full rounded-sm border border-gray-modern-800 bg-gray-modern-950 p-4 text-xs text-white placeholder:text-gray-modern-500 outline-none focus:border-gray-modern-600"
          />
          <Image
            src="/assets/search.svg"
            alt=""
            width={20}
            height={20}
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}
