"use client";

import Image from "next/image";
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
      <span className="ml-auto text-gray-modern-200 truncate max-w-24 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

interface ListingCardProps {
  listing: ChimpListing;
  onClick?: () => void;
}

export default function ListingCard({ listing, onClick }: ListingCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col text-left border border-gray-modern-800 bg-gray-modern-900 hover:border-gray-modern-600 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2 gap-2">
        <span className="text-white text-sm font-bold truncate">
          {listing.name}
        </span>
        <span className="text-aqua-marine-400 text-sm font-bold shrink-0">
          {listing.price.toFixed(2)} SOL
        </span>
      </div>

      <div className="relative aspect-square w-full overflow-hidden">
        {listing.image ? (
          <Image
            src={listing.image}
            alt={listing.name}
            fill
            unoptimized
            className="object-cover [image-rendering:pixelated] group-hover:scale-105 transition-transform duration-300"
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
    </a>
  );
}
