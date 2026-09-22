import { Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";
import idlJson from "./idl/chimp_swap.json";
import type { ChimpSwap } from "./idl/chimp_swap";
import { CHIMP_SWAP_PROGRAM_ID } from "./constants";

/**
 * Read-only Anchor client. Enough to decode accounts and build instructions;
 * signing is done by the wallet adapter, never by this client.
 */
export function getChimpSwapProgram(
  connection: Connection,
  programId: PublicKey = CHIMP_SWAP_PROGRAM_ID,
): Program<ChimpSwap> {
  const idl = { ...idlJson, address: programId.toBase58() } as ChimpSwap;
  return new Program<ChimpSwap>(idl, { connection });
}
