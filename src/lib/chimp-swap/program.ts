import { Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";
import idlJson from "./idl/grail_grove.json";
import type { GrailGrove } from "./idl/grail_grove";
import { CHIMP_SWAP_PROGRAM_ID } from "./constants";

/**
 * Read-only Anchor client. Enough to decode accounts and build instructions;
 * signing is done by the wallet adapter, never by this client.
 */
export function getChimpSwapProgram(
  connection: Connection,
  programId: PublicKey = CHIMP_SWAP_PROGRAM_ID,
): Program<GrailGrove> {
  const idl = { ...idlJson, address: programId.toBase58() } as GrailGrove;
  return new Program<GrailGrove>(idl, { connection });
}
