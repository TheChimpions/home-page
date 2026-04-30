"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Check, Wallet, X } from "lucide-react";
import { ChimpListing } from "@/types/listing";

interface MyChimp {
  mint: string;
  name: string;
  image: string;
  tribe?: string;
  type?: string;
  artist?: string;
  holder?: string;
}

const MOCK_CHIMPS: MyChimp[] = [
  {
    mint: "mock-1",
    name: "The Mercenary",
    image: "/carousel/1v2.png",
    tribe: "Old World Cult",
    type: "1/1",
    artist: "@_rabbels_",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
  {
    mint: "mock-2",
    name: "The Reincarnated",
    image: "/carousel/5v2.png",
    tribe: "Proletariat",
    type: "1/1",
    artist: "@katsudon_sol",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
  {
    mint: "mock-3",
    name: "The Juror",
    image: "/carousel/12v2.png",
    tribe: "Future War Pack",
    type: "1/1",
    artist: "@Sol_Cat17",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
];

function shortAddr(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function StepIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center justify-center">
      {([1, 2, 3, 4] as const).map((n, i) => {
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-[1.5rem] rounded-sm font-bold font-sans transition-colors ${
                done
                  ? "bg-aqua-marine-800 text-gray-modern-950 "
                  : active
                    ? "border-3 border-aqua-marine-800 text-white bg-gray-modern-900"
                    : "border border-gray-modern-700 text-gray-modern-500 bg-gray-modern-900"
              }`}
            >
              {done ? <Check className="w-5 h-5 sm:w-7 sm:h-7 stroke-3" /> : n}
            </div>
            {i < 3 && (
              <div
                className={`w-8 sm:w-12 h-0.5 ${done ? "bg-aqua-marine-800" : "bg-gray-modern-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const nftRows = [
  { icon: "/assets/tribe.svg", label: "Tribe", key: "tribe" as const },
  { icon: "/assets/type.svg", label: "Type", key: "type" as const },
  { icon: "/assets/holder.svg", label: "Holder", key: "holder" as const },
  { icon: "/assets/artist.svg", label: "Artist", key: "artist" as const },
];

function NftCard({
  name,
  image,
  tribe,
  type,
  holder,
  artist,
  selected,
  compact,
  onClick,
}: {
  name: string;
  image: string;
  tribe?: string;
  type?: string;
  holder?: string;
  artist?: string;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const values = {
    tribe,
    type,
    holder: holder ? shortAddr(holder) : undefined,
    artist,
  };

  const inner = (
    <>
      <h3
        className={`font-semibold text-sm sm:text-xl truncate text-white transition-opacity ${selected ? "opacity-40" : ""}`}
      >
        {name}
      </h3>
      <div
        className={`relative w-full overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950 ${compact ? "h-44" : "aspect-square"}`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-modern-800 animate-pulse" />
        )}
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            unoptimized
            onLoad={() => setImageLoaded(true)}
            className="object-cover [image-rendering:pixelated]"
          />
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
        className={`flex flex-col gap-2 transition-opacity ${selected ? "opacity-40" : ""}`}
      >
        {nftRows.map(({ icon, label, key }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={icon}
                alt=""
                width={20}
                height={20}
                className="size-3.5 sm:size-5"
              />
              <span className="text-white text-xs sm:text-xl">{label}:</span>
            </div>
            <span
              className="text-white text-xs sm:text-xl truncate max-w-24 sm:max-w-50"
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
        onClick={onClick}
        className={`group rounded-md border flex flex-col gap-4 p-4 text-left transition-colors cursor-pointer w-full shadow-[0_0_18px_rgba(0,0,0,0.25)] ${
          selected
            ? "border-[3.5px] border-aqua-marine-500 bg-[rgba(32,41,57,0.86)]"
            : "border border-gray-modern-600 bg-rich-black-900 hover:border-gray-modern-400"
        }`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="rounded-md border flex flex-col gap-4 border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)]">
      {inner}
    </div>
  );
}

interface SwapWizardModalProps {
  targetListing: ChimpListing;
  onClose: () => void;
}

export default function SwapWizardModal({
  targetListing,
  onClose,
}: SwapWizardModalProps) {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const effectiveStep: 1 | 2 | 3 | 4 = publicKey && step === 1 ? 2 : step;
  const [myChimps, setMyChimps] = useState<MyChimp[]>(MOCK_CHIMPS);
  const [loadingChimps, setLoadingChimps] = useState(false);
  const [selected, setSelected] = useState<MyChimp | null>(null);

  useEffect(() => {
    if (effectiveStep !== 2 || !publicKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingChimps(true);
    fetch(`/api/my-chimps?wallet=${publicKey.toBase58()}`)
      .then((r) => r.json())
      .then((data) => {
        setMyChimps(
          Array.isArray(data) && data.length > 0 ? data : MOCK_CHIMPS,
        );
        setLoadingChimps(false);
      })
      .catch(() => {
        setMyChimps(MOCK_CHIMPS);
        setLoadingChimps(false);
      });
  }, [effectiveStep, publicKey]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-300 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-screen justify-center py-8 px-4">
        <div className="relative z-10 w-full max-w-4xl my-auto bg-gray-modern-950 border border-gray-modern-800 shadow-2xl flex flex-col gap-8 p-4 sm:p-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-modern-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-white text-[2.25rem]">Swap Wizard</h2>
            <p className="text-base text-white">Trade your Chimpion</p>
          </div>

          <div className="hidden min-[332px]:flex justify-center">
            <StepIndicator current={effectiveStep} />
          </div>

          <div className="flex flex-col">
            {effectiveStep === 1 && (
              <div className="flex flex-col items-center gap-6 text-center">
                <div>
                  <Image
                    src="/assets/wallet.png"
                    alt="Wallet Icon"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <div>
                  <h3 className="text-white text-[2rem]">
                    Connect Your Wallet
                  </h3>
                  <p className="text-gray-modern-400 text-base max-w-xs mx-auto">
                    Connect your Solana wallet to list your Chimpion for
                    peer-to-peer swapping.
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
                  <h3 className="text-white font-bold text-lg">
                    Select your Chimpion to Swap
                  </h3>
                  <p className="text-gray-modern-400 text-base">
                    Choose which Chimpion you want to offer for this swap
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
                          <div
                            key={j}
                            className="h-5 bg-gray-modern-700 rounded"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myChimps.map((chimp) => (
                      <NftCard
                        key={chimp.mint}
                        {...chimp}
                        selected={selected?.mint === chimp.mint}
                        onClick={() =>
                          setSelected((prev) =>
                            prev?.mint === chimp.mint ? null : chimp,
                          )
                        }
                      />
                    ))}
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
                      alt="Arrow Right"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            )}

            {effectiveStep === 3 && selected && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h3 className="text-white font-bold text-lg">Confirm Swap</h3>
                  <p className="text-gray-modern-400 text-base">
                    Review your trade before signing
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-full sm:w-72">
                    <NftCard
                      name={selected.name}
                      image={selected.image}
                      tribe={selected.tribe}
                      type={selected.type}
                      holder={selected.holder}
                      artist={selected.artist}
                    />
                  </div>

                  <div className="shrink-0 flex items-center justify-center">
                    <Image
                      src="/assets/swapping.svg"
                      width={44}
                      height={44}
                      alt=""
                      className="w-11 h-14 sm:rotate-0 rotate-90"
                    />
                  </div>

                  <div className="w-full sm:w-72">
                    <NftCard
                      name={targetListing.name}
                      image={targetListing.image}
                      tribe={targetListing.tribe}
                      type={targetListing.type}
                      holder={targetListing.seller}
                      artist={targetListing.artist}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="cursor-pointer text-xl flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-gray-modern-600 text-white font-bold font-sans hover:bg-gray-modern-800 transition-colors"
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
                    onClick={() => setStep(4)}
                    className="cursor-pointer text-xl flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-aqua-marine-800 font-bold font-sans bg-aqua-marine-800 hover:bg-aqua-marine-700 text-white transition-colors"
                  >
                    Confirm and Sign
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

            {effectiveStep === 4 && (
              <div className="flex flex-col items-center gap-6 text-center">
                <Image
                  src="/assets/complete.svg"
                  alt="Success Icon"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <h3 className="text-white text-[2rem] font-bold">
                    Swap Complete!
                  </h3>
                  <p className="text-gray-modern-400 text-base max-w-lg mx-auto">
                    Congratulations! You&apos;ve successfully swapped your
                    Chimpion. Your new NFT is now in your wallet.
                  </p>
                </div>

                {targetListing.image && (
                  <div className="flex flex-col items-center gap-4 p-4 bg-rich-black-900 border border-gray-modern-700 rounded">
                    <div className="relative w-40 sm:w-60 aspect-square overflow-hidden border border-gray-modern-700 bg-gray-modern-800">
                      <div className="absolute inset-0 bg-gray-modern-800 animate-pulse" />
                      <Image
                        src={targetListing.image}
                        alt={targetListing.name}
                        fill
                        unoptimized
                        className="object-cover [image-rendering:pixelated]"
                      />
                    </div>
                    <span className="text-aqua-marine-700 text-xl">
                      Now Yours!
                    </span>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="cursor-pointer flex items-center text-xl gap-2 justify-center w-full sm:w-auto px-4 py-2 border border-aqua-marine-800 bg-aqua-marine-800 text-white font-bold font-sans hover:bg-aqua-marine-700 hover:border-aqua-marine-700 transition-colors"
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
