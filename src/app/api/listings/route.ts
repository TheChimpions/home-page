import { NextResponse } from "next/server";
import { connection } from "@/lib/connection";
import { fetchAllSwapListings } from "@/lib/chimp-swap/accounts";
import {
  toChimpListings,
  withHolderNames,
} from "@/lib/chimp-swap/listing-view";
import { getMatricaUsernames } from "@/lib/enrichment-cache";
import { fetchHeliusAssetBatch } from "@/lib/helius-asset";

export const dynamic = "force-dynamic";

/** Every open Grail Grove listing, newest first, with name/art/traits. */
export async function GET() {
  try {
    const listings = await fetchAllSwapListings(connection);
    if (listings.length === 0) {
      return NextResponse.json([], { headers: cacheHeaders });
    }
    const [assets, names] = await Promise.all([
      fetchHeliusAssetBatch(listings.map((l) => l.mint)),
      getMatricaUsernames(listings.map((l) => l.owner)),
    ]);
    return NextResponse.json(
      withHolderNames(toChimpListings(listings, assets), names),
      {
        headers: cacheHeaders,
      },
    );
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
