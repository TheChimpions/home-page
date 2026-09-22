import { NextResponse } from "next/server";
import { connection } from "@/lib/connection";
import { fetchAllSwapListings } from "@/lib/chimp-swap/accounts";
import { toChimpListings } from "@/lib/chimp-swap/listing-view";
import { fetchHeliusAssetBatch } from "@/lib/helius-asset";

export const dynamic = "force-dynamic";

/** Every open Chimp Swap listing, newest first, with name/art/traits. */
export async function GET() {
  try {
    const listings = await fetchAllSwapListings(connection);
    if (listings.length === 0) {
      return NextResponse.json([], { headers: cacheHeaders });
    }
    const assets = await fetchHeliusAssetBatch(listings.map((l) => l.mint));
    return NextResponse.json(toChimpListings(listings, assets), {
      headers: cacheHeaders,
    });
  } catch (error) {
    console.error("Error fetching swap listings:", error);
    return NextResponse.json(
      { error: "Failed to load listings" },
      { status: 500 },
    );
  }
}

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
};
