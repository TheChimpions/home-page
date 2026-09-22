"use client";

import Image from "next/image";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChimpListing } from "@/types/listing";
import ListingCard from "./ListingCard";
import CustomSelect from "@/components/nft-gallery/Hero/CustomSelect";
import PostChimpModal from "./PostChimpModal";
import SwapDetailModal from "./SwapDetailModal";
import SwapWizardModal from "./SwapWizardModal";
import NFTCardSkeleton from "@/components/nft-gallery/Grid/NFTCardSkeleton";
import FadeUp from "@/components/ui/FadeUp";
import { useSwapConfig, useSwapListings } from "@/hooks/use-chimp-swap";
import { formatSol } from "@/lib/chimp-swap/fee";

const TRIBE_OPTIONS = [
  "All Tribes",
  "Old World Cult",
  "Planeswalkers",
  "Future War Pack",
  "Proletariat",
];

const TYPE_OPTIONS = ["All Types", "1/1"];

export default function ChimpSwap() {
  const { publicKey } = useWallet();
  const listingsQuery = useSwapListings();
  const configQuery = useSwapConfig();
  const [tribe, setTribe] = useState("");
  const [type, setType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [swapListing, setSwapListing] = useState<ChimpListing | null>(null);
  const [swapWizardOpen, setSwapWizardOpen] = useState(false);

  const listings = listingsQuery.data ?? [];
  const loading = listingsQuery.isPending;
  const config = configQuery.data ?? null;
  const me = publicKey?.toBase58();

  const filtered = listings.filter((l) => {
    if (tribe && tribe !== "All Tribes" && l.tribe !== tribe) return false;
    if (type && type !== "All Types" && l.type !== type) return false;
    return true;
  });

  const count = loading ? null : filtered.length;

  return (
    <section className="relative overflow-hidden bg-gray-modern-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
      >
        <Image
          src="/assets/texture_bottom-mobile.png"
          alt=""
          width={390}
          height={740}
          priority
          className="block w-full h-auto [image-rendering:pixelated] lg:hidden"
        />
        <Image
          src="/assets/texture-the-dao.png"
          alt=""
          width={1440}
          height={946}
          priority
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
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
            <span
              className="animate-gradient-flow"
              style={
                {
                  background:
                    "linear-gradient(90deg, #B411EE 0%, #11EEB4 25%, #B411EE 50%, #11EEB4 75%, #B411EE 100%)",
                  backgroundSize: "200% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                } as React.CSSProperties
              }
            >
              The Grail Grove
            </span>
          </h1>
          <p className="text-gray-modern-400 text-xl leading-5 max-w-5xl mx-auto">
            Discover and swap rare Chimpions. Peer-to-peer, non-custodial,{" "}
            <span className="md:block">1-for-1 NFT trades on Solana.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-aqua-marine-500" />
              <span className="text-gray-modern-300 text-base">
                {count === null ? "Loading..." : `${count} Listed`}
              </span>
            </div>
            {config && (
              <span className="text-gray-modern-300 text-base">
                Swap fee: {formatSol(config.swapFeeLamports)}
              </span>
            )}
          </div>

          {config?.paused && (
            <p className="mx-auto max-w-xl border border-gold-500 bg-gray-modern-900 px-4 py-2 text-gold-500 text-base">
              The swap board is paused. Existing listings can still be removed;
              new listings and swaps will resume when the DAO lifts the pause.
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="relative z-20 w-full lg:w-84 shrink-0 flex flex-col gap-10">
            <div className="flex flex-col w-full gap-6">
              <CustomSelect
                value={tribe}
                onChange={setTribe}
                options={TRIBE_OPTIONS}
                icon="/assets/tribe.svg"
                placeholder="Select a Tribe"
                containerClassName="relative w-full"
              />
              <CustomSelect
                value={type}
                onChange={setType}
                options={TYPE_OPTIONS}
                icon="/assets/type.svg"
                placeholder="Select a Type"
                containerClassName="relative w-full"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={!!config?.paused}
              className="cursor-pointer w-full py-2 px-4 rounded-sm bg-electric-purple-600 hover:bg-electric-purple-500 transition-colors text-white font-bold font-sans text-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post Your Chimp
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 w-full sm:grid-cols-2 md:grid-cols-3 5xl:grid-cols-4 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => <NFTCardSkeleton key={i} />)
            ) : listingsQuery.isError ? (
              <div className="col-span-full text-center py-16 flex flex-col items-center gap-4">
                <p className="text-gray-modern-400">Could not load listings.</p>
                <button
                  onClick={() => listingsQuery.refetch()}
                  className="cursor-pointer px-4 py-2 border border-gray-modern-600 text-white font-bold font-sans hover:bg-gray-modern-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((listing, i) => (
                <FadeUp key={listing.mint} delay={(i % 3) * 80}>
                  <ListingCard
                    listing={listing}
                    mine={!!me && listing.seller === me}
                    onClick={() => setSwapListing(listing)}
                  />
                </FadeUp>
              ))
            ) : (
              <div className="col-span-full text-gray-modern-500 text-center py-16">
                {listings.length === 0
                  ? "Nothing is listed yet. Be the first to post your Chimp."
                  : "No listings match those filters."}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && <PostChimpModal onClose={() => setShowModal(false)} />}

      {swapListing && !swapWizardOpen && (
        <SwapDetailModal
          listing={swapListing}
          onClose={() => setSwapListing(null)}
          onStartSwap={() => setSwapWizardOpen(true)}
        />
      )}

      {swapListing && swapWizardOpen && (
        <SwapWizardModal
          targetListing={swapListing}
          onClose={() => {
            setSwapWizardOpen(false);
            setSwapListing(null);
          }}
        />
      )}
    </section>
  );
}
