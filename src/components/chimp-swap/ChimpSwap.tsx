"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChimpListing } from "@/types/listing";
import ListingCard from "./ListingCard";
import CustomSelect from "@/components/nft-gallery/Hero/CustomSelect";
import PostChimpModal from "./PostChimpModal";
import SwapDetailModal from "./SwapDetailModal";
import SwapWizardModal from "./SwapWizardModal";

const TRIBE_OPTIONS = [
  "All Tribes",
  "Old World Cult",
  "Planeswalkers",
  "Future War Pack",
  "Proletariat",
];

const TYPE_OPTIONS = ["All Types", "1/1"];

function ListingSkeleton() {
  return (
    <div className="flex flex-col border border-gray-modern-800 bg-gray-modern-900 animate-pulse">
      <div className="h-8 bg-gray-modern-800 m-3 rounded" />
      <div className="aspect-square bg-gray-modern-800" />
      <div className="flex flex-col gap-2 px-3 py-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-modern-800 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ChimpSwap() {
  const [listings, setListings] = useState<ChimpListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tribe, setTribe] = useState("");
  const [type, setType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [swapListing, setSwapListing] = useState<ChimpListing | null>(null);
  const [swapWizardOpen, setSwapWizardOpen] = useState(false);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data: ChimpListing[]) => {
        setListings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = listings.filter((l) => {
    if (tribe && l.tribe !== tribe) return false;
    if (type && l.type !== type) return false;
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
          unoptimized
          className="block w-full h-auto [image-rendering:pixelated] lg:hidden"
        />
        <Image
          src="/assets/texture-the-dao.png"
          alt=""
          width={1440}
          height={946}
          priority
          unoptimized
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
          <h1 className="text-white font-title text-[2rem] leading-11 xs:text-[3rem] sm:leading-12">
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

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-aqua-marine-500" />
            <span className="text-gray-modern-300 text-base">
              {count === null ? "Loading..." : `${count} Listed`}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="relative z-20 w-full lg:w-64 shrink-0 flex flex-col gap-4">
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
            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer w-full h-12 bg-violet-600 hover:bg-violet-500 transition-colors text-white font-bold font-sans text-base"
            >
              Post Your Chimp
            </button>
          </div>

          <div className="flex-1 grid grid-cols-2  :grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              [...Array(6)].map((_, i) => <ListingSkeleton key={i} />)
            ) : filtered.length > 0 ? (
              filtered.map((listing) => (
                <ListingCard
                  key={listing.mint}
                  listing={listing}
                  onClick={() => setSwapListing(listing)}
                />
              ))
            ) : (
              <div className="col-span-full text-gray-modern-500 text-center py-16">
                No listings found.
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
