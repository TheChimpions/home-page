export const BPS_DENOMINATOR = BigInt(10_000);
export const LAMPORTS_PER_SOL_BIG = BigInt(1_000_000_000);

/**
 * Mirror of the on-chain `split_fee`: treasury gets `treasuryBps` of the fee
 * (floored), the lister gets the remainder including any rounding dust.
 */
export function splitFee(
  feeLamports: bigint,
  treasuryBps: number,
): { treasury: bigint; lister: bigint } {
  if (
    !Number.isInteger(treasuryBps) ||
    treasuryBps < 0 ||
    treasuryBps > Number(BPS_DENOMINATOR)
  ) {
    throw new RangeError(`treasuryBps out of range: ${treasuryBps}`);
  }
  if (feeLamports < BigInt(0)) {
    throw new RangeError(`feeLamports must be non-negative: ${feeLamports}`);
  }
  const treasury = (feeLamports * BigInt(treasuryBps)) / BPS_DENOMINATOR;
  return { treasury, lister: feeLamports - treasury };
}

/** Lamports → SOL as a JS number (display only). */
export function lamportsToSol(lamports: bigint | number): number {
  return Number(lamports) / Number(LAMPORTS_PER_SOL_BIG);
}

/** "0.01 SOL", trimming trailing zeros but keeping at least 2 decimals. */
export function formatSol(lamports: bigint | number): string {
  const sol = lamportsToSol(lamports);
  const fixed = sol.toFixed(9).replace(/0+$/, "");
  const [whole, frac = ""] = fixed.split(".");
  const decimals = frac.length < 2 ? frac.padEnd(2, "0") : frac;
  return `${whole}.${decimals} SOL`;
}
