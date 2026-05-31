"use client";

import Image from "next/image";
import { useState } from "react";
import type { HolderProfile } from "@/lib/collection-stats";
import { truncateAddress } from "@/lib/utils";
import HolderAvatar from "../HolderAvatar";

interface HolderCardProps {
  holder: HolderProfile;
}

export default function HolderCard({ holder }: HolderCardProps) {
  const [flipped, setFlipped] = useState(false);

  const display = holder.username
    ? `@${holder.username}`
    : truncateAddress(holder.wallet);
  const twitterHandle = holder.twitter?.replace(/^@/, "");
  const countLabel = `${holder.count} ${holder.count === 1 ? "Chimpion" : "Chimpions"}`;

  const toggle = () => setFlipped((f) => !f);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${display} — show Chimpions collection`}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className="group h-full min-h-64 cursor-pointer [perspective:1200px]"
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col justify-center gap-6 rounded-md border border-gray-modern-800 bg-gray-modern-900 p-4 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 [backface-visibility:hidden] group-hover:border-gray-modern-700 group-hover:shadow-[0_0_24px_rgba(0,0,0,0.4)]">
          <div className="relative mx-auto size-21 overflow-hidden rounded-full border border-gray-modern-700 bg-gray-modern-800/60 transition-transform duration-300 group-hover:scale-110">
            <HolderAvatar src={holder.pfp} alt={display} />
          </div>

          <div className="flex flex-col gap-2">
            {twitterHandle ? (
              <a
                href={`https://x.com/${twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="truncate text-xl font-bold text-white hover:underline"
              >
                {display}
              </a>
            ) : (
              <p className="truncate text-xl font-bold text-white">{display}</p>
            )}
            <div className="flex items-center justify-center gap-2">
              <Image
                src="/assets/chimps-aqua-marine.svg"
                alt="Chimps"
                width={19}
                height={19}
                className="transition-transform duration-300 group-hover:rotate-12"
              />
              <p className="text-xl font-bold text-aqua-marine-400">
                {countLabel}
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-gray-modern-500">
            Click to view collection
          </span>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden rounded-md border border-gray-modern-700 bg-gray-modern-900 p-4 shadow-[0_0_24px_rgba(0,0,0,0.4)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex shrink-0 items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-white">{display}</p>
            <span className="shrink-0 text-xs font-bold text-aqua-marine-400">
              {countLabel}
            </span>
          </div>

          {holder.nfts.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                {holder.nfts.map((nft) => (
                  <div
                    key={nft.id}
                    title={nft.name ?? undefined}
                    className="relative aspect-square overflow-hidden rounded border border-gray-modern-800 bg-gray-modern-800/60"
                  >
                    {nft.image ? (
                      <Image
                        src={nft.image}
                        alt={nft.name ?? "Chimpion"}
                        fill
                        unoptimized
                        className="object-cover [image-rendering:pixelated]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Image
                          src="/assets/chimps-aqua-marine.svg"
                          alt="Chimpion"
                          width={28}
                          height={28}
                          className="h-1/2 w-1/2 opacity-60"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-2 text-center text-sm text-gray-modern-400">
              Collection unavailable
            </div>
          )}

          <span className="shrink-0 text-center text-[10px] font-medium text-gray-modern-500">
            Click to flip back
          </span>
        </div>
      </div>
    </div>
  );
}
