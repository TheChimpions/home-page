import { NextResponse } from "next/server";
import { ChimpListing } from "@/types/listing";

const ME_BASE = "https://api-mainnet.magiceden.dev/v2";
const COLLECTION = "the_chimpions";
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

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

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: { attributes?: { trait_type: string; value: string }[] };
  };
}

function getAttr(attrs: MEAttribute[], trait: string): string | undefined {
  return attrs.find((a) => a.trait_type === trait)?.value;
}

async function fetchHeliusBatch(
  mints: string[],
): Promise<Map<string, { type?: string; artist?: string }>> {
  const result = new Map<string, { type?: string; artist?: string }>();
  if (!HELIUS_API_KEY || mints.length === 0) return result;

  try {
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "listings-batch",
          method: "getAssetBatch",
          params: { ids: mints },
        }),
      },
    );

    if (!res.ok) return result;

    const data = await res.json();
    const assets: HeliusAsset[] = data.result ?? [];

    for (const asset of assets) {
      const attrs = asset.content?.metadata?.attributes ?? [];
      const type = attrs.find((a) => a.trait_type === "Type")?.value;
      const artist =
        attrs
          .filter((a) => a.trait_type?.includes("Artist"))
          .map((a) => a.value)
          .join(", ") || undefined;
      result.set(asset.id, { type, artist });
    }
  } catch {}

  return result;
}

async function fetchMEListings(): Promise<ChimpListing[]> {
  const limit = 20;
  const offsets = Array.from({ length: 11 }, (_, i) => i * limit);

  const pages = await Promise.all(
    offsets.map((offset) =>
      fetch(
        `${ME_BASE}/collections/${COLLECTION}/listings?offset=${offset}&limit=${limit}`,
        { next: { revalidate: 60 } },
      )
        .then((r) => (r.ok ? (r.json() as Promise<MEListing[]>) : []))
        .catch(() => [] as MEListing[]),
    ),
  );

  const listings: ChimpListing[] = [];
  for (const page of pages) {
    for (const item of page) {
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
  }

  const mints = listings.map((l) => l.mint);
  const heliusData = await fetchHeliusBatch(mints);

  for (const listing of listings) {
    listing.holder = listing.seller;
    const extra = heliusData.get(listing.mint);
    if (extra) {
      listing.type = extra.type || listing.type || "1/1";
      if (extra.artist) listing.artist = extra.artist;
    } else {
      listing.type = listing.type || "1/1";
    }
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
