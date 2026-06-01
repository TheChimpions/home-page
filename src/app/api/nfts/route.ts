import { NextRequest, NextResponse } from "next/server";
import { PaginatedNFTs } from "@/types/nft";
import { fetchAllChimpions } from "@/lib/solana-nft";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const tribe = searchParams.get("tribe") || undefined;
    const heldSinceMint = searchParams.get("heldSinceMint") === "true";
    const search = searchParams.get("search") || undefined;

    const allNFTs = await fetchAllChimpions();

    let filtered = allNFTs;

    if (tribe) {
      filtered = filtered.filter(
        (nft) => nft.tribe?.toLowerCase() === tribe.toLowerCase(),
      );
    }

    if (heldSinceMint) {
      // Held since mint = the current holder is the only owner in the chain.
      filtered = filtered.filter((nft) => nft.provenance?.length === 1);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchLower) ||
          nft.tokenId.toString().includes(searchLower) ||
          nft.holder?.toLowerCase().includes(searchLower) ||
          nft.holderName?.toLowerCase().includes(searchLower) ||
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
