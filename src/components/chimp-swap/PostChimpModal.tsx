"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ArrowRight, ArrowLeft, Check, Wallet } from "lucide-react";
import { Users, Diamond, User, Palette } from "lucide-react";

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
    image: "https://arweave.net/vj1GeW0LTfoqGbZ1zJZujfV7l6v5VbyCfQVJVyZGaE0",
    tribe: "Old World Cult",
    type: "1/1",
    artist: "@_rabbels_",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
  {
    mint: "mock-2",
    name: "The Reincarnated",
    image: "https://arweave.net/kKkMVXVsZCu5UtPMSTj3BJFE_aUGVqr1VIW7E_JqhZY",
    tribe: "Proletariat",
    type: "1/1",
    artist: "@katsudon_sol",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
  {
    mint: "mock-3",
    name: "The Juror",
    image: "https://arweave.net/Q2Q2NfJSfQEzRhMrS3MoNJcRXDmS3JzZ_JTQK5BFWA",
    tribe: "Future War Pack",
    type: "1/1",
    artist: "@Sol_Cat17",
    holder: "8GwdguquB96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
  },
];


function StepIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {([1, 2, 3, 4] as const).map((n, i) => {
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div
              className={`w-10 h-10 flex items-center justify-center text-sm font-bold font-sans transition-colors ${
                done
                  ? "bg-aqua-marine-500 text-gray-modern-950"
                  : active
                    ? "border-2 border-aqua-marine-500 text-white bg-gray-modern-900"
                    : "border border-gray-modern-700 text-gray-modern-500 bg-gray-modern-900"
              }`}
            >
              {done ? <Check className="w-4 h-4 stroke-[3]" /> : n}
            </div>
            {i < 3 && (
              <div
                className={`w-16 h-px ${done ? "bg-aqua-marine-500" : "bg-gray-modern-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}


function MetaRow({
  icon,
  label,
  value,
  faded,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  faded?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm transition-opacity ${faded ? "opacity-40" : ""}`}
    >
      <span className="text-gray-modern-500 shrink-0">{icon}</span>
      <span className="text-gray-modern-400">{label}</span>
      <span className="ml-auto text-gray-modern-200 truncate max-w-24 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

function ChimpCard({
  chimp,
  selected,
  onClick,
}: {
  chimp: MyChimp;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col text-left border transition-colors cursor-pointer ${
        selected
          ? "border-aqua-marine-500 bg-gray-modern-800"
          : "border-gray-modern-700 bg-gray-modern-900 hover:border-gray-modern-500"
      }`}
    >
      <div className="px-3 pt-3 pb-2">
        <span
          className={`text-sm font-bold truncate block ${selected ? "text-aqua-marine-400" : "text-white"}`}
        >
          {chimp.name}
        </span>
      </div>

      <div className="relative aspect-square w-full overflow-hidden">
        {chimp.image ? (
          <Image
            src={chimp.image}
            alt={chimp.name}
            fill
            unoptimized
            className={`object-cover [image-rendering:pixelated] transition-opacity ${selected ? "opacity-50" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-modern-800" />
        )}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="w-10 h-10 text-aqua-marine-400 stroke-[3]" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 px-3 py-3">
        <MetaRow
          icon={<Users className="w-3.5 h-3.5" />}
          label="Tribe:"
          value={chimp.tribe}
          faded={selected}
        />
        <MetaRow
          icon={<Diamond className="w-3.5 h-3.5" />}
          label="Type:"
          value={chimp.type}
          faded={selected}
        />
        <MetaRow
          icon={<User className="w-3.5 h-3.5" />}
          label="Holder:"
          value={
            chimp.holder
              ? `${chimp.holder.slice(0, 4)}...${chimp.holder.slice(-4)}`
              : undefined
          }
          faded={selected}
        />
        <MetaRow
          icon={<Palette className="w-3.5 h-3.5" />}
          label="Artist:"
          value={chimp.artist}
          faded={selected}
        />
      </div>
    </button>
  );
}


interface PostChimpModalProps {
  onClose: () => void;
}

export default function PostChimpModal({ onClose }: PostChimpModalProps) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(2);
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
          const chimps = Array.isArray(data) && data.length > 0 ? data : MOCK_CHIMPS;
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
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto py-16 px-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl bg-gray-modern-900 border border-gray-modern-800 shadow-2xl">
        <div className="text-center pt-10 pb-6 px-8 border-b border-gray-modern-800">
          <h2 className="text-white font-title text-2xl mb-1">Post Your Chimp</h2>
          <p className="text-gray-modern-400 text-sm">
            List your Chimpion for peer-to-peer swapping
          </p>
        </div>

        <div className="flex justify-center py-8">
          <StepIndicator current={step} />
        </div>

        <div className="px-8 pb-10">
          {step === 1 && (
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <Wallet className="w-12 h-12 text-gray-modern-500" />
              <div>
                <h3 className="text-white font-bold text-lg mb-1">
                  Connect your wallet
                </h3>
                <p className="text-gray-modern-400 text-sm">
                  Connect to see your Chimpions and post one for swapping.
                </p>
              </div>
              <button
                onClick={() => setVisible(true)}
                className="cursor-pointer h-12 px-6 border border-aqua-marine-500 text-aqua-marine-500 font-bold font-sans hover:bg-aqua-marine-500 hover:text-gray-modern-950 transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h3 className="text-white font-bold text-lg mb-1">
                  Select a Chimpion to Post
                </h3>
                <p className="text-gray-modern-400 text-sm">
                  Choose which Chimpion you want to list for swapping
                </p>
              </div>

              {loadingChimps ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] bg-gray-modern-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : myChimps.length === 0 ? (
                <div className="text-center py-12 text-gray-modern-500">
                  No Chimpions found in this wallet.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-1">
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

              <div className="flex justify-center mt-2">
                <button
                  disabled={!selected}
                  onClick={() => setStep(3)}
                  className="cursor-pointer flex items-center gap-2 h-12 px-6 border border-gray-modern-600 text-white font-bold font-sans hover:bg-gray-modern-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && selected && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h3 className="text-white font-bold text-lg mb-1">
                  Confirm listing
                </h3>
                <p className="text-gray-modern-400 text-sm">
                  Choose which Chimpion you want to list for swapping
                </p>
              </div>

              <div className="flex justify-center">
                <div className="w-48 border border-gray-modern-700 bg-gray-modern-950">
                  <div className="px-3 pt-3 pb-2">
                    <span className="text-white text-sm font-bold truncate block">
                      {selected.name}
                    </span>
                  </div>
                  <div className="relative aspect-square w-full overflow-hidden">
                    {selected.image && (
                      <Image
                        src={selected.image}
                        alt={selected.name}
                        fill
                        unoptimized
                        className="object-cover [image-rendering:pixelated]"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 px-3 py-3">
                    <MetaRow
                      icon={<Users className="w-3.5 h-3.5" />}
                      label="Tribe:"
                      value={selected.tribe}
                    />
                    <MetaRow
                      icon={<Diamond className="w-3.5 h-3.5" />}
                      label="Type:"
                      value={selected.type}
                    />
                    <MetaRow
                      icon={<User className="w-3.5 h-3.5" />}
                      label="Holder:"
                      value={
                        selected.holder
                          ? `${selected.holder.slice(0, 4)}...${selected.holder.slice(-4)}`
                          : undefined
                      }
                    />
                    <MetaRow
                      icon={<Palette className="w-3.5 h-3.5" />}
                      label="Artist:"
                      value={selected.artist}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-2">
                <button
                  onClick={() => setStep(2)}
                  className="cursor-pointer flex items-center gap-2 h-12 px-6 border border-gray-modern-600 text-white font-bold font-sans hover:bg-gray-modern-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="cursor-pointer flex items-center gap-2 h-12 px-6 border border-aqua-marine-500 text-aqua-marine-500 font-bold font-sans hover:bg-aqua-marine-500 hover:text-gray-modern-950 transition-colors"
                >
                  Post Listing <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && selected && (
            <div className="flex flex-col items-center gap-6 text-center">
              <Check className="w-10 h-10 text-aqua-marine-400 stroke-[2.5]" />
              <div>
                <h3 className="text-white font-title text-2xl mb-2">
                  Listed Successfully!
                </h3>
                <p className="text-gray-modern-400 text-sm max-w-xs mx-auto">
                  Your Chimpion is now visible in the Grail Grove gallery. Other
                  collectors can now initiate swaps with you.
                </p>
              </div>

              {selected.image && (
                <div className="relative w-40 aspect-square overflow-hidden border border-gray-modern-700">
                  <Image
                    src={selected.image}
                    alt={selected.name}
                    fill
                    unoptimized
                    className="object-cover [image-rendering:pixelated]"
                  />
                </div>
              )}

              <button
                onClick={onClose}
                className="cursor-pointer flex items-center gap-2 h-12 px-6 border border-gray-modern-600 text-white font-bold font-sans hover:bg-gray-modern-800 transition-colors"
              >
                Done <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
