"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Check, Wallet, X } from "lucide-react";

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
    image: "/carousel/1.png",
    tribe: "Old World Cult",
    type: "1/1",
    artist: "@_rabbels_",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
  {
    mint: "mock-2",
    name: "The Reincarnated",
    image: "/carousel/5.png",
    tribe: "Proletariat",
    type: "1/1",
    artist: "@katsudon_sol",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
  {
    mint: "mock-3",
    name: "The Juror",
    image: "/carousel/12.png",
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
              className={`w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center text-lg sm:text-[2rem] rounded-sm font-bold font-sans transition-colors ${
                done
                  ? "bg-aqua-marine-800 text-gray-modern-950"
                  : active
                    ? "border-3 border-aqua-marine-800 text-white bg-gray-modern-900"
                    : "border border-gray-modern-700 text-gray-modern-500 bg-gray-modern-900"
              }`}
            >
              {done ? (
                <Check className="w-5 h-5 sm:w-10 sm:h-10 stroke-3" />
              ) : (
                n
              )}
            </div>
            {i < 3 && (
              <div
                className={`w-8 sm:w-16 h-0.5 ${done ? "bg-aqua-marine-800" : "bg-gray-modern-700"}`}
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

function ChimpCard({
  chimp,
  selected,
  compact,
  onClick,
}: {
  chimp: MyChimp;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const values = {
    tribe: chimp.tribe,
    type: chimp.type,
    holder: chimp.holder ? shortAddr(chimp.holder) : undefined,
    artist: chimp.artist,
  };

  const inner = (
    <>
      <h3
        className={`font-semibold truncate text-white transition-opacity ${compact ? "text-xs sm:text-base" : "text-sm sm:text-xl"} ${selected ? "opacity-40" : ""}`}
      >
        {chimp.name}
      </h3>
      <div
        className={`relative w-full overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950 ${compact ? "h-44" : "aspect-square"}`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-modern-800 animate-pulse" />
        )}
        {chimp.image && (
          <Image
            src={chimp.image}
            alt={chimp.name}
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
        className={`flex flex-col transition-opacity ${compact ? "gap-1" : "gap-2"} ${selected ? "opacity-40" : ""}`}
      >
        {nftRows.map(({ icon, label, key }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={icon}
                alt=""
                width={20}
                height={20}
                className={compact ? "size-3 sm:size-4" : "size-3.5 sm:size-5"}
              />
              <span
                className={`text-white ${compact ? "text-xs sm:text-base" : "text-xs sm:text-xl"}`}
              >
                {label}:
              </span>
            </div>
            <span
              className={`text-white truncate ${compact ? "max-w-20 sm:max-w-36 text-xs sm:text-base" : "max-w-24 sm:max-w-50 text-xs sm:text-xl"}`}
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
        className={`group rounded-md border flex flex-col text-left transition-colors cursor-pointer w-full shadow-[0_0_18px_rgba(0,0,0,0.25)] ${compact ? "gap-2 p-3" : "gap-4 p-4"} ${
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
    <div
      className={`rounded-md border flex flex-col border-gray-modern-600 bg-rich-black-900 shadow-[0_0_18px_rgba(0,0,0,0.25)] ${compact ? "gap-2 p-3" : "gap-4 p-4"}`}
    >
      {inner}
    </div>
  );
}

interface PostChimpModalProps {
  onClose: () => void;
}

export default function PostChimpModal({ onClose }: PostChimpModalProps) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(connected ? 2 : 1);
  const [myChimps, setMyChimps] = useState<MyChimp[]>([]);
  const [loadingChimps, setLoadingChimps] = useState(false);
  const [selected, setSelected] = useState<MyChimp | null>(null);

  useEffect(() => {
    if (connected && step === 1) setStep(2);
  }, [connected, step]);

  useEffect(() => {
    if (step === 2 && myChimps.length === 0) {
      if (!publicKey) {
        setMyChimps(MOCK_CHIMPS);
        return;
      }
      setLoadingChimps(true);
      fetch(`/api/my-chimps?wallet=${publicKey.toBase58()}`)
        .then((r) => r.json())
        .then((data) => {
          const chimps =
            Array.isArray(data) && data.length > 0 ? data : MOCK_CHIMPS;
          setMyChimps(chimps);
          setLoadingChimps(false);
        })
        .catch(() => {
          setMyChimps(MOCK_CHIMPS);
          setLoadingChimps(false);
        });
    }
  }, [step, publicKey, myChimps.length]);

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
            <h2 className="text-white text-[2.25rem]">Post Your Chimp</h2>
            <p className="text-base text-white">
              List your Chimpion for swapping
            </p>
          </div>

          <div className="hidden min-[332px]:flex justify-center">
            <StepIndicator current={step} />
          </div>

          <div className="flex flex-col">
            {step === 1 && (
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

            {step === 2 && (
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
                          <div
                            key={j}
                            className="h-5 bg-gray-modern-700 rounded"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : myChimps.length === 0 ? (
                  <div className="text-center py-12 text-gray-modern-500">
                    No Chimpions found in this wallet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myChimps.map((chimp) => (
                      <ChimpCard
                        key={chimp.mint}
                        chimp={chimp}
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
                      alt=""
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && selected && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl">
                    Confirm Listing
                  </h3>
                  <p className="text-gray-modern-400 text-base">
                    Review your listing before signing
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-full sm:w-60">
                    <ChimpCard chimp={selected} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-center items-center w-full gap-3">
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
                    Post Listing
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

            {step === 4 && selected && (
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <Image
                    src="/assets/complete.svg"
                    alt="Success Icon"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                  <h3 className="text-white text-3xl md:text-[2rem] font-bold  leading-[90%]">
                    Listed Successfully!
                  </h3>
                  <p className="text-gray-modern-400 text-base max-w-xs mx-auto">
                    Your Chimpion is now visible in the Grail Grove. Other
                    collectors can now initiate swaps with you.
                  </p>
                </div>

                {selected.image && (
                  <div className="flex flex-col items-center gap-4 p-4 bg-rich-black-900 border border-gray-modern-700 rounded w-full sm:w-fit">
                    <div className="relative w-full sm:w-60 aspect-square overflow-hidden border border-gray-modern-700 bg-gray-modern-800">
                      <div className="absolute inset-0 bg-gray-modern-800 animate-pulse" />
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
