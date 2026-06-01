// Friendly labels for well-known project wallets. Client-safe (no server-only
// imports) so it can be used in both server enrichment and client components.

/** The Chiao treasury multisig. */
export const CHIAO_TREASURY = "Df7VuBkasBXHyEYUsuqQnEpDvLyZmfoxDnk932CUak2c";

const WALLET_LABELS: Record<string, string> = {
  [CHIAO_TREASURY]: "Chiao",
};

/** Friendly display name for a known wallet, or null if it isn't a known one. */
export function getWalletLabel(address?: string | null): string | null {
  if (!address) return null;
  return WALLET_LABELS[address] ?? null;
}
