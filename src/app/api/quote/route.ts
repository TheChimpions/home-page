import { NextRequest, NextResponse } from "next/server";
import { getConversionQuote } from "@/utils/getConversionQuote";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const inputMint = req.nextUrl.searchParams.get("inputMint");
  const outputMint = req.nextUrl.searchParams.get("outputMint");
  const amount = req.nextUrl.searchParams.get("amount");

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  }

  const result = await getConversionQuote(inputMint, outputMint, amount);
  if (!result) {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }

  return NextResponse.json(result, {
    headers: { "cache-control": "no-store" },
  });
}
