import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { setTwitterOverrides } from "@/lib/twitter-overrides";

export const dynamic = "force-dynamic";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const splitRow = (line: string): string[] => {
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    out.push(current);
    return out.map((c) => c.trim());
  };

  const headers = splitRow(lines[0]).map((h) => h.toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cells[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

export async function POST(request: NextRequest) {
  let text: string;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "expected 'file' field with CSV" },
          { status: 400 },
        );
      }
      text = await file.text();
    } else {
      text = await request.text();
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "failed to read upload",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 400 },
    );
  }

  const rows = parseCSV(text);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "no rows parsed from CSV" },
      { status: 400 },
    );
  }

  const overrides: Record<string, string> = {};
  let skippedNoMint = 0;
  let skippedNoHandle = 0;
  for (const row of rows) {
    const mint = row.mint?.trim();
    const twitter =
      row.holdertwitter?.trim() ||
      row.twitter?.trim() ||
      row.handle?.trim();
    if (!mint) {
      skippedNoMint++;
      continue;
    }
    if (!twitter) {
      skippedNoHandle++;
      continue;
    }
    overrides[mint] = twitter;
  }

  console.log(
    `[upload-twitters] parsed ${rows.length} rows → ${Object.keys(overrides).length} valid (skipped ${skippedNoMint} no-mint, ${skippedNoHandle} no-handle)`,
  );

  const persisted = await setTwitterOverrides(overrides);
  revalidateTag("chimpions-assembly", "default");

  return NextResponse.json({
    parsed: rows.length,
    persisted,
    skippedNoMint,
    skippedNoHandle,
  });
}
