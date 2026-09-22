"use client";

import { useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PublicKey, Transaction } from "@solana/web3.js";
import {
  fetchSwapConfig,
  fetchSwapListingsByOwner,
  type SwapConfig,
  type SwapListing,
} from "@/lib/chimp-swap";
import type { ChimpListing, MyChimp } from "@/types/listing";

export const swapKeys = {
  all: ["chimp-swap"] as const,
  listings: () => ["chimp-swap", "listings"] as const,
  config: () => ["chimp-swap", "config"] as const,
  myListings: (owner: string) => ["chimp-swap", "my-listings", owner] as const,
  myChimps: (owner: string) => ["my-chimps", owner] as const,
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

/** All open listings with metadata, from /api/listings. */
export function useSwapListings() {
  return useQuery<ChimpListing[]>({
    queryKey: swapKeys.listings(),
    queryFn: () => getJson<ChimpListing[]>("/api/listings"),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** On-chain program config (fee, split, paused). Null if not initialized. */
export function useSwapConfig() {
  const { connection } = useConnection();
  return useQuery<SwapConfig | null>({
    queryKey: swapKeys.config(),
    queryFn: () => fetchSwapConfig(connection),
    staleTime: 60_000,
  });
}

/** Chimpions held by `owner`, from /api/my-chimps. */
export function useMyChimps(owner?: PublicKey | null) {
  const key = owner?.toBase58() ?? "";
  return useQuery<MyChimp[]>({
    queryKey: swapKeys.myChimps(key),
    queryFn: () => getJson<MyChimp[]>(`/api/my-chimps?wallet=${key}`),
    enabled: !!owner,
    staleTime: 30_000,
  });
}

/** Open listings posted by `owner`, read straight from chain. */
export function useMyListings(owner?: PublicKey | null) {
  const { connection } = useConnection();
  const key = owner?.toBase58() ?? "";
  return useQuery<SwapListing[]>({
    queryKey: swapKeys.myListings(key),
    queryFn: () => fetchSwapListingsByOwner(connection, owner!),
    enabled: !!owner,
    staleTime: 15_000,
  });
}

/** Drop every cached swap query after a transaction lands. */
export function useInvalidateSwapData() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: swapKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["my-chimps"] }),
      ]),
    [queryClient],
  );
}

/**
 * Sign with the connected wallet, send, and wait for "confirmed". Throws with
 * the on-chain error attached when the transaction fails.
 */
export function useSendAndConfirm() {
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();
  return useCallback(
    async (tx: Transaction): Promise<string> => {
      const latest = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = latest.blockhash;
      const signature = await sendTransaction(tx, connection, {
        preflightCommitment: "confirmed",
      });
      const result = await connection.confirmTransaction(
        { signature, ...latest },
        "confirmed",
      );
      if (result.value.err) {
        throw new Error(
          `Transaction ${signature} failed: ${JSON.stringify(result.value.err)}`,
        );
      }
      return signature;
    },
    [connection, sendTransaction],
  );
}
