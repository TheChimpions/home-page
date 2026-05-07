import { NextResponse } from "next/server";
import { fetchValidatorStakewiz } from "@/lib/collection-stats";

export const dynamic = "force-dynamic";

const CHIMPSOL_MINT = "sctmZbtfE4dBNBEqBriQQVZLBrTaTjiTfKNRzKUcSLa";

interface SanctumApyResponse {
  apys?: Record<string, number>;
  errs?: Record<string, unknown>;
}

interface SanctumSolValueResponse {
  solValues?: Record<string, string>;
  errs?: Record<string, unknown>;
}

async function fetchSanctumApy(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://extra-api.sanctum.so/v1/apy/latest?lst=${CHIMPSOL_MINT}`,
      { next: { revalidate: 28800 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as SanctumApyResponse;
    const raw = data.apys?.[CHIMPSOL_MINT];
    if (!raw || raw <= 0) return null;
    return raw < 1 ? raw * 100 : raw;
  } catch {
    return null;
  }
}

async function fetchSanctumSolValue(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://extra-api.sanctum.so/v1/sol-value/current?lst=${CHIMPSOL_MINT}`,
      { next: { revalidate: 28800 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as SanctumSolValueResponse;
    const raw = data.solValues?.[CHIMPSOL_MINT];
    if (!raw) return null;
    return Number(raw) / 1_000_000_000;
  } catch {
    return null;
  }
}

export async function GET() {
  const [sanctumApy, solValue, stakewiz] = await Promise.all([
    fetchSanctumApy(),
    fetchSanctumSolValue(),
    fetchValidatorStakewiz(),
  ]);

  const apy = sanctumApy ?? stakewiz?.apy_estimate ?? null;
  const source = sanctumApy !== null ? "sanctum" : stakewiz ? "stakewiz" : null;

  return NextResponse.json(
    {
      apy,
      source,
      solValue,
      mint: CHIMPSOL_MINT,
      symbol: "ChimpSol",
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=28800, stale-while-revalidate=57600",
      },
    },
  );
}
