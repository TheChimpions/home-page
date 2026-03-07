import { NextResponse } from "next/server";
import { ChimpListing } from "@/types/listing";

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";
const COLLECTION = "the_chimpions";

interface MEAttribute {
  trait_type: string;
  value: string;
}

interface MEListing {
  tokenMint: string;
  seller: string;
  price: number;
  extra?: { img?: string };
  rarity?: { howrare?: { rank?: number } };
  token?: {
    name?: string;
    image?: string;
    attributes?: MEAttribute[];
  };
}

function getAttr(attrs: MEAttribute[], trait: string): string | undefined {
  return attrs.find((a) => a.trait_type === trait)?.value;
}

async function fetchMEListings(): Promise<ChimpListing[]> {
  const listings: ChimpListing[] = [];
  let offset = 0;
  const limit = 20;

  while (offset <= 200) {
    const res = await fetch(
      `${ME_BASE}/collections/${COLLECTION}/listings?offset=${offset}&limit=${limit}`,
      { next: { revalidate: 60 } },
    );

    if (!res.ok) break;

    const data: MEListing[] = await res.json();
    if (!data.length) break;

    for (const item of data) {
      const attrs = item.token?.attributes ?? [];
      listings.push({
        mint: item.tokenMint,
        name: item.token?.name ?? "Unknown",
        image: item.token?.image ?? item.extra?.img ?? "",
        price: item.price,
        seller: item.seller,
        tribe: getAttr(attrs, "Tribe"),
        type: getAttr(attrs, "Type"),
        artist: getAttr(attrs, "Artists"),
        rarityRank: item.rarity?.howrare?.rank,
        source: "magiceden",
      });
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return listings;
}

export async function GET() {
  try {
    const listings = await fetchMEListings();
    return NextResponse.json(listings, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json([], { status: 500 });
  }
}
