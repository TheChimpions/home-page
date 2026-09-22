import { resolveAssetImage } from "./asset-overrides";
import { IS_DEVNET } from "./cluster";
import { isChimpionAsset } from "./collection";
import { getArtists, getAttribute } from "./utils";

export interface HeliusAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      animation_url?: string;
      image?: string;
      attributes?: { trait_type: string; value: string }[];
    };
    files?: { mime?: string; cdn_uri?: string; uri?: string }[];
    links?: { image?: string };
  };
  grouping?: { group_key?: string; group_value?: string }[];
  ownership?: { owner?: string };
}

export interface ChimpAssetSummary {
  mint: string;
  name: string;
  image: string;
  tribe?: string;
  type?: string;
  artist?: string;
  holder?: string;
}

/** Name, art and traits for a Chimpion, with the same media preference used across the site. */
export function summarizeChimpAsset(asset: HeliusAsset): ChimpAssetSummary {
  const metadata = asset.content?.metadata;
  const attributes = metadata?.attributes ?? [];
  const files = asset.content?.files ?? [];
  const gifFile = files.find(
    (f) => f.mime === "image/gif" || f.cdn_uri?.includes(".gif"),
  );
  const image = resolveAssetImage(
    asset.id,
    metadata?.animation_url ||
      gifFile?.cdn_uri ||
      gifFile?.uri ||
      asset.content?.links?.image ||
      metadata?.image ||
      files[0]?.cdn_uri ||
      files[0]?.uri ||
      "",
  );

  return {
    mint: asset.id,
    name: metadata?.name ?? "Unknown Chimpion",
    image,
    tribe: getAttribute(attributes, "Tribe"),
    type: getAttribute(attributes, "Type") || "1/1",
    artist: getArtists(attributes).join(", ") || undefined,
    holder: asset.ownership?.owner,
  };
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

function heliusUrl(): string {
  if (!HELIUS_API_KEY) throw new Error("HELIUS_API_KEY is not configured");
  return `https://${IS_DEVNET ? "devnet" : "mainnet"}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
}

async function heliusRpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(heliusUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: method, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Helius ${method}: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`Helius ${method}: ${JSON.stringify(data.error)}`);
  return data.result as T;
}

/** Server only. */
export async function fetchHeliusAssetBatch(ids: string[]): Promise<HeliusAsset[]> {
  const out: HeliusAsset[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const assets = await heliusRpc<HeliusAsset[]>("getAssetBatch", { ids: chunk });
    out.push(...assets.filter(Boolean));
  }
  return out;
}

/** Server only. Every Chimpion currently owned by `wallet`. */
export async function fetchChimpionsByOwner(wallet: string): Promise<HeliusAsset[]> {
  const result = await heliusRpc<{ items?: HeliusAsset[] }>("getAssetsByOwner", {
    ownerAddress: wallet,
    limit: 1000,
    page: 1,
  });
  return (result.items ?? []).filter(isChimpionAsset);
}
