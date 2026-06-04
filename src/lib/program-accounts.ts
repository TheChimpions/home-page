import { PublicKey } from "@solana/web3.js";
import { getWalletLabel } from "./known-wallets";

// A real, user-controlled wallet is a valid ed25519 keypair, so its address
// lies ON the curve. Program-derived accounts — marketplace listing escrows,
// PDAs, associated token accounts — are deliberately OFF the curve. Unlike an
// on-chain account-owner lookup, this holds even after the escrow account is
// closed and its rent reclaimed (a closed escrow returns null from the RPC and
// would otherwise be mistaken for a normal wallet).
const onCurveCache = new Map<string, boolean>();

function isOnCurve(address: string): boolean {
  const cached = onCurveCache.get(address);
  if (cached !== undefined) return cached;
  let result: boolean;
  try {
    result = PublicKey.isOnCurve(new PublicKey(address).toBytes());
  } catch {
    result = false; // unparseable address → treat as non-wallet
  }
  onCurveCache.set(address, result);
  return result;
}

/**
 * True when an address is a program-derived/escrow account rather than a real
 * user wallet (off the ed25519 curve).
 *
 * Known labeled wallets are exempt — e.g. the Chiao treasury is a Squads vault
 * (an off-curve PDA) that we still want to surface as a genuine owner.
 */
export function isEscrowOrProgramAccount(address: string): boolean {
  if (getWalletLabel(address)) return false; // known, legitimate owner
  return !isOnCurve(address);
}
