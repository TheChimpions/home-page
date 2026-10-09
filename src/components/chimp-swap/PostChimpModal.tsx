"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Loader2, Wallet, X } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import type { MyChimp } from "@/types/listing";
import ChimpPickCard from "./ChimpPickCard";
import StepIndicator, { type WizardStep } from "./StepIndicator";
import {
  useInvalidateSwapData,
  useMyChimps,
  useMyListings,
  useSendAndConfirm,
  useSwapConfig,
} from "@/hooks/use-chimp-swap";
import { buildListTransaction } from "@/lib/chimp-swap/instructions";
import { describeSwapError } from "@/lib/chimp-swap/errors";
import { formatSol, splitFee } from "@/lib/chimp-swap/fee";
import { orbTxUrl } from "@/lib/utils";

interface PostChimpModalProps {
  onClose: () => void;
}

export default function PostChimpModal({ onClose }: PostChimpModalProps) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const chimpsQuery = useMyChimps(publicKey);
  const listingsQuery = useMyListings(publicKey);
  const configQuery = useSwapConfig();
  const sendAndConfirm = useSendAndConfirm();
  const invalidate = useInvalidateSwapData();

  const [step, setStep] = useState<WizardStep>(1);
  const effectiveStep: WizardStep = connected && step === 1 ? 2 : step;
  const [selected, setSelected] = useState<MyChimp | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const listedMints = useMemo(
    () => new Set((listingsQuery.data ?? []).map((l) => l.mint)),
    [listingsQuery.data],
  );
  const myChimps = chimpsQuery.data ?? [];
  const loadingChimps = chimpsQuery.isPending || listingsQuery.isPending;
  const config = configQuery.data ?? null;
  const split = config ? splitFee(config.swapFeeLamports, config.treasuryBps) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, submitting]);

  async function handlePost() {
    if (!publicKey || !selected) return;
    setSubmitting(true);
    try {
      const tx = await buildListTransaction(
        connection,
        publicKey,
        new PublicKey(selected.mint),
      );
      const sig = await sendAndConfirm(tx);
      setSignature(sig);
      await invalidate();
      setStep(4);
    } catch (err) {
      toast.error("Could not post listing", { description: describeSwapError(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-300 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-screen justify-center py-8 px-4">
        <div className="relative z-10 w-full max-w-4xl my-auto bg-gray-modern-950 border border-gray-modern-800 shadow-2xl flex flex-col gap-8 p-4 sm:p-10">
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 text-gray-modern-500 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-white text-[2.25rem]">Post Your Chimp</h2>
            <p className="text-base text-white">
              List your Chimpion for swapping
            </p>
          </div>

          <div className="hidden min-[332px]:flex justify-center">
            <StepIndicator current={effectiveStep} size="lg" />
          </div>

          <div className="flex flex-col">
            {effectiveStep === 1 && (
              <div className="flex flex-col items-center gap-6 text-center">
                <Image
                  src="/assets/wallet.png"
                  alt="Wallet Icon"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <h3 className="text-white text-[2rem]">Connect Your Wallet</h3>
                  <p className="text-gray-modern-400 text-base max-w-xs mx-auto">
                    Connect your Solana wallet to post your Chimpion.
                  </p>
                </div>
                <button
                  onClick={() => setVisible(true)}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-electric-purple-600 hover:bg-electric-purple-500 text-white font-bold font-sans text-base transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              </div>
            )}

            {effectiveStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl">
                    Select a Chimpion to Post
                  </h3>
                  <p className="text-gray-modern-400 text-base">
                    Choose which Chimpion you want to list for swapping
                  </p>
                </div>

                {loadingChimps ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-gray-modern-700 bg-rich-black-900 p-4 flex flex-col gap-4 animate-pulse"
                      >
                        <div className="h-5 bg-gray-modern-700 rounded w-2/3" />
                        <div className="aspect-square bg-gray-modern-700 rounded-sm" />
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="h-5 bg-gray-modern-700 rounded" />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : chimpsQuery.isError ? (
                  <div className="text-center py-12 text-gray-modern-500">
                    Could not load your Chimpions.{" "}
                    <button
                      onClick={() => chimpsQuery.refetch()}
                      className="cursor-pointer underline hover:text-white"
                    >
                      Retry
                    </button>
                  </div>
                ) : myChimps.length === 0 ? (
                  <div className="text-center py-12 text-gray-modern-500">
                    No Chimpions found in this wallet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myChimps.map((chimp) => {
                      const listed = listedMints.has(chimp.mint);
                      return (
                        <ChimpPickCard
                          key={chimp.mint}
                          chimp={chimp}
                          selected={selected?.mint === chimp.mint}
                          badge={listed ? "Listed" : undefined}
                          disabled={listed}
                          onClick={() =>
                            setSelected((prev) =>
                              prev?.mint === chimp.mint ? null : chimp,
                            )
                          }
                        />
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    disabled={!selected}
                    onClick={() => setStep(3)}
                    className={`cursor-pointer text-xl flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 border font-bold font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${selected ? "border-aqua-marine-800 bg-aqua-marine-800 text-white hover:bg-aqua-marine-700 hover:border-aqua-marine-700" : "border-gray-modern-600 text-white hover:bg-gray-modern-800"}`}
                  >
                    <span>Continue</span>
                    <Image
                      src="/assets/arrow-white.svg"
                      width={30}
                      height={30}
                      alt=""
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            )}

            {effectiveStep === 3 && selected && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl">Confirm Listing</h3>
                  <p className="text-gray-modern-400 text-base">
                    Review your listing before signing
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-full sm:w-60">
                    <ChimpPickCard chimp={selected} />
                  </div>
                </div>

                <div className="mx-auto max-w-lg text-center text-gray-modern-400 text-base flex flex-col gap-2">
                  <p>
                    Your Chimpion stays in your wallet. It is frozen while
                    listed so it cannot be moved until you remove the listing
                    or a swap completes.
                  </p>
                  {config && split && (
                    <p>
                      Posting is free apart from network rent. When someone
                      swaps for it they pay a {formatSol(config.swapFeeLamports)}{" "}
                      fee, of which {formatSol(split.lister)} goes to you.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-center items-center w-full gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={submitting}
                    className="cursor-pointer text-xl flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-gray-modern-600 text-white font-bold font-sans hover:bg-gray-modern-800 transition-colors disabled:opacity-40"
                  >
                    <Image
                      src="/assets/arrow-white.svg"
                      width={30}
                      height={30}
                      alt=""
                      className="w-4 h-4 scale-x-[-1]"
                    />
                    Back
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={submitting || !!config?.paused}
                    className="cursor-pointer text-xl flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-aqua-marine-800 font-bold font-sans bg-aqua-marine-800 hover:bg-aqua-marine-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirm in wallet…
                      </>
                    ) : (
                      <>
                        Post Listing
                        <Image
                          src="/assets/arrow-white.svg"
                          width={30}
                          height={30}
                          alt=""
                          className="w-4 h-4"
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {effectiveStep === 4 && selected && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <Image
                    src="/assets/complete.svg"
                    alt="Success Icon"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                  <h3 className="text-white text-3xl md:text-[2rem] font-bold leading-[90%]">
                    Listed Successfully!
                  </h3>
                  <p className="text-gray-modern-400 text-base max-w-xs mx-auto">
                    Your Chimpion is now visible in the Grail Grove. Other
                    collectors can now initiate swaps with you.
                  </p>
                  {signature && (
                    <a
                      href={orbTxUrl(signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-aqua-marine-400 hover:text-aqua-marine-300 text-base underline"
                    >
                      View transaction
                    </a>
                  )}
                </div>

                {selected.image && (
                  <div className="flex flex-col items-center gap-4 p-4 bg-rich-black-900 border border-gray-modern-700 rounded w-full sm:w-fit">
                    <div className="relative w-full sm:w-60 aspect-square overflow-hidden border border-gray-modern-700 bg-gray-modern-800">
                      <Image
                        src={selected.image}
                        alt={selected.name}
                        fill
                        unoptimized
                        className="object-cover [image-rendering:pixelated]"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="cursor-pointer text-xl flex items-center gap-2 justify-center w-full sm:w-auto px-4 py-2 border border-aqua-marine-800 bg-aqua-marine-800 text-white font-bold font-sans hover:bg-aqua-marine-700 hover:border-aqua-marine-700 transition-colors"
                >
                  <span>Done</span>
                  <Image
                    src="/assets/arrow-white.svg"
                    width={30}
                    height={30}
                    alt=""
                    className="w-4 h-4"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
