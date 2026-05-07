import { NextRequest, NextResponse } from "next/server";
import { debugOrbPortfolio } from "@/lib/orb-scraper";
import { TREASURY_ADDRESS } from "@/lib/collection-stats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const address =
    request.nextUrl.searchParams.get("address") || TREASURY_ADDRESS;
  const snapshot = await debugOrbPortfolio(address);
  if (!snapshot) {
    return NextResponse.json({ error: "Scrape failed" }, { status: 500 });
  }
  return NextResponse.json(snapshot, { status: 200 });
}
