import { describe, expect, it } from "vitest";
import { mergeListings, mergeProvenance } from "../enrichment-merge";
import type { NFTListing } from "@/types/nft";

const chain = (...wallets: string[]) =>
  wallets.map((wallet, i) => ({ wallet, acquiredAt: 1_700_000_000 + i }));

const listing = (
  marketplace: NFTListing["marketplace"],
  price: number,
): NFTListing => ({
  marketplace,
  url: `https://www.orbisonsol.io/marketplace/item/${price}`,
  price,
  seller: `seller-${price}`,
});

describe("mergeProvenance", () => {
  it("keeps the stored chain for mints that failed (absent from fresh)", () => {
    const existing = { mintA: chain("w1", "w2"), mintB: chain("w3") };
    const merged = mergeProvenance(existing, { mintA: chain("w1", "w2", "w4") });
    expect(merged.mintA).toEqual(chain("w1", "w2", "w4"));
    expect(merged.mintB).toEqual(chain("w3"));
  });

  it("does not let an empty fresh chain erase a stored one", () => {
    const merged = mergeProvenance({ mintA: chain("w1") }, { mintA: [] });
    expect(merged.mintA).toEqual(chain("w1"));
  });

  it("replaces a stored empty chain with a fresh one", () => {
    const merged = mergeProvenance({ mintA: [] }, { mintA: chain("w1") });
    expect(merged.mintA).toEqual(chain("w1"));
  });

  it("adds mints that were never stored", () => {
    const merged = mergeProvenance({}, { mintA: chain("w1"), mintB: [] });
    expect(merged).toEqual({ mintA: chain("w1"), mintB: [] });
  });

  it("keeps everything when the whole batch failed", () => {
    const existing = { mintA: chain("w1"), mintB: chain("w2") };
    expect(mergeProvenance(existing, {})).toEqual(existing);
  });
});

describe("mergeListings", () => {
  const existing = {
    meMint: listing("magiceden", 1),
    tensorMint: listing("tensor", 2),
    flakyMint: listing("tensor", 3),
  };

  it("drops stored listings that every source says are gone", () => {
    const merged = mergeListings(existing, {
      magicEden: new Map(),
      tensor: { listings: new Map(), failed: [] },
    });
    expect(merged).toEqual({});
  });

  it("keeps stored Magic Eden listings when Magic Eden failed", () => {
    const merged = mergeListings(existing, {
      magicEden: null,
      tensor: { listings: new Map(), failed: [] },
    });
    expect(merged).toEqual({ meMint: existing.meMint });
  });

  it("keeps stored Tensor listings when Tensor was unavailable", () => {
    const merged = mergeListings(existing, { magicEden: new Map(), tensor: null });
    expect(merged).toEqual({
      tensorMint: existing.tensorMint,
      flakyMint: existing.flakyMint,
    });
  });

  it("keeps a stored Tensor listing only for mints whose lookup failed", () => {
    const merged = mergeListings(existing, {
      magicEden: new Map(),
      tensor: { listings: new Map(), failed: ["flakyMint"] },
    });
    expect(merged).toEqual({ flakyMint: existing.flakyMint });
  });

  it("prefers fresh listings over kept ones", () => {
    const freshTensor = listing("tensor", 9);
    const merged = mergeListings(existing, {
      magicEden: null,
      tensor: { listings: new Map([["meMint", freshTensor]]), failed: [] },
    });
    expect(merged.meMint).toEqual(freshTensor);
  });

  it("lets Magic Eden win when both sources list a mint", () => {
    const freshMe = listing("magiceden", 7);
    const merged = mergeListings({}, {
      magicEden: new Map([["both", freshMe]]),
      tensor: {
        listings: new Map([["both", listing("tensor", 8)]]),
        failed: [],
      },
    });
    expect(merged.both).toEqual(freshMe);
  });
});
