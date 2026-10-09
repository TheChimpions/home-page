import { BN } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { toSwapConfig, toSwapListing } from "../accounts";

describe("account mappers", () => {
  it("converts a raw Config, keeping the fee as a bigint", () => {
    const address = Keypair.generate().publicKey;
    const authority = Keypair.generate().publicKey;
    const treasury = Keypair.generate().publicKey;
    const collection = Keypair.generate().publicKey;
    const out = toSwapConfig(address, {
      authority,
      pendingAuthority: PublicKey.default,
      treasury,
      collection,
      swapFeeLamports: new BN("18446744073709551615"), // u64::MAX survives
      treasuryBps: 5000,
      paused: false,
      activeListings: new BN(7),
    });
    expect(out).toEqual({
      address: address.toBase58(),
      authority: authority.toBase58(),
      pendingAuthority: PublicKey.default.toBase58(),
      treasury: treasury.toBase58(),
      collection: collection.toBase58(),
      swapFeeLamports: BigInt("18446744073709551615"),
      treasuryBps: 5000,
      paused: false,
      activeListings: 7,
    });
  });

  it("converts a raw Listing", () => {
    const address = Keypair.generate().publicKey;
    const owner = Keypair.generate().publicKey;
    const mint = Keypair.generate().publicKey;
    const tokenAccount = Keypair.generate().publicKey;
    expect(
      toSwapListing(address, { owner, mint, tokenAccount, createdAt: new BN(1_700_000_000) }),
    ).toEqual({
      address: address.toBase58(),
      owner: owner.toBase58(),
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.toBase58(),
      createdAt: 1_700_000_000,
    });
  });
});
