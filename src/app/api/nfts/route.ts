import { NextRequest, NextResponse } from "next/server";
import { PaginatedNFTs } from "@/types/nft";
import { fetchAllChimpions } from "@/lib/solana-nft";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const tribe = searchParams.get("tribe") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const allNFTs = await fetchAllChimpions();

    let filtered = allNFTs;

    if (tribe) {
      filtered = filtered.filter(
        (nft) => nft.tribe?.toLowerCase() === tribe.toLowerCase(),
      );
    }

    if (type) {
      filtered = filtered.filter(
        (nft) => nft.type?.toLowerCase() === type.toLowerCase(),
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchLower) ||
          nft.tokenId.toString().includes(searchLower) ||
          nft.holder?.toLowerCase().includes(searchLower) ||
          nft.tribe?.toLowerCase().includes(searchLower) ||
          nft.artist?.toLowerCase().includes(searchLower),
      );
    }

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginatedNFTs = filtered.slice(start, end);

    const response: PaginatedNFTs = {
      nfts: paginatedNFTs,
      hasMore: end < filtered.length,
      nextPage: page + 1,
      total: filtered.length,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch NFTs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
