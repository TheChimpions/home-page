import { NextRequest, NextResponse } from "next/server";
import { fetchChimpionsByOwner, summarizeChimpAsset } from "@/lib/helius-asset";
import type { MyChimp } from "@/types/listing";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  try {
    const assets = await fetchChimpionsByOwner(wallet);
    const chimps: MyChimp[] = assets.map((asset) => ({
      ...summarizeChimpAsset(asset),
      holder: wallet,
    }));
    return NextResponse.json(chimps);
  } catch (error) {
    console.error("Error fetching user chimps:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
