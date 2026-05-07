import { NextResponse } from "next/server";
import {
  TREASURY_ADDRESS,
  fetchHeliusBalances,
} from "@/lib/collection-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchHeliusBalances(TREASURY_ADDRESS);
  return NextResponse.json(
    {
      address: TREASURY_ADDRESS,
      totalUsdValue: data?.totalUsdValue ?? null,
      balanceCount: data?.balances?.length ?? 0,
      balances: (data?.balances ?? [])
        .filter((b) => (b.usdValue ?? 0) > 0)
        .map((b) => ({
          symbol: b.symbol,
          mint: b.mint,
          usdValue: b.usdValue,
        })),
    },
    { status: 200 },
  );
}
