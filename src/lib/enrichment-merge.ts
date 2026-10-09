/**
 * Rules for overlaying a fresh enrichment run on what is already stored. Each
 * refresh can partially fail (rate limits, blocked IPs, flaky RPC); a failed
 * lookup must leave the stored value alone instead of reading as "no data".
 */
import type { ProvenanceStep } from "./enrichment-cache";
import type { NFTListing } from "@/types/nft";

/**
 * Overlay freshly fetched provenance chains on the stored ones. Mints whose
 * lookup failed are absent from `fresh` and keep their stored chain. An empty
 * fresh chain never replaces a non-empty stored one: every chimp has at least
 * its mint transfer, so empty means Helius returned nothing, not that the
 * history went away.
 */
export function mergeProvenance(
  existing: Record<string, ProvenanceStep[]>,
  fresh: Record<string, ProvenanceStep[]>,
): Record<string, ProvenanceStep[]> {
  const merged = { ...existing };
  for (const [mint, chain] of Object.entries(fresh)) {
    if (chain.length === 0 && (existing[mint]?.length ?? 0) > 0) continue;
    merged[mint] = chain;
  }
  return merged;
}

export interface ListingsRun {
  /** Magic Eden listings, or null when the fetch failed. */
  magicEden: Map<string, NFTListing> | null;
  /** Tensor results, or null when no Tensor lookup could run. */
  tensor: { listings: Map<string, NFTListing>; failed: string[] } | null;
}

/**
 * Build the listings table from a fresh run. Sources that answered replace
 * their stored listings (so delistings and sales drop off); a source that
 * failed keeps its previous listings, as does any mint whose Tensor lookup
 * failed.
 */
export function mergeListings(
  existing: Record<string, NFTListing>,
  run: ListingsRun,
): Record<string, NFTListing> {
  const merged: Record<string, NFTListing> = {};
  const failedTensor = new Set(run.tensor?.failed ?? []);

  // Fresh observations first, so they win over anything kept from before.
  for (const [mint, listing] of run.magicEden ?? []) merged[mint] = listing;
  for (const [mint, listing] of run.tensor?.listings ?? []) {
    merged[mint] ??= listing;
  }
  for (const [mint, listing] of Object.entries(existing)) {
    const unknown =
      listing.marketplace === "magiceden"
        ? run.magicEden === null
        : run.tensor === null || failedTensor.has(mint);
    if (unknown) merged[mint] ??= listing;
  }
  return merged;
}
