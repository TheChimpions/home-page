import { timingSafeEqual } from "node:crypto";

/**
 * Transaction signatures in a Helius webhook delivery. Handles both "raw"
 * payloads (`transaction.signatures[0]`) and "enhanced" ones (`signature`);
 * anything else is ignored. The transactions themselves are re-read from the
 * chain, so nothing else in the payload is trusted.
 */
export function extractSignatures(payload: unknown): string[] {
  if (!Array.isArray(payload)) return [];
  const out = new Set<string>();
  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    const tx = item as {
      signature?: unknown;
      transaction?: { signatures?: unknown };
    };
    const sig =
      typeof tx.signature === "string"
        ? tx.signature
        : Array.isArray(tx.transaction?.signatures)
          ? tx.transaction.signatures[0]
          : undefined;
    if (typeof sig === "string" && /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(sig)) {
      out.add(sig);
    }
  }
  return [...out];
}

/** Constant-time check of the Authorization header Helius sends back. */
export function isAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
