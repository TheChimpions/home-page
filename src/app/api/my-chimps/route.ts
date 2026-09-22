import { NextRequest, NextResponse } from "next/server";
import { isChimpionAsset } from "@/lib/collection";
import { getArtists, getAttribute } from "@/lib/utils";

interface HeliusAsset {
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
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  if (!HELIUS_API_KEY) {
    return NextResponse.json({ error: "Helius not configured" }, { status: 500 });
  }

  try {
    const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-chimps",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: wallet,
          limit: 1000,
          page: 1,
        },
      }),
      next: { revalidate: 0 },
    });

    const data = await res.json();
    const assets = data.result?.items ?? [];

    const chimps = (assets as HeliusAsset[])
      .filter(isChimpionAsset)
      .map((asset) => {
        const metadata = asset.content?.metadata;
        const attributes: { trait_type: string; value: string }[] =
          metadata?.attributes ?? [];

        const files = asset.content?.files ?? [];
        const gifFile = files.find(
          (f) => f.mime === "image/gif" || f.cdn_uri?.includes(".gif"),
        );
        const image =
          metadata?.animation_url ||
          gifFile?.cdn_uri ||
          gifFile?.uri ||
          asset.content?.links?.image ||
          metadata?.image ||
          files[0]?.cdn_uri ||
          files[0]?.uri ||
          "";

        return {
          mint: asset.id,
          name: metadata?.name ?? "Unknown Chimpion",
          image,
          tribe: getAttribute(attributes, "Tribe"),
          type: getAttribute(attributes, "Type"),
          artist: getArtists(attributes).join(", ") || undefined,
          holder: wallet,
        };
      });

    return NextResponse.json(chimps);
  } catch (error) {
    console.error("Error fetching user chimps:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
