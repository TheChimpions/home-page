import { NextRequest, NextResponse } from "next/server";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const CREATOR_ADDRESS =
  process.env.NEXT_PUBLIC_CREATOR_ADDRESS ||
  "D7hKRyCsdaaSGVGwSAgcEfkSofBb6gn68UPD3yWW59zW";

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

    const chimps = assets
      .filter((asset: any) =>
        asset.creators?.some(
          (c: any) => c.address === CREATOR_ADDRESS && c.verified,
        ),
      )
      .map((asset: any) => {
        const metadata = asset.content?.metadata;
        const attributes: { trait_type: string; value: string }[] =
          metadata?.attributes ?? [];
        const getAttr = (trait: string) =>
          attributes.find((a) => a.trait_type === trait)?.value;

        const files = asset.content?.files ?? [];
        const gifFile = files.find(
          (f: any) => f.mime === "image/gif" || f.cdn_uri?.includes(".gif"),
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
          tribe: getAttr("Tribe"),
          type: getAttr("Type"),
          artist: attributes
            .filter((a) => a.trait_type?.includes("Artist"))
            .map((a) => a.value)
            .join(", ") || undefined,
          holder: wallet,
        };
      });

    return NextResponse.json(chimps);
  } catch (error) {
    console.error("Error fetching user chimps:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
