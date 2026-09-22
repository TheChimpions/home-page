import { describe, expect, it } from "vitest";
import { formatSol, lamportsToSol, splitFee } from "../fee";

describe("splitFee", () => {
  it("splits evenly at 50%", () => {
    expect(splitFee(BigInt(1_000_000), 5_000)).toEqual({
      treasury: BigInt(500_000),
      lister: BigInt(500_000),
    });
  });

  it("routes rounding dust to the lister (matches on-chain split_fee)", () => {
    expect(splitFee(BigInt(1_000), 3_333)).toEqual({
      treasury: BigInt(333),
      lister: BigInt(667),
    });
    expect(splitFee(BigInt(1_001), 3_333)).toEqual({
      treasury: BigInt(333),
      lister: BigInt(668),
    });
  });

  it("handles 0% and 100%", () => {
    expect(splitFee(BigInt(777), 0)).toEqual({ treasury: BigInt(0), lister: BigInt(777) });
    expect(splitFee(BigInt(777), 10_000)).toEqual({ treasury: BigInt(777), lister: BigInt(0) });
  });

  it("handles a zero fee", () => {
    expect(splitFee(BigInt(0), 5_000)).toEqual({ treasury: BigInt(0), lister: BigInt(0) });
  });

  it("always sums back to the fee", () => {
    for (const fee of [1, 7, 999, 10_000_000, 123_456_789]) {
      for (const bps of [0, 1, 1_234, 5_000, 9_999, 10_000]) {
        const { treasury, lister } = splitFee(BigInt(fee), bps);
        expect(treasury + lister).toBe(BigInt(fee));
      }
    }
  });

  it("rejects out-of-range inputs", () => {
    expect(() => splitFee(BigInt(1), 10_001)).toThrow(RangeError);
    expect(() => splitFee(BigInt(1), -1)).toThrow(RangeError);
    expect(() => splitFee(BigInt(1), 1.5)).toThrow(RangeError);
    expect(() => splitFee(BigInt(-1), 1)).toThrow(RangeError);
  });
});

describe("formatSol", () => {
  it("formats common fees", () => {
    expect(formatSol(BigInt(10_000_000))).toBe("0.01 SOL");
    expect(formatSol(BigInt(1_000_000_000))).toBe("1.00 SOL");
    expect(formatSol(BigInt(0))).toBe("0.00 SOL");
    expect(formatSol(BigInt(1_500_000))).toBe("0.0015 SOL");
    expect(formatSol(5_000_000)).toBe("0.005 SOL");
  });

  it("converts lamports to SOL", () => {
    expect(lamportsToSol(BigInt(2_500_000_000))).toBe(2.5);
  });
});
