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

export async function fetchTensorListing(
  mint: string,
): Promise<NFTListing | null> {
  const sdk = await getSdk();
  if (!sdk) return null;

  try {
    const assetId = new PublicKey(mint);
    const [listState] = findListStatePda({ assetId });
    const state = await sdk.fetchListState(listState);
    if (!state) return null;

    return {
      marketplace: "tensor",
      url: `https://www.tensor.trade/item/${mint}`,
      price: state.amount.toNumber() / 1_000_000_000,
      seller: state.owner.toBase58(),
    };
  } catch {
    return null;
  }
}

export async function fetchTensorListingsBatch(
  mints: string[],
): Promise<Map<string, NFTListing>> {
  const result = new Map<string, NFTListing>();
  if (mints.length === 0) return result;

  const sdk = await getSdk();
  if (!sdk) return result;

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
          if (listing) result.set(mint, listing);
        }
      },
    ),
  );
  return result;
}
