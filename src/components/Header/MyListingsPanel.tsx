"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Users, Diamond, User, Loader2 } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { toast } from "sonner";
import type { MyChimp } from "@/types/listing";
import type { SwapListing } from "@/lib/chimp-swap/accounts";
import { findListingPda } from "@/lib/chimp-swap/constants";
import {
  buildDelistTransaction,
  buildRevokeTransaction,
} from "@/lib/chimp-swap/instructions";
import { describeSwapError } from "@/lib/chimp-swap/errors";
import {
  useInvalidateSwapData,
  useMyChimps,
  useMyListings,
  useSendAndConfirm,
} from "@/hooks/use-chimp-swap";
import { orbTxUrl } from "@/lib/utils";

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

/**
 * Token accounts still approved to a Listing PDA after an admin eject. The
 * listing is gone (so the program cannot act), but the approval lingers
 * until the owner revokes it.
 */
function useLeftoverApprovals(
  owner: PublicKey | null,
  chimps: MyChimp[],
  listings: SwapListing[],
) {
  const { connection } = useConnection();
  const listedMints = useMemo(
    () => new Set(listings.map((l) => l.mint)),
    [listings],
  );
  const candidates = useMemo(
    () => chimps.filter((c) => !listedMints.has(c.mint)).map((c) => c.mint),
    [chimps, listedMints],
  );
  return useQuery<Record<string, string>>({
    queryKey: ["chimp-swap", "leftover-approvals", owner?.toBase58(), candidates],
    enabled: !!owner && candidates.length > 0,
    queryFn: async () => {
      const { value } = await connection.getParsedTokenAccountsByOwner(owner!, {
        programId: TOKEN_PROGRAM_ID,
      });
      const out: Record<string, string> = {};
      for (const { pubkey, account } of value) {
        const info = account.data.parsed?.info;
        const mint: string | undefined = info?.mint;
        const delegate: string | undefined = info?.delegate;
        if (!mint || !delegate || !candidates.includes(mint)) continue;
        if (delegate === findListingPda(new PublicKey(mint)).toBase58()) {
          out[mint] = pubkey.toBase58();
        }
      }
      return out;
    },
  });
}

function ChimpRow({
  chimp,
  listing,
  leftoverTokenAccount,
}: {
  chimp: MyChimp;
  listing?: SwapListing;
  leftoverTokenAccount?: string;
}) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const sendAndConfirm = useSendAndConfirm();
  const invalidate = useInvalidateSwapData();
  const [busy, setBusy] = useState(false);

  async function run(label: string, build: () => Promise<Parameters<typeof sendAndConfirm>[0]>) {
    if (!publicKey) return;
    setBusy(true);
    try {
      const sig = await sendAndConfirm(await build());
      await invalidate();
      toast.success(label, {
        description: chimp.name,
        action: { label: "View tx", onClick: () => window.open(orbTxUrl(sig), "_blank") },
      });
    } catch (err) {
      toast.error(`${label} failed`, { description: describeSwapError(err) });
    } finally {
      setBusy(false);
    }
  }

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
          <span className="text-white text-sm font-bold truncate">{chimp.name}</span>
          {listing ? (
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-aqua-marine-900 text-white">
              Listed
            </span>
          ) : (
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold border border-gray-modern-700 text-gray-modern-500">
              Not listed
            </span>
          )}
        </div>
        <MetaRow icon={<Users className="w-3 h-3" />} label="Tribe:" value={chimp.tribe} />
        <MetaRow icon={<Diamond className="w-3 h-3" />} label="Type:" value={chimp.type} />
        <MetaRow icon={<User className="w-3 h-3" />} label="Artist:" value={chimp.artist} />

        {listing && publicKey && (
          <button
            disabled={busy}
            onClick={() =>
              run("Listing removed", () =>
                buildDelistTransaction(connection, publicKey, listing),
              )
            }
            className="cursor-pointer mt-1 self-start flex items-center gap-1.5 px-2 py-1 text-xs font-bold border border-gray-modern-600 text-white hover:bg-gray-modern-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 className="w-3 h-3 animate-spin" />}
            Remove listing
          </button>
        )}

        {!listing && leftoverTokenAccount && publicKey && (
          <button
            disabled={busy}
            title="An admin closed this listing. Clear the leftover approval to tidy up."
            onClick={() =>
              run("Approval cleared", async () =>
                buildRevokeTransaction(publicKey, new PublicKey(leftoverTokenAccount)),
              )
            }
            className="cursor-pointer mt-1 self-start flex items-center gap-1.5 px-2 py-1 text-xs font-bold border border-gold-500 text-gold-500 hover:bg-gray-modern-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 className="w-3 h-3 animate-spin" />}
            Clear approval
          </button>
        )}
      </div>
    </div>
  );
}

interface MyListingsPanelProps {
  onClose: () => void;
}

export default function MyListingsPanel({ onClose }: MyListingsPanelProps) {
  const { publicKey } = useWallet();
  const chimpsQuery = useMyChimps(publicKey);
  const listingsQuery = useMyListings(publicKey);
  const chimps = useMemo(() => chimpsQuery.data ?? [], [chimpsQuery.data]);
  const listings = useMemo(() => listingsQuery.data ?? [], [listingsQuery.data]);
  const leftovers = useLeftoverApprovals(publicKey, chimps, listings);

  const listingByMint = useMemo(
    () => new Map(listings.map((l) => [l.mint, l])),
    [listings],
  );
  const sorted = useMemo(
    () =>
      [...chimps].sort(
        (a, b) =>
          Number(listingByMint.has(b.mint)) - Number(listingByMint.has(a.mint)),
      ),
    [chimps, listingByMint],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const loading = !!publicKey && (chimpsQuery.isPending || listingsQuery.isPending);

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
            {listings.length > 0 && (
              <span className="ml-2 text-gray-modern-500 font-normal">
                {listings.length} listed
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-modern-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {!publicKey ? (
            <p className="text-gray-modern-500 text-sm text-center py-8">
              Connect your wallet to see your listings.
            </p>
          ) : loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-modern-900 animate-pulse border border-gray-modern-800"
              />
            ))
          ) : chimpsQuery.isError ? (
            <p className="text-gray-modern-500 text-base text-center py-8">
              Could not load your Chimpions.
            </p>
          ) : sorted.length === 0 ? (
            <p className="text-gray-modern-500 text-base text-center py-8">
              No Chimpions found in this wallet.
            </p>
          ) : (
            sorted.map((chimp) => (
              <ChimpRow
                key={chimp.mint}
                chimp={chimp}
                listing={listingByMint.get(chimp.mint)}
                leftoverTokenAccount={leftovers.data?.[chimp.mint]}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
