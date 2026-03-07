"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Users, Diamond, User, Palette } from "lucide-react";
import { ChimpListing } from "@/types/listing";

function shortAddr(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-modern-500 shrink-0">{icon}</span>
      <span className="text-gray-modern-400">{label}</span>
      <span className="ml-auto text-gray-modern-200 truncate max-w-28 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

interface SwapDetailModalProps {
  listing: ChimpListing;
  onClose: () => void;
  onStartSwap: () => void;
}

export default function SwapDetailModal({
  listing,
  onClose,
  onStartSwap,
}: SwapDetailModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const meUrl = `https://magiceden.io/item-details/${listing.mint}`;
  const listedDate = new Date().toLocaleDateString("en-GB");

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto py-16 px-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl bg-gray-modern-900 border border-gray-modern-800 shadow-2xl">
        <div className="px-8 pt-8 pb-6 border-b border-gray-modern-800">
          <h2 className="text-white font-title text-xl">Swap Chimp</h2>
        </div>

        <div className="p-8 grid grid-cols-2 gap-8">
          <div className="border border-gray-modern-700 bg-gray-modern-950">
            <div className="px-3 pt-3 pb-2">
              <span className="text-white text-sm font-bold truncate block">
                {listing.name}
              </span>
            </div>
            <div className="relative aspect-square w-full overflow-hidden">
              {listing.image ? (
                <Image
                  src={listing.image}
                  alt={listing.name}
                  fill
                  unoptimized
                  className="object-cover [image-rendering:pixelated]"
                />
              ) : (
                <div className="w-full h-full bg-gray-modern-800" />
              )}
            </div>
            <div className="flex flex-col gap-2 px-3 py-3">
              <MetaRow
                icon={<Users className="w-3.5 h-3.5" />}
                label="Tribe:"
                value={listing.tribe}
              />
              <MetaRow
                icon={<Diamond className="w-3.5 h-3.5" />}
                label="Type:"
                value={listing.type}
              />
              <MetaRow
                icon={<User className="w-3.5 h-3.5" />}
                label="Holder:"
                value={shortAddr(listing.seller)}
              />
              <MetaRow
                icon={<Palette className="w-3.5 h-3.5" />}
                label="Artist:"
                value={listing.artist}
              />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h3 className="text-white font-bold text-lg leading-tight">
              {listing.name}
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-modern-400 text-sm">Status:</span>
                <span className="px-2 py-0.5 bg-aqua-marine-500/20 border border-aqua-marine-500/30 text-aqua-marine-400 text-xs font-bold">
                  Listed for Swap
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-modern-400 text-sm">Listed:</span>
                <span className="text-gray-modern-200 text-sm">
                  {listedDate}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-modern-400 text-sm">Price:</span>
                <span className="text-aqua-marine-400 font-bold text-sm">
                  {listing.price.toFixed(2)} SOL
                </span>
              </div>
            </div>

            <a
              href={meUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gray-modern-500 hover:text-gray-modern-300 text-xs transition-colors w-fit"
            >
              View on Magic Eden <ExternalLink className="w-3 h-3" />
            </a>

            <div className="mt-auto">
              <button
                onClick={onStartSwap}
                className="cursor-pointer flex items-center gap-2 h-12 px-6 bg-violet-600 hover:bg-violet-500 text-white font-bold font-sans transition-colors"
              >
                Start Swap <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
