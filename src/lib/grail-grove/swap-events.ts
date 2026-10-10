import { EventParser } from "@coral-xyz/anchor";
import type { Connection } from "@solana/web3.js";
import { getChimpSwapProgram } from "@/lib/chimp-swap/program";

/** A completed Grail Grove swap, decoded from the program's Swapped event. */
export interface SwapEvent {
  signature: string;
  /** Unix seconds; null if the cluster didn't report a block time. */
  blockTime: number | null;
  /** Chimp that was posted on the board. */
  listedMint: string;
  /** Chimp the taker gave in exchange. */
  offeredMint: string;
  /** Wallet that posted the listing; receives the offered chimp. */
  lister: string;
  /** Wallet that took the listing; receives the listed chimp. */
  taker: string;
  feeLamports: number;
}

interface SwappedEventData {
  listedMint: { toBase58(): string };
  offeredMint: { toBase58(): string };
  lister: { toBase58(): string };
  taker: { toBase58(): string };
  feeLamports: { toString(): string };
}

/** Decode every Swapped event in a transaction's program logs. */
export function parseSwapEvents(
  connection: Connection,
  signature: string,
  logs: string[],
  blockTime: number | null,
): SwapEvent[] {
  const program = getChimpSwapProgram(connection);
  const parser = new EventParser(program.programId, program.coder);
  const out: SwapEvent[] = [];
  for (const event of parser.parseLogs(logs)) {
    if (event.name !== "swapped") continue;
    const data = event.data as unknown as SwappedEventData;
    out.push({
      signature,
      blockTime,
      listedMint: data.listedMint.toBase58(),
      offeredMint: data.offeredMint.toBase58(),
      lister: data.lister.toBase58(),
      taker: data.taker.toBase58(),
      feeLamports: Number(data.feeLamports.toString()),
    });
  }
  return out;
}

/**
 * Swaps in a confirmed transaction. Returns [] for transactions that aren't
 * swaps (listings, delists) or that failed. Throws when the transaction can't
 * be found yet, so callers can retry.
 */
export async function fetchSwapEvents(
  connection: Connection,
  signature: string,
): Promise<SwapEvent[]> {
  const tx = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!tx) throw new Error(`Transaction ${signature} not found yet`);
  if (tx.meta?.err) return [];
  return parseSwapEvents(
    connection,
    signature,
    tx.meta?.logMessages ?? [],
    tx.blockTime ?? null,
  );
}
