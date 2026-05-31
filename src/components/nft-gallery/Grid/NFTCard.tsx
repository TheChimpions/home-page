"use client";

import Image from "next/image";
import { useState } from "react";
import { ChimpionMetadata } from "@/types/nft";
import { truncateAddress } from "@/lib/utils";
import HolderAvatar from "@/components/our-holders/HolderAvatar";

const details = [
  { label: "Tribe", value: "tribe", icon: "/assets/tribe.svg" },
  { label: "Holder", value: "holder", icon: "/assets/holder.svg" },
  { label: "Artist", value: "artist", icon: "/assets/artist.svg" },
];

function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

/** Gold crown shown when a holder has owned the chimp since mint. */
function Crown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 7.5l4 3 5-6 5 6 4-3-1.6 10.5H4.6L3 7.5zM4.9 19.5h14.2v1.7H4.9z" />
    </svg>
  );
}

function formatAcquired(ts: number | null): string | null {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

interface NFTCardProps {
  nft: ChimpionMetadata;
}

export default function NFTCard({ nft }: NFTCardProps) {
  const [flipped, setFlipped] = useState(false);
  const provenance = nft.provenance ?? [];
  // A single owner in the chain means the current holder has held since mint.
  const heldSinceMint = provenance.length === 1;

  return (
    <div className="[perspective:1200px] transition-transform duration-300 hover:-translate-y-1">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${nft.name} — ${flipped ? "show details" : "show provenance"}`}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className="relative h-full cursor-pointer rounded-md outline-none transition-transform duration-500 [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-electric-purple-400"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        {/* Front */}
        <div className="group flex h-full flex-col gap-4 rounded-md border border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-colors duration-300 [backface-visibility:hidden] hover:border-gray-modern-400 hover:shadow-[0_0_28px_rgba(180,17,238,0.18)]">
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
                  ? raw
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
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
                  onClick={stop}
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
                    <span className="text-white text-xl">{detail.label}:</span>
                  </div>
                  <div className="flex flex-col items-end min-w-0">
                    <div className="flex items-center gap-1 min-w-0 max-w-full">
                      {detail.value === "holder" && heldSinceMint && (
                        <span title="Held since mint" className="flex shrink-0">
                          <Crown className="size-4 text-gold-400" />
                        </span>
                      )}
                      {firstLineNode}
                    </div>
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

          <div className="mt-auto flex items-center justify-end gap-1.5 pt-1 text-sm text-gray-modern-400 transition-colors group-hover:text-electric-purple-300">
            <span>Provenance</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 9-9" />
              <path d="M3 4v5h5" />
            </svg>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex h-full flex-col gap-3 rounded-md border border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-white font-semibold text-xl">
                Provenance
              </h3>
              <p className="truncate text-sm text-gray-modern-400" title={nft.name}>
                {nft.name}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-sm text-gray-modern-400">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h11a5 5 0 0 1 0 10h-1" />
              </svg>
              Flip back
            </span>
          </div>

          {provenance.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-gray-modern-400">
              Ownership history isn&apos;t available yet.
            </div>
          ) : (
            <ol className="-mr-1 flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
              {provenance.map((owner, idx) => {
                const display = owner.username
                  ? `@${owner.username}`
                  : truncateAddress(owner.wallet);
                const href = owner.username
                  ? `https://matrica.io/user/${owner.username}`
                  : `https://solscan.io/account/${owner.wallet}`;
                const acquired = formatAcquired(owner.acquiredAt);
                return (
                  <li
                    key={`${owner.wallet}-${idx}`}
                    className="flex items-center gap-3 rounded-sm border border-gray-modern-800 bg-gray-modern-950/60 p-2"
                  >
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-gray-modern-700">
                      <HolderAvatar src={owner.pfp} alt={display} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={stop}
                        className="truncate text-white hover:underline"
                        title={owner.username ? display : owner.wallet}
                      >
                        {display}
                      </a>
                      {acquired && (
                        <span className="text-xs text-gray-modern-400">
                          {acquired}
                        </span>
                      )}
                    </div>
                    {owner.current &&
                      (heldSinceMint ? (
                        <span
                          title="Held since mint"
                          className="flex shrink-0 items-center gap-1 rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-medium text-gold-300"
                        >
                          <Crown className="size-3" />
                          Since mint
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-electric-purple-500/20 px-2 py-0.5 text-xs font-medium text-electric-purple-300">
                          Current
                        </span>
                      ))}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
