"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Users, Diamond, User } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

interface MyChimp {
  mint: string;
  name: string;
  image: string;
  tribe?: string;
  type?: string;
  artist?: string;
  holder?: string;
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
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-gray-modern-600 shrink-0">{icon}</span>
      <span className="text-gray-modern-500">{label}</span>
      <span className="ml-auto text-gray-modern-300 truncate max-w-20 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

function ChimpCard({ chimp }: { chimp: MyChimp }) {
  return (
    <div className="flex gap-3 border border-gray-modern-800 bg-gray-modern-900 p-3">
      <div className="relative w-16 h-16 shrink-0 overflow-hidden">
        {chimp.image ? (
          <Image
            src={chimp.image}
            alt={chimp.name}
            fill
            unoptimized
            className="object-cover [image-rendering:pixelated]"
          />
        ) : (
          <div className="w-full h-full bg-gray-modern-800" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-white text-sm font-bold truncate">
            {chimp.name}
          </span>
          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold border border-gray-modern-700 text-gray-modern-500">
            Not listed
          </span>
        </div>
        <MetaRow
          icon={<Users className="w-3 h-3" />}
          label="Tribe:"
          value={chimp.tribe}
        />
        <MetaRow
          icon={<Diamond className="w-3 h-3" />}
          label="Type:"
          value={chimp.type}
        />
        <MetaRow
          icon={<User className="w-3 h-3" />}
          label="Artist:"
          value={chimp.artist}
        />
      </div>
    </div>
  );
}

interface MyListingsPanelProps {
  onClose: () => void;
}

export default function MyListingsPanel({ onClose }: MyListingsPanelProps) {
  const { publicKey } = useWallet();
  const [chimps, setChimps] = useState<MyChimp[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/my-chimps?wallet=${publicKey.toBase58()}`)
      .then((r) => r.json())
      .then((data) => {
        setChimps(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [publicKey]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-90 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed top-0 right-0 bottom-0 z-100 w-80 bg-gray-modern-950 border-l border-gray-modern-800 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-modern-800 shrink-0">
          <h2 className="text-white font-bold font-sans text-base">
            My Listings
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-modern-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-modern-900 animate-pulse border border-gray-modern-800"
              />
            ))
          ) : !publicKey ? (
            <p className="text-gray-modern-500 text-sm text-center py-8">
              Connect your wallet to see your listings.
            </p>
          ) : chimps.length === 0 ? (
            <p className="text-gray-modern-500 text-base text-center py-8">
              No Chimpions found in this wallet.
            </p>
          ) : (
            chimps.map((chimp) => <ChimpCard key={chimp.mint} chimp={chimp} />)
          )}
        </div>
      </div>
    </>
  );
}
