import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import idl from "../idl/chimp_swap.json";
import {
  CHIMP_SWAP_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
  findConfigPda,
  findListingPda,
  findMasterEditionPda,
  findMetadataPda,
} from "../constants";
import {
  NotHoldingError,
  buildListTransaction,
  buildRevokeTransaction,
  buildSwapTransaction,
  delistInstruction,
  findHeldTokenAccount,
  listInstruction,
  swapInstruction,
} from "../instructions";

// Never contacted: instruction building is offline.
const connection = new Connection("http://127.0.0.1:1");

const owner = Keypair.generate().publicKey;
const taker = Keypair.generate().publicKey;
const treasury = Keypair.generate().publicKey;
const mint = Keypair.generate().publicKey;
const offeredMint = Keypair.generate().publicKey;
const ownerAta = getAssociatedTokenAddressSync(mint, owner);
const takerOfferedAta = getAssociatedTokenAddressSync(offeredMint, taker);

function idlAccountNames(name: string): string[] {
  return idl.instructions.find((i) => i.name === name)!.accounts.map((a) => a.name);
}

function discriminator(name: string): number[] {
  return idl.instructions.find((i) => i.name === name)!.discriminator;
}

describe("listInstruction", () => {
  it("targets the program with the IDL discriminator and account order", async () => {
    const ix = await listInstruction(connection, { owner, mint, ownerTokenAccount: ownerAta });
    expect(ix.programId.equals(CHIMP_SWAP_PROGRAM_ID)).toBe(true);
    expect([...ix.data.subarray(0, 8)]).toEqual(discriminator("list"));
    expect(ix.keys).toHaveLength(idlAccountNames("list").length);

    const keys = ix.keys.map((k) => k.pubkey.toBase58());
    expect(keys).toEqual(
      [
        findConfigPda(),
        findListingPda(mint),
        owner,
        mint,
        findMetadataPda(mint),
        findMasterEditionPda(mint),
        ownerAta,
        TOKEN_PROGRAM_ID,
        TOKEN_METADATA_PROGRAM_ID,
        SystemProgram.programId,
      ].map((k) => k.toBase58()),
    );
  });

  it("marks only the owner as signer, and the mutable accounts as writable", async () => {
    const ix = await listInstruction(connection, { owner, mint, ownerTokenAccount: ownerAta });
    const byKey = new Map(ix.keys.map((k) => [k.pubkey.toBase58(), k]));
    const signers = ix.keys.filter((k) => k.isSigner).map((k) => k.pubkey.toBase58());
    expect(signers).toEqual([owner.toBase58()]);
    expect(byKey.get(findConfigPda().toBase58())!.isWritable).toBe(true);
    expect(byKey.get(findListingPda(mint).toBase58())!.isWritable).toBe(true);
    expect(byKey.get(ownerAta.toBase58())!.isWritable).toBe(true);
    expect(byKey.get(mint.toBase58())!.isWritable).toBe(false);
    expect(byKey.get(findMetadataPda(mint).toBase58())!.isWritable).toBe(false);
  });
});

describe("delistInstruction", () => {
  it("uses the IDL account order", async () => {
    const ix = await delistInstruction(connection, { owner, mint, ownerTokenAccount: ownerAta });
    expect([...ix.data.subarray(0, 8)]).toEqual(discriminator("delist"));
    expect(ix.keys.map((k) => k.pubkey.toBase58())).toEqual(
      [
        findConfigPda(),
        findListingPda(mint),
        owner,
        mint,
        findMasterEditionPda(mint),
        ownerAta,
        TOKEN_PROGRAM_ID,
        TOKEN_METADATA_PROGRAM_ID,
      ].map((k) => k.toBase58()),
    );
    expect(ix.keys.filter((k) => k.isSigner).map((k) => k.pubkey.toBase58())).toEqual([
      owner.toBase58(),
    ]);
  });
});

describe("swapInstruction", () => {
  const params = {
    taker,
    lister: owner,
    treasury,
    listedMint: mint,
    listerListedTokenAccount: ownerAta,
    offeredMint,
    takerOfferedTokenAccount: takerOfferedAta,
    maxFeeLamports: BigInt(10_000_000),
  };

  it("uses the IDL account order and derives both destination ATAs", async () => {
    const ix = await swapInstruction(connection, params);
    expect([...ix.data.subarray(0, 8)]).toEqual(discriminator("swap"));
    expect(ix.keys.map((k) => k.pubkey.toBase58())).toEqual(
      [
        findConfigPda(),
        findListingPda(mint),
        taker,
        owner,
        treasury,
        mint,
        findMasterEditionPda(mint),
        ownerAta,
        getAssociatedTokenAddressSync(mint, taker),
        offeredMint,
        findMetadataPda(offeredMint),
        takerOfferedAta,
        getAssociatedTokenAddressSync(offeredMint, owner),
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        SystemProgram.programId,
        TOKEN_METADATA_PROGRAM_ID,
      ].map((k) => k.toBase58()),
    );
  });

  it("encodes max_fee_lamports as a little-endian u64", async () => {
    const ix = await swapInstruction(connection, params);
    expect(ix.data.length).toBe(16);
    expect(ix.data.readBigUInt64LE(8)).toBe(BigInt(10_000_000));
  });

  it("only the taker signs; lister and treasury are writable non-signers", async () => {
    const ix = await swapInstruction(connection, params);
    const byKey = new Map(ix.keys.map((k) => [k.pubkey.toBase58(), k]));
    expect(ix.keys.filter((k) => k.isSigner).map((k) => k.pubkey.toBase58())).toEqual([
      taker.toBase58(),
    ]);
    expect(byKey.get(owner.toBase58())).toMatchObject({ isSigner: false, isWritable: true });
    expect(byKey.get(treasury.toBase58())).toMatchObject({ isSigner: false, isWritable: true });
  });
});

describe("findHeldTokenAccount", () => {
  function fakeConnection(accounts: { pubkey: PublicKey; amount: string }[]) {
    return {
      getParsedTokenAccountsByOwner: async () => ({
        value: accounts.map((a) => ({
          pubkey: a.pubkey,
          account: { data: { parsed: { info: { tokenAmount: { amount: a.amount } } } } },
        })),
      }),
    } as unknown as Connection;
  }

  it("prefers the ATA when several accounts hold the mint", async () => {
    const other = Keypair.generate().publicKey;
    const found = await findHeldTokenAccount(
      fakeConnection([
        { pubkey: other, amount: "1" },
        { pubkey: ownerAta, amount: "1" },
      ]),
      owner,
      mint,
    );
    expect(found!.equals(ownerAta)).toBe(true);
  });

  it("falls back to a non-ATA account that holds the token", async () => {
    const other = Keypair.generate().publicKey;
    const found = await findHeldTokenAccount(
      fakeConnection([
        { pubkey: ownerAta, amount: "0" },
        { pubkey: other, amount: "1" },
      ]),
      owner,
      mint,
    );
    expect(found!.equals(other)).toBe(true);
  });

  it("returns null when nothing holds the token", async () => {
    expect(
      await findHeldTokenAccount(fakeConnection([{ pubkey: ownerAta, amount: "0" }]), owner, mint),
    ).toBeNull();
  });
});

describe("transaction builders", () => {
  const holding = {
    getParsedTokenAccountsByOwner: async (_owner: PublicKey, filter: { mint: PublicKey }) => ({
      value: [
        {
          pubkey: getAssociatedTokenAddressSync(filter.mint, _owner),
          account: { data: { parsed: { info: { tokenAmount: { amount: "1" } } } } },
        },
      ],
    }),
  } as unknown as Connection;
  const empty = {
    getParsedTokenAccountsByOwner: async () => ({ value: [] }),
  } as unknown as Connection;

  it("buildListTransaction sets the fee payer and resolves the token account", async () => {
    const tx = await buildListTransaction(holding, owner, mint);
    expect(tx.feePayer!.equals(owner)).toBe(true);
    expect(tx.instructions).toHaveLength(1);
    expect(tx.instructions[0].keys[6].pubkey.equals(ownerAta)).toBe(true);
  });

  it("buildListTransaction throws NotHoldingError when the wallet lacks the NFT", async () => {
    await expect(buildListTransaction(empty, owner, mint)).rejects.toBeInstanceOf(NotHoldingError);
  });

  it("buildSwapTransaction wires the listing and the taker's offered account", async () => {
    const tx = await buildSwapTransaction(
      holding,
      taker,
      { address: "x", owner: owner.toBase58(), mint: mint.toBase58(), tokenAccount: ownerAta.toBase58(), createdAt: 1 },
      offeredMint,
      treasury,
      BigInt(5),
    );
    expect(tx.feePayer!.equals(taker)).toBe(true);
    const keys = tx.instructions[0].keys.map((k) => k.pubkey.toBase58());
    expect(keys[3]).toBe(owner.toBase58());
    expect(keys[7]).toBe(ownerAta.toBase58());
    expect(keys[11]).toBe(takerOfferedAta.toBase58());
    expect(tx.instructions[0].data.readBigUInt64LE(8)).toBe(BigInt(5));
  });

  it("buildRevokeTransaction is a plain SPL revoke signed by the owner", () => {
    const tx = buildRevokeTransaction(owner, ownerAta);
    expect(tx.instructions).toHaveLength(1);
    expect(tx.instructions[0].programId.equals(TOKEN_PROGRAM_ID)).toBe(true);
    expect(tx.instructions[0].keys[0].pubkey.equals(ownerAta)).toBe(true);
    expect(tx.instructions[0].keys[1]).toMatchObject({ isSigner: true });
  });
});
