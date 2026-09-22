import { BN } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createRevokeInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { SwapListing } from "./accounts";
import {
  TOKEN_METADATA_PROGRAM_ID,
  findConfigPda,
  findListingPda,
  findMasterEditionPda,
  findMetadataPda,
} from "./constants";
import { getChimpSwapProgram } from "./program";

/**
 * Token account of `owner` that actually holds `mint` (amount 1). Prefers the
 * associated token account; falls back to any other account for wallets that
 * received the NFT into a non-ATA.
 */
export async function findHeldTokenAccount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
): Promise<PublicKey | null> {
  const { value } = await connection.getParsedTokenAccountsByOwner(owner, {
    mint,
  });
  const holding = value.filter(
    (a) => a.account.data.parsed?.info?.tokenAmount?.amount === "1",
  );
  if (holding.length === 0) return null;
  const ata = getAssociatedTokenAddressSync(mint, owner, true);
  const preferred = holding.find((a) => a.pubkey.equals(ata));
  return (preferred ?? holding[0]).pubkey;
}

export interface ListParams {
  owner: PublicKey;
  mint: PublicKey;
  ownerTokenAccount: PublicKey;
}

export async function listInstruction(
  connection: Connection,
  { owner, mint, ownerTokenAccount }: ListParams,
): Promise<TransactionInstruction> {
  const program = getChimpSwapProgram(connection);
  return program.methods
    .list()
    .accountsPartial({
      config: findConfigPda(program.programId),
      listing: findListingPda(mint, program.programId),
      owner,
      mint,
      metadata: findMetadataPda(mint),
      masterEdition: findMasterEditionPda(mint),
      ownerTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export interface DelistParams {
  owner: PublicKey;
  mint: PublicKey;
  ownerTokenAccount: PublicKey;
}

export async function delistInstruction(
  connection: Connection,
  { owner, mint, ownerTokenAccount }: DelistParams,
): Promise<TransactionInstruction> {
  const program = getChimpSwapProgram(connection);
  return program.methods
    .delist()
    .accountsPartial({
      config: findConfigPda(program.programId),
      listing: findListingPda(mint, program.programId),
      owner,
      mint,
      masterEdition: findMasterEditionPda(mint),
      ownerTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();
}

export interface SwapParams {
  taker: PublicKey;
  lister: PublicKey;
  treasury: PublicKey;
  listedMint: PublicKey;
  listerListedTokenAccount: PublicKey;
  offeredMint: PublicKey;
  takerOfferedTokenAccount: PublicKey;
  /** Highest fee the taker accepts; the tx fails if the admin raised it above this. */
  maxFeeLamports: bigint;
}

export async function swapInstruction(
  connection: Connection,
  p: SwapParams,
): Promise<TransactionInstruction> {
  const program = getChimpSwapProgram(connection);
  return program.methods
    .swap(new BN(p.maxFeeLamports.toString()))
    .accountsPartial({
      config: findConfigPda(program.programId),
      listing: findListingPda(p.listedMint, program.programId),
      taker: p.taker,
      lister: p.lister,
      treasury: p.treasury,
      listedMint: p.listedMint,
      listedMasterEdition: findMasterEditionPda(p.listedMint),
      listerListedTokenAccount: p.listerListedTokenAccount,
      takerListedTokenAccount: getAssociatedTokenAddressSync(
        p.listedMint,
        p.taker,
        true,
      ),
      offeredMint: p.offeredMint,
      offeredMetadata: findMetadataPda(p.offeredMint),
      takerOfferedTokenAccount: p.takerOfferedTokenAccount,
      listerOfferedTokenAccount: getAssociatedTokenAddressSync(
        p.offeredMint,
        p.lister,
        true,
      ),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction();
}

/** Clears a leftover delegate approval after an admin eject. */
export function revokeInstruction(
  tokenAccount: PublicKey,
  owner: PublicKey,
): TransactionInstruction {
  return createRevokeInstruction(tokenAccount, owner);
}

function wrap(feePayer: PublicKey, ...ixs: TransactionInstruction[]): Transaction {
  const tx = new Transaction();
  tx.feePayer = feePayer;
  tx.add(...ixs);
  return tx;
}

export class NotHoldingError extends Error {
  constructor(mint: PublicKey) {
    super(`Wallet does not hold ${mint.toBase58()}`);
    this.name = "NotHoldingError";
  }
}

export async function buildListTransaction(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
): Promise<Transaction> {
  const ownerTokenAccount = await findHeldTokenAccount(connection, owner, mint);
  if (!ownerTokenAccount) throw new NotHoldingError(mint);
  return wrap(
    owner,
    await listInstruction(connection, { owner, mint, ownerTokenAccount }),
  );
}

export async function buildDelistTransaction(
  connection: Connection,
  owner: PublicKey,
  listing: SwapListing,
): Promise<Transaction> {
  return wrap(
    owner,
    await delistInstruction(connection, {
      owner,
      mint: new PublicKey(listing.mint),
      ownerTokenAccount: new PublicKey(listing.tokenAccount),
    }),
  );
}

export async function buildSwapTransaction(
  connection: Connection,
  taker: PublicKey,
  listing: SwapListing,
  offeredMint: PublicKey,
  treasury: PublicKey,
  maxFeeLamports: bigint,
): Promise<Transaction> {
  const takerOfferedTokenAccount = await findHeldTokenAccount(
    connection,
    taker,
    offeredMint,
  );
  if (!takerOfferedTokenAccount) throw new NotHoldingError(offeredMint);
  return wrap(
    taker,
    await swapInstruction(connection, {
      taker,
      lister: new PublicKey(listing.owner),
      treasury,
      listedMint: new PublicKey(listing.mint),
      listerListedTokenAccount: new PublicKey(listing.tokenAccount),
      offeredMint,
      takerOfferedTokenAccount,
      maxFeeLamports,
    }),
  );
}

export function buildRevokeTransaction(
  owner: PublicKey,
  tokenAccount: PublicKey,
): Transaction {
  return wrap(owner, revokeInstruction(tokenAccount, owner));
}
