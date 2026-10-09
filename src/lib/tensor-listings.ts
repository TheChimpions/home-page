import { TCompSDK, findListStatePda } from "@tensor-oss/tcomp-sdk";
import { AnchorProvider } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  type Transaction,
  type VersionedTransaction,
} from "@solana/web3.js";
import type { NFTListing } from "@/types/nft";
import { orbisItemUrl } from "@/lib/utils";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

let sdkPromise: Promise<TCompSDK | null> | null = null;

async function getSdk(): Promise<TCompSDK | null> {
  if (sdkPromise) return sdkPromise;
  if (!HELIUS_API_KEY) return null;

  sdkPromise = (async () => {
    try {
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
        "confirmed",
      );
      const keypair = Keypair.generate();
      const wallet = {
        publicKey: keypair.publicKey,
        signTransaction: async <T extends Transaction | VersionedTransaction>(
          tx: T,
        ) => tx,
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(
          txs: T[],
        ) => txs,
      };
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      return new TCompSDK({ provider });
    } catch (err) {
      console.warn("Failed to init Tensor SDK:", err);
      return null;
    }
  })();
  return sdkPromise;
}

/**
 * The Tensor (TComp) listing for a mint, null when it isn't listed, or "error"
 * when the lookup failed and the listing state is unknown.
 */
export async function fetchTensorListing(
  mint: string,
): Promise<NFTListing | null | "error"> {
  const sdk = await getSdk();
  if (!sdk) return "error";

  try {
    const assetId = new PublicKey(mint);
    const [listState] = findListStatePda({ assetId });
    // fetchNullable: a missing ListState account means "not listed", while an
    // RPC failure throws and is reported as an error.
    const state = await sdk.program.account.listState.fetchNullable(listState);
    if (!state) return null;

    return {
      marketplace: "tensor",
      url: orbisItemUrl(mint),
      price: state.amount.toNumber() / 1_000_000_000,
      seller: state.owner.toBase58(),
    };
  } catch {
    return "error";
  }
}

export interface TensorBatchResult {
  listings: Map<string, NFTListing>;
  /** Mints whose lookup failed; their listing state is unknown. */
  failed: string[];
}

/**
 * Look up Tensor listings for many mints. Returns null when the SDK could not
 * be set up at all (no API key, init failure), so every mint is unknown.
 */
export async function fetchTensorListingsBatch(
  mints: string[],
): Promise<TensorBatchResult | null> {
  const result: TensorBatchResult = { listings: new Map(), failed: [] };
  if (mints.length === 0) return result;

  const sdk = await getSdk();
  if (!sdk) return null;

  const CONCURRENCY = 10;
  let cursor = 0;
  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, mints.length) },
      async () => {
        while (true) {
          const i = cursor++;
          if (i >= mints.length) return;
          const mint = mints[i];
          const listing = await fetchTensorListing(mint);
          if (listing === "error") result.failed.push(mint);
          else if (listing) result.listings.set(mint, listing);
        }
      },
    ),
  );
  return result;
}
