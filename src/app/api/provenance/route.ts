import { NextRequest, NextResponse } from "next/server";
import { fetchAllChimpions, runProvenanceEnrichment } from "@/lib/solana-nft";
import { inngest } from "@/inngest/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Manual provenance endpoint — trigger a refresh and inspect the results.
 *
 *   GET /api/provenance                  → collection-wide summary
 *   GET /api/provenance?mint=<mint>      → full chain for one chimp
 *   GET /api/provenance?tokenId=<n>      → full chain for one chimp
 *   GET /api/provenance?name=<substr>    → chains for chimps matching name
 *   GET /api/provenance?run=sync         → rebuild now and wait for counts
 *   GET /api/provenance?run=background   → queue an Inngest job, return at once
 *
 * If PROVENANCE_REFRESH_KEY is set, the run=* actions require ?key=<value>.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const run = params.get("run");

  if (run) {
    const requiredKey = process.env.PROVENANCE_REFRESH_KEY;
    if (requiredKey && params.get("key") !== requiredKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (run === "background") {
      await inngest.send({ name: "chimpions/provenance.refresh" });
      return NextResponse.json({
        status: "queued",
        mode: "background",
        event: "chimpions/provenance.refresh",
        hint: "Re-fetch GET /api/provenance in a minute to see results.",
      });
    }

    if (run === "sync") {
      const t0 = Date.now();
      const result = await runProvenanceEnrichment();
      return NextResponse.json({
        status: "refreshed",
        mode: "sync",
        durationMs: Date.now() - t0,
        ...result,
      });
    }

    return NextResponse.json(
      { error: `Unknown run mode "${run}". Use "sync" or "background".` },
      { status: 400 },
    );
  }

  const nfts = await fetchAllChimpions();

  // Single-chimp inspection.
  const mint = params.get("mint");
  const tokenId = params.get("tokenId");
  const name = params.get("name");

  if (mint || tokenId || name) {
    const matches = nfts.filter((n) => {
      if (mint) return n.mint === mint;
      if (tokenId) return String(n.tokenId) === tokenId;
      return n.name.toLowerCase().includes(name!.toLowerCase());
    });

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "No chimp matched that mint/tokenId/name." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      count: matches.length,
      results: matches.map((n) => ({
        tokenId: n.tokenId,
        name: n.name,
        mint: n.mint,
        holder: n.holder,
        owners: n.provenance?.length ?? 0,
        provenance: n.provenance ?? [],
      })),
    });
  }

  // Collection-wide summary.
  const withProvenance = nfts.filter((n) => (n.provenance?.length ?? 0) > 0);
  const withMultipleOwners = nfts.filter(
    (n) => (n.provenance?.length ?? 0) > 1,
  );
  const longest = withProvenance.reduce(
    (best, n) =>
      (n.provenance?.length ?? 0) > (best?.provenance?.length ?? 0) ? n : best,
    withProvenance[0],
  );

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalChimps: nfts.length,
    withProvenance: withProvenance.length,
    withoutProvenance: nfts.length - withProvenance.length,
    withMultipleOwners: withMultipleOwners.length,
    longestChain: longest
      ? {
          tokenId: longest.tokenId,
          name: longest.name,
          owners: longest.provenance?.length ?? 0,
        }
      : null,
    sample: withProvenance.slice(0, 10).map((n) => ({
      tokenId: n.tokenId,
      name: n.name,
      owners: n.provenance?.length ?? 0,
      chain: (n.provenance ?? []).map((o) =>
        o.username ? `@${o.username}` : o.wallet,
      ),
    })),
    note:
      withProvenance.length === 0
        ? "No provenance stored yet — trigger a build with ?run=sync or ?run=background."
        : undefined,
  });
}
