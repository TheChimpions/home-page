"use client";

import Image from "next/image";
import { useState } from "react";
import { ChimpListing } from "@/types/listing";
import { truncateAddress } from "@/lib/utils";

const rows = [
  { icon: "/assets/coin.svg", label: "Price", key: "price" as const },
  { icon: "/assets/tribe.svg", label: "Tribe", key: "tribe" as const },
  { icon: "/assets/type.svg", label: "Type", key: "type" as const },
  { icon: "/assets/holder.svg", label: "Holder", key: "holder" as const },
  { icon: "/assets/artist.svg", label: "Artist", key: "artist" as const },
];

interface ListingCardProps {
  listing: ChimpListing;
  onClick?: () => void;
  priority?: boolean;
  hideTitle?: boolean;
}

export default function ListingCard({ listing, onClick, priority, hideTitle }: ListingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  function getValue(key: (typeof rows)[number]["key"]): string {
    if (key === "price") return `${listing.price.toFixed(2)} SOL`;
    if (key === "holder") {
      const addr = listing.holder ?? listing.seller;
      return truncateAddress(addr);
    }
    return listing[key] ?? "—";
  }

  return (
    <button
      onClick={onClick}
      className="group rounded-md border flex flex-col gap-4 border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)] text-left transition-all duration-300 hover:-translate-y-1 hover:border-gray-modern-400 hover:shadow-[0_0_28px_rgba(180,17,238,0.18)] cursor-pointer w-full"
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
      </div>

      <div className="flex flex-col gap-2">
        {rows.map(({ icon, label, key }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src={icon} alt="" width={20} height={20} className={`size-5${key === "price" ? " brightness-0 invert" : ""}`} />
              <span className="text-white text-xl">{label}:</span>
            </div>
            <span
              className={`text-xl truncate max-w-50 ${key === "price" ? "text-aqua-marine-400" : "text-white"}`}
              title={getValue(key)}
            >
              {getValue(key)}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}
