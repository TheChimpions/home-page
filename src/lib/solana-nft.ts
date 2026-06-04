import { unstable_cache } from "next/cache";
import { ChimpionMetadata } from "@/types/nft";
import {
  getMatricaProfileByWallet,
  getMatricaUsername,
  getMatricaPfp,
} from "./matrica";
import {
  detectListingByHolder,
  fetchActiveListings,
  MARKETPLACE_ADDRESSES,
} from "./marketplace-listings";
import { fetchTensorListingsBatch } from "./tensor-listings";
import { getAllScrapedTwitters } from "./twitter-overrides";
import {
  getAllListingsByMint,
  getAllMatricaByWallet,
  getAllProvenanceByMint,
  setListingsByMint,
  setMatricaByWallet,
  setProvenanceByMint,
  type MatricaEntry,
} from "./enrichment-cache";
import { fetchProvenanceBatch } from "./provenance";
import { isEscrowOrProgramAccount } from "./program-accounts";

interface HeliusAssetFile {
  mime?: string;
  cdn_uri?: string;
  uri?: string;
}

interface HeliusAssetMetadata {
  name?: string;
  animation_url?: string;
  image?: string;
  attributes?: { trait_type: string; value: string }[];
}

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: HeliusAssetMetadata;
    json_uri?: string;
    files?: HeliusAssetFile[];
    links?: { image?: string };
  };
  ownership?: { owner?: string };
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const CREATOR_ADDRESS =
  process.env.NEXT_PUBLIC_CREATOR_ADDRESS ||
  "D7hKRyCsdaaSGVGwSAgcEfkSofBb6gn68UPD3yWW59zW";

const ASSEMBLY_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const cachedAssemble = unstable_cache(
  () => assembleAllNFTs(),
  ["chimpions-assembly-v2"],
  { revalidate: ASSEMBLY_TTL_SECONDS, tags: ["chimpions-assembly"] },
);

export async function fetchAllChimpions(): Promise<ChimpionMetadata[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("[cache] build phase: returning []");
    return [];
  }
  const skeleton = await cachedAssemble();
  const nfts = skeleton.map((n) => ({ ...n }));
  await applyEnrichmentFromCache(nfts);
  return nfts;
}

async function assembleAllNFTs(): Promise<ChimpionMetadata[]> {
  const t0 = Date.now();
  try {
    console.log(`[helius] fetching getAssetsByCreator (${CREATOR_ADDRESS})`);

    if (!HELIUS_API_KEY) {
      throw new Error("HELIUS_API_KEY is not configured in .env.local");
    }

    const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "the-chimpions",
        method: "getAssetsByCreator",
        params: {
          creatorAddress: CREATOR_ADDRESS,
          onlyVerified: true,
          limit: 1000,
          page: 1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Helius API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Helius API error: ${JSON.stringify(data.error)}`);
    }

    const assets = data.result?.items || [];
    console.log(
      `[helius] returned ${assets.length} assets in ${Date.now() - t0}ms`,
    );

    if (assets.length === 0) {
      console.warn("[helius] no NFTs found — creator address may be wrong");
      return [];
    }

    const nftsPromises = (assets as HeliusAsset[]).map(async (asset, index) => {
      try {
        const metadata = asset.content?.metadata;
        const jsonUri = asset.content?.json_uri;

        let fullMetadata: HeliusAssetMetadata | undefined = metadata;
        if (
          jsonUri &&
          (!metadata?.attributes || metadata.attributes.length === 0)
        ) {
          try {
            const metaResponse = await fetch(jsonUri);
            if (metaResponse.ok) {
              fullMetadata = await metaResponse.json();
            }
          } catch (err) {
            console.warn(`Failed to fetch metadata from ${jsonUri}:`, err);
          }
        }

        const attributes =
          fullMetadata?.attributes || asset.content?.metadata?.attributes || [];

        const tribe = attributes.find(
          (attr) => attr.trait_type === "Tribe",
        )?.value;

        const type = attributes.find(
          (attr) => attr.trait_type === "Type",
        )?.value;

        const artists = attributes
          .filter((attr) => attr.trait_type?.includes("Artist"))
          .map((attr) => attr.value)
          .join(", ");

        const files = asset.content?.files || [];
        const gifFile = files.find(
          (f) => f.mime === "image/gif" || f.cdn_uri?.includes(".gif"),
        );

        const image =
          fullMetadata?.animation_url ||
          gifFile?.cdn_uri ||
          gifFile?.uri ||
          asset.content?.links?.image ||
          fullMetadata?.image ||
          files[0]?.cdn_uri ||
          files[0]?.uri ||
          "";

        return {
          tokenId: index + 1,
          mint: asset.id,
          name:
            fullMetadata?.name || metadata?.name || `Chimpion #${index + 1}`,
          image,
          animationUrl: fullMetadata?.animation_url || image,
          attributes,
          tribe: tribe || "Unknown",
          type: type || "1/1",
          artist: artists || "Unknown",
          holder: asset.ownership?.owner || "Unknown",
        };
      } catch (error) {
        console.error(`Error processing NFT ${index}:`, error);
        return null;
      }
    });

    const nfts = (await Promise.all(nftsPromises)).filter(
      (nft) => nft !== null,
    ) as ChimpionMetadata[];

    nfts.sort((a, b) => a.name.localeCompare(b.name));

    nfts.forEach((nft, index) => {
      nft.tokenId = index + 1;
    });

    console.log(
      `[helius] assembled ${nfts.length} NFT skeletons in ${Date.now() - t0}ms (no enrichment — applied per-request)`,
    );

    return nfts;
  } catch (error) {
    console.error("[cache] assembly error:", error);
    return [];
  }
}

export async function getCacheSnapshot(): Promise<{
  count: number;
  nfts: ChimpionMetadata[];
}> {
  const nfts = await fetchAllChimpions();
  return {
    count: nfts.length,
    nfts,
  };
}

async function applyEnrichmentFromCache(
  nfts: ChimpionMetadata[],
): Promise<void> {
  const [matricaByWallet, listingsByMint, scrapedByUsername, provenanceByMint] =
    await Promise.all([
      getAllMatricaByWallet(),
      getAllListingsByMint(),
      getAllScrapedTwitters(),
      getAllProvenanceByMint(),
    ]);

  let nftsWithName = 0;
  let nftsWithTwitter = 0;
  let nftsWithListing = 0;
  let nftsWithProvenance = 0;

  for (const nft of nfts) {
    if (nft.holder) {
      const entry = matricaByWallet[nft.holder];
      if (entry?.username) {
        nft.holderName = entry.username;
        nftsWithName++;
        const handle = scrapedByUsername[entry.username];
        if (handle) {
          nft.holderTwitter = handle;
          nftsWithTwitter++;
        }
      }
    }
    if (nft.mint) {
      const listing = listingsByMint[nft.mint];
      if (listing) {
        nft.listing = listing;
        nftsWithListing++;
      } else if (nft.holder) {
        const holderListing = detectListingByHolder(nft.holder, nft.mint);
        if (holderListing) {
          nft.listing = holderListing;
          nftsWithListing++;
        }
      }

      const rawSteps = provenanceByMint[nft.mint];
      // Drop escrow/PDA hops at read time too, so chains stored before this
      // filtering existed are cleaned without waiting for a provenance rebuild.
      const steps = rawSteps?.filter(
        (s) =>
          !MARKETPLACE_ADDRESSES.has(s.wallet) &&
          !isEscrowOrProgramAccount(s.wallet),
      );
      if (steps && steps.length > 0) {
        // Stored oldest-first; join Matrica identity, then collapse consecutive
        // steps owned by the same Matrica user. provenance.ts already drops
        // consecutive wallet dups, but a single user can move a chimp between
        // their own wallets — those should read as one owner, not several.
        const enriched = steps.map((step) => {
          const entry = matricaByWallet[step.wallet];
          return {
            wallet: step.wallet,
            username: entry?.username ?? null,
            pfp: entry?.pfp ?? null,
            acquiredAt: step.acquiredAt ?? null,
            userId: entry?.userId ?? null,
          };
        });

        const identityKey = (s: (typeof enriched)[number]) =>
          s.userId ?? s.username ?? s.wallet;

        const collapsed: typeof enriched = [];
        for (const step of enriched) {
          const prev = collapsed[collapsed.length - 1];
          if (prev && identityKey(prev) === identityKey(step)) {
            // Keep the earliest acquisition (prev) but adopt a resolved
            // identity/pfp if the first wallet in the run lacked one.
            if (!prev.username && step.username) {
              prev.username = step.username;
              prev.pfp = step.pfp;
            }
            continue;
          }
          collapsed.push({ ...step });
        }

        // Expose newest-first for display.
        const lastIdx = collapsed.length - 1;
        nft.provenance = collapsed
          .map((step, idx) => ({
            wallet: step.wallet,
            username: step.username,
            pfp: step.pfp,
            acquiredAt: step.acquiredAt,
            current: idx === lastIdx,
          }))
          .reverse();
        nftsWithProvenance++;
      }
    }
  }

  console.log(
    `[enrichment] applied from KV: ${nftsWithName} usernames, ${nftsWithTwitter} twitters, ${nftsWithListing} listings, ${nftsWithProvenance} provenance`,
  );
}

/** Resolve a set of wallets to Matrica identities with bounded concurrency. */
async function resolveMatricaForWallets(
  wallets: string[],
): Promise<Record<string, MatricaEntry>> {
  const entries: Record<string, MatricaEntry> = {};
  const API_CONCURRENCY = 8;
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(API_CONCURRENCY, wallets.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= wallets.length) return;
        const wallet = wallets[i];
        const profile = await getMatricaProfileByWallet(wallet);
        entries[wallet] = {
          username: getMatricaUsername(profile),
          userId: profile?.user?.id ?? null,
          pfp: getMatricaPfp(profile),
        };
      }
    }),
  );
  return entries;
}

/**
 * Fetch on-chain provenance for every chimp, store it, then resolve Matrica
 * for the union of current holders and all historical owners. Returns the
 * stored maps so callers can compute counts. Shared by the full enrichment
 * job and the provenance-only refresh.
 */
async function refreshProvenanceAndOwners(nfts: ChimpionMetadata[]): Promise<{
  provenanceByMint: Record<string, Awaited<ReturnType<typeof fetchProvenanceBatch>>[string]>;
  matricaEntries: Record<string, MatricaEntry>;
}> {
  // Reconstruct ownership history from on-chain transfers before resolving
  // Matrica, so every past owner (not just current holders) gets a username.
  const mints = nfts.map((n) => n.mint).filter((m): m is string => !!m);
  const provenanceByMint = await fetchProvenanceBatch(mints);
  await setProvenanceByMint(provenanceByMint);
  const provenanceCount = Object.values(provenanceByMint).filter(
    (steps) => steps.length > 0,
  ).length;
  console.log(
    `[enrichment] provenance: ${provenanceCount}/${mints.length} chains → KV`,
  );

  const walletSet = new Set<string>();
  for (const n of nfts) {
    if (n.holder && n.holder !== "Unknown") walletSet.add(n.holder);
  }
  for (const steps of Object.values(provenanceByMint)) {
    for (const step of steps) walletSet.add(step.wallet);
  }
  const uniqueHolders = Array.from(walletSet);

  const matricaEntries = await resolveMatricaForWallets(uniqueHolders);
  await setMatricaByWallet(matricaEntries);
  const matricaCount = Object.values(matricaEntries).filter(
    (e) => e.username !== null,
  ).length;
  console.log(
    `[enrichment] matrica: ${matricaCount}/${uniqueHolders.length} resolved → KV`,
  );

  return { provenanceByMint, matricaEntries };
}

/**
 * Provenance-focused refresh: ownership history + Matrica identities only
 * (skips marketplace listings). Used by the manual /api/provenance trigger.
 */
export async function runProvenanceEnrichment(): Promise<{
  matricaCount: number;
  provenanceCount: number;
}> {
  const t0 = Date.now();
  console.log("[enrichment] runProvenanceEnrichment: starting");

  const nfts = await cachedAssemble();
  if (nfts.length === 0) {
    console.warn("[enrichment] no NFTs in cache, abort");
    return { matricaCount: 0, provenanceCount: 0 };
  }

  const { provenanceByMint, matricaEntries } =
    await refreshProvenanceAndOwners(nfts);

  console.log(
    `[enrichment] runProvenanceEnrichment done in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );

  return {
    matricaCount: Object.values(matricaEntries).filter((e) => e.username).length,
    provenanceCount: Object.values(provenanceByMint).filter((s) => s.length > 0)
      .length,
  };
}

export async function runFullEnrichment(): Promise<{
  matricaCount: number;
  listingsCount: number;
  provenanceCount: number;
}> {
  const t0 = Date.now();
  console.log("[enrichment] runFullEnrichment: starting");

  const nfts = await cachedAssemble();
  if (nfts.length === 0) {
    console.warn("[enrichment] no NFTs in cache, abort");
    return { matricaCount: 0, listingsCount: 0, provenanceCount: 0 };
  }

  const { provenanceByMint, matricaEntries } =
    await refreshProvenanceAndOwners(nfts);
  const provenanceCount = Object.values(provenanceByMint).filter(
    (steps) => steps.length > 0,
  ).length;
  const matricaCount = Object.values(matricaEntries).filter(
    (e) => e.username !== null,
  ).length;

  const meListings = await fetchActiveListings();
  const listings: Record<string, NonNullable<ChimpionMetadata["listing"]>> = {};

  for (const [mint, listing] of meListings.entries()) {
    listings[mint] = listing;
  }

  const tensorCandidates = nfts
    .filter((n) => n.mint && !listings[n.mint])
    .map((n) => n.mint!);

  if (tensorCandidates.length > 0) {
    const tensorListings = await fetchTensorListingsBatch(tensorCandidates);
    for (const [mint, listing] of tensorListings.entries()) {
      listings[mint] = listing;
    }
  }

  await setListingsByMint(listings);
  const listingsCount = Object.keys(listings).length;
  console.log(
    `[enrichment] listings: ${listingsCount} → KV`,
  );

  console.log(
    `[enrichment] runFullEnrichment done in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );

  return { matricaCount, listingsCount, provenanceCount };
}

