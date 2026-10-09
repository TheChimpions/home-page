"use client";

import Image from "next/image";
import { useState } from "react";
import type { ChimpAssetSummary } from "@/lib/helius-asset";
import { truncateAddress } from "@/lib/utils";

const rows = [
  { icon: "/assets/tribe.svg", label: "Tribe", key: "tribe" as const },
  { icon: "/assets/type.svg", label: "Type", key: "type" as const },
  { icon: "/assets/holder.svg", label: "Holder", key: "holder" as const },
  { icon: "/assets/artist.svg", label: "Artist", key: "artist" as const },
];

interface ChimpPickCardProps {
  chimp: ChimpAssetSummary;
  selected?: boolean;
  compact?: boolean;
  /** Small label rendered over the art, e.g. "Listed". */
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
}

/** Selectable Chimpion card used by the post and swap wizards. */
export default function ChimpPickCard({
  chimp,
  selected,
  compact,
  badge,
  disabled,
  onClick,
}: ChimpPickCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const values: Record<(typeof rows)[number]["key"], string | undefined> = {
    tribe: chimp.tribe,
    type: chimp.type,
    holder:
      chimp.holderName ?? (chimp.holder ? truncateAddress(chimp.holder) : undefined),
    artist: chimp.artist,
  };

  const inner = (
    <>
      <h3
        className={`font-semibold truncate text-white transition-opacity ${compact ? "text-xs sm:text-base" : "text-sm sm:text-xl"} ${selected ? "opacity-40" : ""}`}
      >
        {chimp.name}
      </h3>
      <div
        className={`relative w-full overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950 ${compact ? "h-44" : "aspect-square"}`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-modern-800 animate-pulse" />
        )}
        {chimp.image && (
          <Image
            src={chimp.image}
            alt={chimp.name}
            fill
            unoptimized
            onLoad={() => setImageLoaded(true)}
            className={`object-cover [image-rendering:pixelated] ${disabled ? "opacity-40" : ""}`}
          />
        )}
        {badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold bg-aqua-marine-900 text-white">
            {badge}
          </span>
        )}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(32,41,57,0.86)]">
            <Image
              src="/assets/selected.svg"
              alt=""
              width={134}
              height={134}
              className="w-34 h-34"
            />
          </div>
        )}
      </div>
      <div
        className={`flex flex-col transition-opacity ${compact ? "gap-1" : "gap-2"} ${selected ? "opacity-40" : ""}`}
      >
        {rows.map(({ icon, label, key }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={icon}
                alt=""
                width={20}
                height={20}
                className={compact ? "size-3 sm:size-4" : "size-3.5 sm:size-5"}
              />
              <span
                className={`text-white ${compact ? "text-xs sm:text-base" : "text-xs sm:text-xl"}`}
              >
                {label}:
              </span>
            </div>
            <span
              className={`text-white truncate ${compact ? "max-w-20 sm:max-w-36 text-xs sm:text-base" : "max-w-24 sm:max-w-50 text-xs sm:text-xl"}`}
              title={values[key] ?? "—"}
            >
              {values[key] ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`group rounded-md border flex flex-col text-left transition-colors w-full shadow-[0_0_18px_rgba(0,0,0,0.25)] ${compact ? "gap-2 p-3" : "gap-4 p-4"} ${
          disabled
            ? "border-gray-modern-800 bg-rich-black-900 cursor-not-allowed"
            : selected
              ? "cursor-pointer border-[3.5px] border-aqua-marine-500 bg-[rgba(32,41,57,0.86)]"
              : "cursor-pointer border border-gray-modern-600 bg-rich-black-900 hover:border-gray-modern-400"
        }`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={`rounded-md border flex flex-col border-gray-modern-600 bg-rich-black-900 shadow-[0_0_18px_rgba(0,0,0,0.25)] ${compact ? "gap-2 p-3" : "gap-4 p-4"}`}
    >
      {inner}
    </div>
  );
}
