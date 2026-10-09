"use client";

import Image from "next/image";
import { useState } from "react";
import { Clock } from "lucide-react";
import { ChimpListing } from "@/types/listing";
import { truncateAddress } from "@/lib/utils";

const rows = [
  { icon: "/assets/tribe.svg", label: "Tribe", key: "tribe" as const },
  { icon: "/assets/type.svg", label: "Type", key: "type" as const },
  { icon: "/assets/holder.svg", label: "Holder", key: "holder" as const },
  { icon: "/assets/artist.svg", label: "Artist", key: "artist" as const },
];

export function formatListedDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-GB");
}

interface ListingCardProps {
  listing: ChimpListing;
  onClick?: () => void;
  priority?: boolean;
  hideTitle?: boolean;
  /** True when the connected wallet posted this listing. */
  mine?: boolean;
}

export default function ListingCard({
  listing,
  onClick,
  priority,
  hideTitle,
  mine,
}: ListingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  function getValue(key: (typeof rows)[number]["key"]): string {
    if (key === "holder") {
      return listing.holderName ?? truncateAddress(listing.holder ?? listing.seller);
    }
    return listing[key] ?? "—";
  }

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`group rounded-md border flex flex-col gap-4 border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)] text-left transition-all duration-300 w-full ${onClick ? "cursor-pointer hover:-translate-y-1 hover:border-gray-modern-400 hover:shadow-[0_0_28px_rgba(180,17,238,0.18)]" : ""}`}
    >
      {!hideTitle && (
        <h3 className="text-white font-semibold text-xl truncate">
          {listing.name}
        </h3>
      )}

      <div className="relative w-full aspect-square overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950">
        {!imageLoaded && <div className="absolute inset-0 bg-gray-modern-800 animate-pulse" />}
        {listing.image && (
          <Image
            src={listing.image}
            alt={listing.name}
            fill
            unoptimized
            priority={priority}
            onLoad={() => setImageLoaded(true)}
            className="object-cover [image-rendering:pixelated] group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {mine && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold bg-electric-purple-600 text-white">
            Your listing
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-white" aria-hidden />
            <span className="text-white text-xl">Listed:</span>
          </div>
          <span className="text-xl text-aqua-marine-400">
            {formatListedDate(listing.listedAt)}
          </span>
        </div>
        {rows.map(({ icon, label, key }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src={icon} alt="" width={20} height={20} className="size-5" />
              <span className="text-white text-xl">{label}:</span>
            </div>
            <span
              className="text-xl truncate max-w-50 text-white"
              title={getValue(key)}
            >
              {getValue(key)}
            </span>
          </div>
        ))}
      </div>
    </Wrapper>
  );
}
