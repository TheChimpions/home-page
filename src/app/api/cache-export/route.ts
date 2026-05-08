import { NextRequest, NextResponse } from "next/server";
import { fetchAllChimpions, getCacheSnapshot } from "@/lib/solana-nft";

function escapeCSV(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: NextRequest) {
  await fetchAllChimpions();
  const snapshot = await getCacheSnapshot();
  const type = request.nextUrl.searchParams.get("type") || "full";
  const format = request.nextUrl.searchParams.get("format") || "csv";
  const isCsv = format === "csv";
  const ext = isCsv ? "csv" : "txt";

  let body: string;
  let filename: string;

  if (type === "twitters") {
    const handles = Array.from(
      new Set(
        snapshot.nfts
          .map((n) => n.holderTwitter)
          .filter((h): h is string => !!h),
      ),
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    body = isCsv
      ? ["twitter", ...handles].join("\n")
      : handles.join("\n");
    filename = `chimpions-twitters.${ext}`;
  } else {
    const headers = [
      "tokenId",
      "name",
      "tribe",
      "holder",
      "holderName",
      "holderTwitter",
      "marketplace",
      "price",
      "listingUrl",
      "mint",
    ];
    const rows = snapshot.nfts.map((n) => [
      String(n.tokenId),
      n.name || "",
      n.tribe || "",
      n.holder || "",
      n.holderName || "",
      n.holderTwitter || "",
      n.listing?.marketplace || "",
      n.listing ? String(n.listing.price) : "",
      n.listing?.url || "",
      n.mint || "",
    ]);
    if (isCsv) {
      body = [
        headers.join(","),
        ...rows.map((r) => r.map(escapeCSV).join(",")),
      ].join("\n");
    } else {
      body = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
    }
    filename = `chimpions-cache.${ext}`;
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": isCsv ? "text/csv; charset=utf-8" : "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
