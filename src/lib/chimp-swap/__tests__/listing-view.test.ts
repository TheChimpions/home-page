import { describe, expect, it } from "vitest";
import type { HeliusAsset } from "@/lib/helius-asset";
import type { SwapListing } from "../accounts";
import {
  toChimpListings,
  toSwapListing,
  withHolderNames,
} from "../listing-view";

const asset = (id: string, name: string): HeliusAsset => ({
  id,
  content: {
    metadata: {
      name,
      attributes: [
        { trait_type: "Tribe", value: "Proletariat" },
        { trait_type: "Artist 1", value: "@a" },
        { trait_type: "Artist 2", value: "@b" },
      ],
    },
    files: [{ uri: `https://arweave.net/${id}.gif`, mime: "image/gif" }],
  },
  ownership: { owner: "someone-else" },
});

const listing = (mint: string, createdAt: number, owner = "owner"): SwapListing => ({
  address: `listing-${mint}`,
  owner,
  mint,
  tokenAccount: `ata-${mint}`,
  createdAt,
});

describe("toChimpListings", () => {
  it("joins listings with metadata and sorts newest first", () => {
    const out = toChimpListings(
      [listing("m1", 100), listing("m2", 300), listing("m3", 200)],
      [asset("m1", "One"), asset("m2", "Two"), asset("m3", "Three")],
    );
    expect(out.map((l) => l.name)).toEqual(["Two", "Three", "One"]);
    expect(out[0]).toMatchObject({
      mint: "m2",
      seller: "owner",
      holder: "owner",
      listing: "listing-m2",
      tokenAccount: "ata-m2",
      listedAt: 300,
      tribe: "Proletariat",
      type: "1/1",
      artist: "@a, @b",
      image: "https://arweave.net/m2.gif",
      source: "chimp-swap",
    });
  });

  it("uses the listing owner as holder even if Helius reports another owner", () => {
    const [out] = toChimpListings([listing("m1", 1, "lister")], [asset("m1", "One")]);
    expect(out.holder).toBe("lister");
  });

  it("drops listings whose asset lookup failed", () => {
    const out = toChimpListings(
      [listing("m1", 1), listing("missing", 2)],
      [asset("m1", "One")],
    );
    expect(out.map((l) => l.mint)).toEqual(["m1"]);
  });
});

describe("toSwapListing", () => {
  it("recovers the on-chain fields from an enriched listing", () => {
    const [enriched] = toChimpListings([listing("m1", 42, "lister")], [asset("m1", "One")]);
    expect(toSwapListing(enriched)).toEqual({
      address: "listing-m1",
      owner: "lister",
      mint: "m1",
      tokenAccount: "ata-m1",
      createdAt: 42,
    });
  });
});

describe("withHolderNames", () => {
  const chimp = (mint: string, holder?: string) => ({
    mint,
    name: mint,
    image: "",
    holder,
  });

  it("attaches the Matrica username for known holder wallets", () => {
    const out = withHolderNames(
      [chimp("m1", "walletA"), chimp("m2", "walletB")],
      { walletA: "tuxr" },
    );
    expect(out[0].holderName).toBe("tuxr");
    expect(out[1].holderName).toBeUndefined();
  });

  it("leaves chimps without a holder untouched", () => {
    const input = chimp("m1");
    expect(withHolderNames([input], { walletA: "tuxr" })[0]).toBe(input);
  });
});
