import { NextRequest, NextResponse } from "next/server";

const MATRICA_API_KEY = process.env.MATRICA_API_KEY;

async function probe(path: string): Promise<{
  path: string;
  status: number;
  ok: boolean;
  body: unknown;
}> {
  const url = `https://api.matrica.io/v1/${path}?apiKey=${MATRICA_API_KEY}`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { path, status: res.status, ok: res.ok, body };
}

export async function GET(request: NextRequest) {
  if (!MATRICA_API_KEY) {
    return NextResponse.json(
      { error: "MATRICA_API_KEY not configured" },
      { status: 500 },
    );
  }

  const wallet = request.nextUrl.searchParams.get("wallet");
  const userId = request.nextUrl.searchParams.get("userId");
  const username = request.nextUrl.searchParams.get("username");
  const customPath = request.nextUrl.searchParams.get("path");

  try {
    if (customPath) {
      const result = await probe(customPath.replace(/^\/+/, ""));
      return NextResponse.json(result);
    }

    const probes: string[] = [];
    if (wallet) {
      const w = encodeURIComponent(wallet);
      probes.push(
        `wallet/${w}`,
        `wallet/${w}/socials`,
        `wallet/${w}/twitter`,
        `wallet/${w}/discord`,
        `wallet/${w}/links`,
        `wallet/${w}/connections`,
        `wallet/${w}/profile`,
      );
    }
    if (userId) {
      const u = encodeURIComponent(userId);
      probes.push(
        `user/${u}`,
        `user/${u}/twitter`,
        `user/${u}/discord`,
        `user/${u}/socials`,
        `user/${u}/profile`,
        `user/${u}/links`,
        `user/${u}/connections`,
        `user/${u}/pfp`,
      );
    }
    if (username) {
      const n = encodeURIComponent(username);
      probes.push(
        `user/${n}`,
        `user/${n}/twitter`,
        `user/${n}/discord`,
        `user/${n}/socials`,
        `user/${n}/profile`,
        `user/${n}/links`,
        `user/${n}/connections`,
      );
    }

    if (probes.length === 0) {
      return NextResponse.json(
        {
          error:
            "Provide ?wallet=<addr>, ?userId=<id>, ?username=<name>, or ?path=<custom-path>",
        },
        { status: 400 },
      );
    }

    const results = await Promise.all(probes.map(probe));
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Fetch failed",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
