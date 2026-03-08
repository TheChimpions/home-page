import { NextResponse } from "next/server";

interface Edition {
  symbol: string;
  name: string;
  image: string;
  description: string;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://api-mainnet.magiceden.io/organizations/the_chimpions?edge_cache=true",
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return NextResponse.json([]);

    const data = (await res.json()) as {
      families?: {
        collections?: {
          symbol: string;
          name: string;
          image: string;
          description?: string;
        }[];
      }[];
    };

    const collections = data.families?.[0]?.collections ?? [];
    const editions: Edition[] = collections
      .filter((c) => c.symbol !== "the_chimpions")
      .map((c) => ({
        symbol: c.symbol,
        name: c.name,
        image: c.image,
        description: c.description ?? "",
      }));

    return NextResponse.json(editions, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}
