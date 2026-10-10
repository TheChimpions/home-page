import { describe, expect, it } from "vitest";
import { Connection } from "@solana/web3.js";
import { parseSwapEvents } from "../swap-events";
import { extractSignatures, isAuthorized } from "../webhook";
import { describeSwap, stillChimpImage } from "../announce";

const PROGRAM = "GrA1LdMTRsZPrLZLjbZbQ9Cx4XNbyL1bz7enprBkDv49";
const SIGNATURE =
  "uYSLm9j6u8pMD76jp9waaWrkgXTWZYreUPvkLp3czgEgYnjG4ALLcHuPUhn6iyNmmnpeYYQJY2oddXbJubfWUjC";
// Swapped event from that mainnet transaction (The Arisen ⇄ The Bionic).
const SWAPPED_DATA =
  "Program data: 2TQ0U5OHYG3sufwLbXfjMVLz4pyItC1Pzx1RgNA0jo8OKonLZdcP7wpf/Xk5XMp0yB6KC22Ud0Ufm5FwM+0TpCPavSFkwWHXfBN0WCCnhtBPFyqKmfbWStI8VBIfaVEVFbxBaMZjYwH4x5cGYT7ZuYFiQQhgMA6odmHwyOmSFy14PMU8SclefwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

// Never used for network calls; the parser only needs it to build the program.
const connection = new Connection("http://127.0.0.1:8899");

describe("parseSwapEvents", () => {
  it("decodes the Swapped event from program logs", () => {
    const logs = [
      `Program ${PROGRAM} invoke [1]`,
      "Program log: Instruction: Swap",
      SWAPPED_DATA,
      `Program ${PROGRAM} consumed 87593 of 199700 compute units`,
      `Program ${PROGRAM} success`,
    ];
    expect(parseSwapEvents(connection, SIGNATURE, logs, 1791561563)).toEqual([
      {
        signature: SIGNATURE,
        blockTime: 1791561563,
        listedMint: "Gw5hjhuLx8UfSXu6w9FxnAzX6o7aRbC5QCg5EJiJ5WNA",
        offeredMint: "hVyKuJPBQ4N26XSzWBkeENjWYrgcC1jT6b2xtW5oUra",
        lister: "9MLm6AB7wzFbtir3RbmdkF1DxdmvtfpErbsTi7WbUeiC",
        taker: "Hk8dPaNBz9hPjm84CSQDgDDnZGaMFZYHHMGQXYUbT8y4",
        feeLamports: 0,
      },
    ]);
  });

  it("returns nothing for non-swap transactions", () => {
    const logs = [
      `Program ${PROGRAM} invoke [1]`,
      "Program log: Instruction: List",
      `Program ${PROGRAM} success`,
    ];
    expect(parseSwapEvents(connection, SIGNATURE, logs, null)).toEqual([]);
  });

  it("ignores event data emitted by other programs", () => {
    const logs = [
      "Program 11111111111111111111111111111111 invoke [1]",
      SWAPPED_DATA,
      "Program 11111111111111111111111111111111 success",
    ];
    expect(parseSwapEvents(connection, SIGNATURE, logs, null)).toEqual([]);
  });
});

describe("extractSignatures", () => {
  it("reads raw and enhanced payloads and dedupes", () => {
    expect(
      extractSignatures([
        { transaction: { signatures: [SIGNATURE] } },
        { signature: SIGNATURE },
        { signature: "5AfMDSWewkjn2HtGuQs2NFYMPHqoLXc8CfoVW1gZfUwEKctKKyAQRXMwaoNHjtBpMp6yLz6p9phPXHMgzcJPEW8W" },
      ]),
    ).toEqual([
      SIGNATURE,
      "5AfMDSWewkjn2HtGuQs2NFYMPHqoLXc8CfoVW1gZfUwEKctKKyAQRXMwaoNHjtBpMp6yLz6p9phPXHMgzcJPEW8W",
    ]);
  });

  it("ignores malformed payloads", () => {
    expect(extractSignatures({ signature: SIGNATURE })).toEqual([]);
    expect(
      extractSignatures([null, 7, { signature: "not a signature" }, { transaction: {} }]),
    ).toEqual([]);
  });
});

describe("isAuthorized", () => {
  it("accepts only the exact shared secret", () => {
    expect(isAuthorized("s3cret", "s3cret")).toBe(true);
    expect(isAuthorized("s3cre", "s3cret")).toBe(false);
    expect(isAuthorized(null, "s3cret")).toBe(false);
  });

  it("rejects everything when no secret is configured", () => {
    expect(isAuthorized("", undefined)).toBe(false);
    expect(isAuthorized("anything", undefined)).toBe(false);
  });
});

describe("stillChimpImage", () => {
  it("converts the static image through the Helius CDN", () => {
    expect(
      stillChimpImage({
        id: "mint",
        content: {
          metadata: { animation_url: "https://arweave.net/video.mp4" },
          links: { image: "https://arweave.net/art.gif" },
        },
      }),
    ).toBe(
      "https://cdn.helius-rpc.com/cdn-cgi/image/width=600,format=jpeg/https://arweave.net/art.gif",
    );
  });
});

describe("describeSwap", () => {
  it("names who swapped what", () => {
    const party = (name: string, chimpName: string) => ({ name, chimpName, chimpImage: "" });
    expect(
      describeSwap({
        lister: party("tuxr", "The Arisen"),
        taker: party("7RQz...RT6U", "The Armsman"),
        feeLamports: 0,
      }),
    ).toBe("**7RQz...RT6U** swapped **The Armsman** for **The Arisen**, posted by **tuxr**");
  });
});
