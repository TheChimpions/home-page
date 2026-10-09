"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { ChimpListing } from "@/types/listing";
import ListingCard, { formatListedDate } from "./ListingCard";
import {
  useInvalidateSwapData,
  useSendAndConfirm,
  useSwapConfig,
} from "@/hooks/use-chimp-swap";
import { buildDelistTransaction } from "@/lib/chimp-swap/instructions";
import { toSwapListing } from "@/lib/chimp-swap/listing-view";
import { describeSwapError } from "@/lib/chimp-swap/errors";
import { formatSol, splitFee } from "@/lib/chimp-swap/fee";
import { orbAddressUrl, orbTxUrl, truncateAddress } from "@/lib/utils";

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
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const configQuery = useSwapConfig();
  const sendAndConfirm = useSendAndConfirm();
  const invalidate = useInvalidateSwapData();
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const config = configQuery.data ?? null;
  const mine = !!publicKey && publicKey.toBase58() === listing.seller;
  const meUrl = `https://magiceden.io/item-details/${listing.mint}`;
  const split = config ? splitFee(config.swapFeeLamports, config.treasuryBps) : null;

  async function handleRemove() {
    if (!publicKey) return;
    setRemoving(true);
    try {
      const tx = await buildDelistTransaction(
        connection,
        publicKey,
        toSwapListing(listing),
      );
      const sig = await sendAndConfirm(tx);
      await invalidate();
      toast.success("Listing removed", {
        description: `${listing.name} is back under your full control.`,
        action: { label: "View tx", onClick: () => window.open(orbTxUrl(sig), "_blank") },
      });
      onClose();
    } catch (err) {
      toast.error("Could not remove listing", { description: describeSwapError(err) });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-200 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-screen justify-center py-8 px-4">
        <div className="relative z-10 w-full max-w-4xl my-auto bg-gray-modern-950 rounded-lg border border-gray-modern-800 shadow-2xl">
          <div className="flex justify-end px-4 pt-4">
            <button
              onClick={onClose}
              className="text-gray-modern-500 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 pt-2 sm:p-10 sm:pt-4 flex flex-col sm:flex-row gap-0">
            <div className="sm:flex-1">
              <ListingCard listing={listing} priority hideTitle mine={mine} />
            </div>

            <div className="hidden sm:block w-px bg-gray-modern-700 mx-10 self-stretch shrink-0" />

            <div className="sm:flex-1 flex flex-col gap-5 mt-6 sm:mt-0">
              <h3 className="text-white font-bold text-[2rem] leading-tight">
                {listing.name}
              </h3>

              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-3 w-full justify-between">
                  <span className="text-gray-modern-400 text-xl">Status:</span>
                  <span className="px-2 py-0.5 bg-aqua-marine-900 text-white text-xl">
                    Listed for Swap
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full justify-between">
                  <span className="text-gray-modern-400 text-xl">Listed:</span>
                  <span className="text-gray-modern-200 text-xl">
                    {formatListedDate(listing.listedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full justify-between">
                  <span className="text-gray-modern-400 text-xl">Posted by:</span>
                  <a
                    href={orbAddressUrl(listing.seller)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-modern-200 text-xl hover:text-white transition-colors"
                  >
                    {mine ? "You" : truncateAddress(listing.seller)}
                  </a>
                </div>
                <div className="flex items-center gap-3 w-full justify-between">
                  <span className="text-gray-modern-400 text-xl">Swap fee:</span>
                  <span className="text-aqua-marine-400 font-bold text-xl">
                    {config ? formatSol(config.swapFeeLamports) : "…"}
                  </span>
                </div>
                {split && (
                  <p className="text-gray-modern-500 text-base">
                    Paid by the swapper: {formatSol(split.treasury)} to the
                    Chimpions treasury, {formatSol(split.lister)} to the lister.
                  </p>
                )}
              </div>

              <a
                href={meUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gray-modern-500 hover:text-gray-modern-300 text-base transition-colors w-fit"
              >
                View on Magic Eden <ExternalLink className="w-3 h-3" />
              </a>

              <div className="mt-auto">
                {!publicKey ? (
                  <button
                    onClick={() => setVisible(true)}
                    className="cursor-pointer flex items-center gap-2 h-12 px-6 bg-electric-purple-600 w-full justify-center hover:bg-electric-purple-500 text-white font-bold text-xl font-sans transition-colors"
                  >
                    Connect Wallet to Swap
                  </button>
                ) : mine ? (
                  <button
                    onClick={handleRemove}
                    disabled={removing}
                    className="cursor-pointer flex items-center gap-2 h-12 px-6 border border-gray-modern-600 w-full justify-center hover:bg-gray-modern-800 text-white font-bold text-xl font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {removing && <Loader2 className="w-5 h-5 animate-spin" />}
                    {removing ? "Removing…" : "Remove Listing"}
                  </button>
                ) : (
                  <button
                    onClick={onStartSwap}
                    disabled={!!config?.paused}
                    className="cursor-pointer flex items-center gap-2 h-12 px-6 bg-electric-purple-600 w-full justify-center hover:bg-electric-purple-500 text-white font-bold text-xl font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {config?.paused ? "Swaps Paused" : "Start Swap"}
                    <Image
                      src="/assets/swap.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-4"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
