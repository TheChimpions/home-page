import { revalidatePath, revalidateTag } from "next/cache";
import { fetchAllChimpions, getCacheSnapshot } from "@/lib/solana-nft";
import {
  getMatricaProfileByWallet,
  getMatricaUsername,
} from "@/lib/matrica";
import { profileSignature } from "@/lib/matrica-scraper";
import {
  clearAllScrapedTwitters,
  clearAllTwitterOverrides,
  getAllScrapedTwitters,
  getTwitterOverrides,
} from "@/lib/twitter-overrides";
import { inngest } from "@/inngest/client";
import { truncateAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function refreshMatrica() {
  "use server";
  console.log(
    "[cache_view] action: refreshMatrica (revalidates matrica-profile + chimpions-assembly; twitter cache survives unless its profileSignature changed)",
  );
  revalidateTag("matrica-profile", "default");
  revalidateTag("chimpions-assembly", "default");
  revalidatePath("/cache_view");
}

async function scrapeTwittersOnly() {
  "use server";
  console.log("[cache_view] action: scrapeTwittersOnly via Inngest");

  const snapshot = await getCacheSnapshot();
  const pendingWallets = new Set<string>();
  for (const nft of snapshot.nfts) {
    if (nft.holder && nft.holderName && !nft.holderTwitter) {
      pendingWallets.add(nft.holder);
    }
  }

  if (pendingWallets.size === 0) {
    console.log("[cache_view] no pending users to scrape");
    return;
  }

  const users = new Map<string, { username: string; sig: string }>();
  for (const wallet of pendingWallets) {
    const profile = await getMatricaProfileByWallet(wallet);
    const username = getMatricaUsername(profile);
    if (!username) continue;
    if (users.has(username)) continue;
    users.set(username, { username, sig: profileSignature(profile) });
  }

  if (users.size === 0) {
    console.log("[cache_view] no Matrica usernames among pending wallets");
    return;
  }

  await inngest.send({
    name: "matrica/scrape.fanout",
    data: { users: [...users.values()] },
  });

  console.log(
    `[cache_view] queued ${users.size} matrica usernames for scrape (from ${pendingWallets.size} pending wallets)`,
  );
  revalidatePath("/cache_view");
}

async function clearTwitterCache() {
  "use server";
  console.log(
    "[cache_view] action: clearTwitterCache (wipes KV + matrica-twitter unstable_cache)",
  );
  await clearAllScrapedTwitters();
  revalidateTag("matrica-twitter", "default");
  revalidateTag("chimpions-assembly", "default");
  revalidatePath("/cache_view");
}

async function clearOverrides() {
  "use server";
  console.log("[cache_view] action: clearOverrides");
  await clearAllTwitterOverrides();
  revalidateTag("chimpions-assembly", "default");
  revalidatePath("/cache_view");
}

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function CacheViewPage({ searchParams }: PageProps) {
  await fetchAllChimpions();
  const snapshot = await getCacheSnapshot();
  const overrides = await getTwitterOverrides();
  const overrideCount = Object.keys(overrides).length;
  const scrapedTwitters = await getAllScrapedTwitters();
  const scrapedHits = Object.values(scrapedTwitters).filter(
    (v) => v !== null,
  ).length;
  const scrapedNulls = Object.values(scrapedTwitters).filter(
    (v) => v === null,
  ).length;
  const params = await searchParams;
  const filter = params.filter || "all";
  const query = params.q?.toLowerCase() || "";

  let nfts = snapshot.nfts;
  if (filter === "listed") nfts = nfts.filter((n) => !!n.listing);
  else if (filter === "matrica") nfts = nfts.filter((n) => !!n.holderName);
  else if (filter === "twitter") nfts = nfts.filter((n) => !!n.holderTwitter);
  else if (filter === "unmatched")
    nfts = nfts.filter((n) => !n.holderName && !n.listing);
  if (query) {
    nfts = nfts.filter((n) =>
      [n.name, n.tribe, n.holder, n.holderName, n.holderTwitter, n.mint]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(query)),
    );
  }

  const stats = {
    cache: snapshot.count > 0 ? "populated" : "empty",
    overrides: overrideCount,
    scrapedHits: scrapedHits,
    scrapedNulls: scrapedNulls,
    totalNFTs: snapshot.count,
    uniqueHolders: new Set(snapshot.nfts.map((n) => n.holder)).size,
    matricaResolved: snapshot.nfts.filter((n) => n.holderName).length,
    withTwitter: snapshot.nfts.filter((n) => n.holderTwitter).length,
    listedMagicEden: snapshot.nfts.filter(
      (n) => n.listing?.marketplace === "magiceden",
    ).length,
    listedTensor: snapshot.nfts.filter(
      (n) => n.listing?.marketplace === "tensor",
    ).length,
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "listed", label: "Listed" },
    { key: "matrica", label: "With Matrica" },
    { key: "twitter", label: "With Twitter" },
    { key: "unmatched", label: "Unmatched" },
  ];

  return (
    <div className="min-h-screen bg-gray-modern-950 text-white p-8 font-mono text-sm">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">NFT Cache View</h1>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/cache-export?type=full&format=csv"
            className="px-3 py-2 rounded border border-gray-modern-700 bg-gray-modern-900 hover:border-gray-modern-500 text-sm"
          >
            Full table .csv
          </a>
          <a
            href="/api/cache-export?type=full&format=txt"
            className="px-3 py-2 rounded border border-gray-modern-700 bg-gray-modern-900 hover:border-gray-modern-500 text-sm"
          >
            Full table .txt
          </a>
          <a
            href="/api/cache-export?type=twitters&format=csv"
            className="px-3 py-2 rounded border border-gray-modern-700 bg-gray-modern-900 hover:border-gray-modern-500 text-sm"
          >
            Twitter .csv
          </a>
          <a
            href="/api/cache-export?type=twitters&format=txt"
            className="px-3 py-2 rounded border border-gray-modern-700 bg-gray-modern-900 hover:border-gray-modern-500 text-sm"
          >
            Twitter .txt
          </a>
          <form action={scrapeTwittersOnly}>
            <button
              type="submit"
              className="px-4 py-2 rounded border border-electric-purple-400 bg-electric-purple-900/30 text-electric-purple-200 hover:bg-electric-purple-900/60 text-sm font-bold cursor-pointer"
              title="Scrape Twitter handles for pending users only — Matrica untouched"
            >
              Scrape twitters
            </button>
          </form>
          <form action={clearTwitterCache}>
            <button
              type="submit"
              className="px-4 py-2 rounded border border-electric-purple-700 bg-gray-modern-900 text-electric-purple-300 hover:border-electric-purple-500 text-sm font-bold cursor-pointer"
              title="Wipe Twitter cache only — Matrica untouched"
            >
              Clear twitter cache
            </button>
          </form>
          <form action={refreshMatrica}>
            <button
              type="submit"
              className="px-4 py-2 rounded border border-aqua-marine-400 bg-aqua-marine-900/30 text-aqua-marine-200 hover:bg-aqua-marine-900/60 text-sm font-bold cursor-pointer"
              title="Wipe Matrica + Twitter cache and refetch everything"
            >
              Refresh Matrica
            </button>
          </form>
        </div>
      </div>

      <section className="mb-6 border border-gray-modern-800 rounded p-4 bg-gray-modern-900/50">
        <h2 className="text-lg font-bold mb-2 text-gold-300">
          Twitter overrides ({overrideCount} active)
        </h2>
        <p className="text-gray-modern-400 text-sm mb-3">
          Upload CSV with at least <code>mint</code> and{" "}
          <code>holderTwitter</code> columns. Overrides take priority over
          Matrica/scraped values. Re-upload your{" "}
          <code>chimpions-cache.csv</code> after editing the holderTwitter
          column.
        </p>
        <form
          action="/api/upload-twitters"
          method="POST"
          encType="multipart/form-data"
          className="flex flex-wrap items-center gap-3"
        >
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="text-sm text-gray-modern-300 file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-gold-500/20 file:text-gold-200 file:hover:bg-gold-500/30 file:cursor-pointer"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded border border-gold-400 bg-gold-900/30 text-gold-200 hover:bg-gold-900/60 text-sm font-bold cursor-pointer"
          >
            Upload CSV
          </button>
        </form>
        {overrideCount > 0 && (
          <form action={clearOverrides} className="mt-3">
            <button
              type="submit"
              className="px-3 py-1 rounded border border-red-700 bg-gray-modern-900 text-red-300 hover:border-red-500 text-xs font-bold cursor-pointer"
            >
              Clear all {overrideCount} overrides
            </button>
          </form>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-2 text-aqua-marine-400">Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(stats).map(([k, v]) => (
            <div
              key={k}
              className="border border-gray-modern-800 rounded p-3 bg-gray-modern-900"
            >
              <div className="text-gray-modern-400 text-xs uppercase">{k}</div>
              <div className="text-white text-base mt-1">{String(v)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 flex flex-wrap items-center gap-3">
        {filters.map((f) => (
          <a
            key={f.key}
            href={`?filter=${f.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`px-3 py-1 rounded border text-sm ${
              filter === f.key
                ? "border-aqua-marine-400 bg-aqua-marine-900/30 text-aqua-marine-200"
                : "border-gray-modern-700 bg-gray-modern-900 text-gray-modern-300 hover:border-gray-modern-500"
            }`}
          >
            {f.label}
          </a>
        ))}
        <form className="ml-auto flex gap-2">
          <input type="hidden" name="filter" value={filter} />
          <input
            name="q"
            defaultValue={query}
            placeholder="search name / wallet / mint..."
            className="px-3 py-1 rounded border border-gray-modern-700 bg-gray-modern-900 text-sm w-64"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded border border-gray-modern-700 bg-gray-modern-900 hover:border-gray-modern-500 text-sm"
          >
            Search
          </button>
        </form>
      </section>

      <section>
        <div className="text-gray-modern-400 mb-2">
          Showing {nfts.length} of {snapshot.count}
        </div>
        <div className="overflow-x-auto border border-gray-modern-800 rounded">
          <table className="w-full text-xs">
            <thead className="bg-gray-modern-900">
              <tr className="text-left">
                <th className="p-2">#</th>
                <th className="p-2">Name</th>
                <th className="p-2">Tribe</th>
                <th className="p-2">Holder</th>
                <th className="p-2">Matrica</th>
                <th className="p-2">Twitter</th>
                <th className="p-2">Listing</th>
                <th className="p-2">Mint</th>
              </tr>
            </thead>
            <tbody>
              {nfts.map((nft) => (
                <tr
                  key={nft.tokenId}
                  className="border-t border-gray-modern-800"
                >
                  <td className="p-2">{nft.tokenId}</td>
                  <td className="p-2">{nft.name}</td>
                  <td className="p-2 text-gray-modern-400">{nft.tribe}</td>
                  <td className="p-2 text-gray-modern-400">
                    {truncateAddress(nft.holder)}
                  </td>
                  <td className="p-2">
                    {nft.holderName ? (
                      <span className="text-aqua-marine-300">
                        @{nft.holderName}
                      </span>
                    ) : (
                      <span className="text-gray-modern-600">—</span>
                    )}
                  </td>
                  <td className="p-2">
                    {nft.holderTwitter ? (
                      <a
                        href={`https://x.com/${nft.holderTwitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-electric-purple-300 hover:underline"
                      >
                        @{nft.holderTwitter}
                      </a>
                    ) : (
                      <span className="text-gray-modern-600">—</span>
                    )}
                  </td>
                  <td className="p-2">
                    {nft.listing ? (
                      <a
                        href={nft.listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-400 hover:underline"
                      >
                        {nft.listing.marketplace}
                        {nft.listing.price !== null
                          ? ` · ${nft.listing.price} SOL`
                          : ""}
                      </a>
                    ) : (
                      <span className="text-gray-modern-600">—</span>
                    )}
                  </td>
                  <td className="p-2 text-gray-modern-500">
                    {truncateAddress(nft.mint)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
