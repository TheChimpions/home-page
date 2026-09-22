import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NFTFilters } from "@/types/nft";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFilterHash(filters: NFTFilters): string {
  const parts = [];
  if (filters.tribe) parts.push(`tribe:${filters.tribe}`);
  if (filters.heldSinceMint) parts.push("heldSinceMint:1");
  if (filters.search) parts.push(`search:${filters.search}`);
  return parts.join("|") || "all";
}

export function truncateAddress(address?: string | null): string {
  if (!address || address === "Unknown") return "Unknown";
  if (address.length <= 11) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Orb is our explorer of record for accounts and transactions.
const ORB_BASE = "https://orbmarkets.io";

/** Orb explorer link for a wallet/account pubkey. */
export function orbAddressUrl(pubkey: string): string {
  return `${ORB_BASE}/address/${pubkey}`;
}

/** Orb explorer link for a transaction signature. */
export function orbTxUrl(signature: string): string {
  return `${ORB_BASE}/tx/${signature}`;
}

interface NFTAttribute {
  trait_type?: string;
  value: string;
}

/**
 * Look up an NFT attribute by trait name, ignoring case.
 *
 * Trait casing isn't consistent across the collection — The Trickster carries
 * `tribe` where the other 221 carry `Tribe` — so an exact match silently drops
 * the value and the chimp reads as "Unknown".
 */
export function getAttribute(
  attributes: NFTAttribute[] | undefined,
  trait: string,
): string | undefined {
  const want = trait.toLowerCase();
  return attributes?.find((a) => a.trait_type?.toLowerCase() === want)?.value;
}

/** Artist handles on an NFT, in the order the traits are declared. */
export function getArtists(attributes: NFTAttribute[] | undefined): string[] {
  return (attributes ?? [])
    .filter((a) => a.trait_type?.toLowerCase().includes("artist"))
    .map((a) => a.value);
}
