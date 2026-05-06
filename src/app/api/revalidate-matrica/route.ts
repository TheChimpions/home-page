import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { clearCache } from "@/lib/solana-nft";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured" },
      { status: 500 },
    );
  }

  const provided =
    request.nextUrl.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret");

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("matrica-profile", "default");
  clearCache();

  return NextResponse.json({
    revalidated: true,
    cleared: ["matrica-profile", "nft-cache"],
  });
}
