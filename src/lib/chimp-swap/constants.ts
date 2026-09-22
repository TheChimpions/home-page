import { PublicKey } from "@solana/web3.js";
import idl from "./idl/chimp_swap.json";

/**
 * Chimp Swap program id. Defaults to the address baked into the IDL; override
 * with NEXT_PUBLIC_CHIMP_SWAP_PROGRAM_ID for devnet/staging deployments.
 */
export const CHIMP_SWAP_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_CHIMP_SWAP_PROGRAM_ID || idl.address,
);

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

const enc = new TextEncoder();
const CONFIG_SEED = enc.encode("config");
const LISTING_SEED = enc.encode("listing");
const METADATA_SEED = enc.encode("metadata");
const EDITION_SEED = enc.encode("edition");

export function findConfigPda(
  programId: PublicKey = CHIMP_SWAP_PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync([CONFIG_SEED], programId)[0];
}

export function findListingPda(
  mint: PublicKey,
  programId: PublicKey = CHIMP_SWAP_PROGRAM_ID,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [LISTING_SEED, mint.toBytes()],
    programId,
  )[0];
}

export function findMetadataPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [METADATA_SEED, TOKEN_METADATA_PROGRAM_ID.toBytes(), mint.toBytes()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}

export function findMasterEditionPda(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      METADATA_SEED,
      TOKEN_METADATA_PROGRAM_ID.toBytes(),
      mint.toBytes(),
      EDITION_SEED,
    ],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];
}
