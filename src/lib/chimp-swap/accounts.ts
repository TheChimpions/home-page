import type { Connection, PublicKey } from "@solana/web3.js";
import type { BN } from "@coral-xyz/anchor";
import { findConfigPda, findListingPda } from "./constants";
import { getChimpSwapProgram } from "./program";

export interface SwapConfig {
  address: string;
  authority: string;
  pendingAuthority: string;
  treasury: string;
  collection: string;
  swapFeeLamports: bigint;
  treasuryBps: number;
  paused: boolean;
  activeListings: number;
}

export interface SwapListing {
  /** Listing PDA. */
  address: string;
  owner: string;
  mint: string;
  /** Owner's token account holding the frozen NFT. */
  tokenAccount: string;
  /** Unix seconds. */
  createdAt: number;
}

interface RawConfig {
  authority: PublicKey;
  pendingAuthority: PublicKey;
  treasury: PublicKey;
  collection: PublicKey;
  swapFeeLamports: BN;
  treasuryBps: number;
  paused: boolean;
  activeListings: BN;
}

interface RawListing {
  owner: PublicKey;
  mint: PublicKey;
  tokenAccount: PublicKey;
  createdAt: BN;
}

export function toSwapConfig(address: PublicKey, raw: RawConfig): SwapConfig {
  return {
    address: address.toBase58(),
    authority: raw.authority.toBase58(),
    pendingAuthority: raw.pendingAuthority.toBase58(),
    treasury: raw.treasury.toBase58(),
    collection: raw.collection.toBase58(),
    swapFeeLamports: BigInt(raw.swapFeeLamports.toString()),
    treasuryBps: raw.treasuryBps,
    paused: raw.paused,
    activeListings: raw.activeListings.toNumber(),
  };
}

export function toSwapListing(address: PublicKey, raw: RawListing): SwapListing {
  return {
    address: address.toBase58(),
    owner: raw.owner.toBase58(),
    mint: raw.mint.toBase58(),
    tokenAccount: raw.tokenAccount.toBase58(),
    createdAt: raw.createdAt.toNumber(),
  };
}

/** Null when the program has not been initialized on this cluster. */
export async function fetchSwapConfig(
  connection: Connection,
): Promise<SwapConfig | null> {
  const program = getChimpSwapProgram(connection);
  const address = findConfigPda(program.programId);
  const raw = await program.account.config.fetchNullable(address);
  return raw ? toSwapConfig(address, raw) : null;
}

export async function fetchAllSwapListings(
  connection: Connection,
): Promise<SwapListing[]> {
  const program = getChimpSwapProgram(connection);
  const all = await program.account.listing.all();
  return all
    .map((a) => toSwapListing(a.publicKey, a.account))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Listing.owner sits right after the 8-byte discriminator. */
const LISTING_OWNER_OFFSET = 8;

export async function fetchSwapListingsByOwner(
  connection: Connection,
  owner: PublicKey,
): Promise<SwapListing[]> {
  const program = getChimpSwapProgram(connection);
  const all = await program.account.listing.all([
    { memcmp: { offset: LISTING_OWNER_OFFSET, bytes: owner.toBase58() } },
  ]);
  return all
    .map((a) => toSwapListing(a.publicKey, a.account))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function fetchSwapListing(
  connection: Connection,
  mint: PublicKey,
): Promise<SwapListing | null> {
  const program = getChimpSwapProgram(connection);
  const address = findListingPda(mint, program.programId);
  const raw = await program.account.listing.fetchNullable(address);
  return raw ? toSwapListing(address, raw) : null;
}
