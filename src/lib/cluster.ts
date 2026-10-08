/**
 * Which Solana cluster the site is pointed at. Client-safe: it only reads a
 * NEXT_PUBLIC_ variable, so it can be imported from components as well as
 * server code.
 *
 * To run against a devnet test deployment, set NEXT_PUBLIC_SOLANA_CLUSTER
 * alongside a devnet NEXT_PUBLIC_HELIUS_RPC, NEXT_PUBLIC_COLLECTION_ADDRESS
 * and NEXT_PUBLIC_CHIMP_SWAP_PROGRAM_ID (see scripts/devnet-setup.ts in the grail-grove repo).
 */
export const SOLANA_CLUSTER: "mainnet-beta" | "devnet" =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "devnet" ? "devnet" : "mainnet-beta";

export const IS_DEVNET = SOLANA_CLUSTER === "devnet";
