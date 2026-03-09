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

    const localImages: Record<string, string> = {
      tws1: "/editions/tws1.webp",
      tws2: "/editions/tws2.webp",
      tws3: "/editions/tws3.webp",
      tws5: "/editions/tws5.webp",
      tws6: "/editions/tws6.webp",
      tws7: "/editions/tws7.gif",
      tws8: "/editions/tws8.webp",
      tws9: "/editions/tws9.webp",
      tws10: "/editions/tws10.webp",
    };

    const collections = data.families?.[0]?.collections ?? [];
    const editions: Edition[] = collections
      .filter((c) => c.symbol !== "the_chimpions")
      .map((c) => ({
        symbol: c.symbol,
        name: c.name,
        image: localImages[c.symbol] ?? c.image,
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
