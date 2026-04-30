import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SanctumLST {
  symbol: string;
  mint: string;
  name: string;
  decimals: number;
  logoUri: string;
  latestApy?: number;
  avgApy?: number;
  tvl?: number;
  solValue?: number;
}

interface SanctumResponse {
  data: SanctumLST[];
}

const CHIMPSOL_MINT = "sctmZbtfE4dBNBEqBriQQVZLBrTaTjiTfKNRzKUcSLa";

export async function GET() {
  try {
    const apiKey = process.env.SANCTUM_API_KEY;

    if (!apiKey) {
      throw new Error("Sanctum API key not configured");
    }

    const response = await fetch(
      `https://sanctum-api.ironforge.network/lsts?apiKey=${apiKey}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "The Chimpions Website",
        },
        next: { revalidate: 28800 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Sanctum LSTs: ${response.status}`);
    }

    const data: SanctumResponse = await response.json();

    const chimpSol = data.data?.find((lst) => lst.mint === CHIMPSOL_MINT);

    if (!chimpSol) {
      throw new Error("chimpSol not found in Sanctum LST list");
    }

    return NextResponse.json(
      {
        apy: chimpSol.latestApy
          ? chimpSol.latestApy < 1
            ? chimpSol.latestApy * 100
            : chimpSol.latestApy
          : 6.84,
        avgApy: chimpSol.avgApy
          ? chimpSol.avgApy * (chimpSol.avgApy < 1 ? 100 : 1)
          : null,
        tvl: chimpSol.tvl,
        solValue: chimpSol.solValue,
        mint: chimpSol.mint,
        symbol: chimpSol.symbol,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=28800, stale-while-revalidate=57600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching Sanctum LST data:", error);

    return NextResponse.json(
      {
        apy: null,
        avgApy: null,
        tvl: null,
        solValue: null,
        mint: CHIMPSOL_MINT,
        symbol: "ChimpSol",
        error: "Failed to fetch real-time data, using fallback",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  }
}
