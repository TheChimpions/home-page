/**
 * Matrica identity lookup via the public matrica.io NFT page.
 *
 * The wallet → profile endpoint on api.matrica.io is enterprise-only now, so
 * identities are read from the server-rendered `https://matrica.io/nft/<mint>`
 * page instead. That page embeds the NFT's current owner wallet and, when the
 * wallet is linked to a Matrica account, the user's id/username/pfp/twitter in
 * the Next.js `__NEXT_DATA__` payload. No browser is needed: a plain fetch and
 * a JSON parse are enough.
 *
 * Only the owner Matrica has on record for the mint is returned, so historical
 * owners only resolve when they currently hold some chimp. Entries are keyed by
 * the wallet Matrica reports (not by our on-chain holder) so a stale owner
 * check on their side still yields a correct wallet → identity mapping.
 */
import type { MatricaEntry } from "./enrichment-cache";

const MATRICA_SITE = "https://matrica.io";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

/** Shape of the `__NEXT_DATA__` payload on matrica.io/nft/<mint>. */
interface MatricaNextData {
  page?: string;
  props?: {
    pageProps?: {
      nftInfo?: {
        status?: number;
        data?: {
          id?: string;
          ownerId?: string | null;
          lastOwnerCheckDate?: string | null;
          owner?: {
            id?: string;
            user?: {
              id?: string;
              username?: string;
              registered?: boolean;
              profile?: {
                pfp?: string | null;
                twitter?: string | null;
                showTwitter?: boolean;
              } | null;
            } | null;
          } | null;
        };
      };
    };
  };
}

export interface MatricaPageOwner {
  /** Wallet Matrica currently records as the NFT's owner. */
  wallet: string;
  /** Matrica user id, null when the wallet has no registered account. */
  userId: string | null;
  username: string | null;
  pfp: string | null;
  /** Twitter handle without the leading @, when the user shows one. */
  twitter: string | null;
  /** When Matrica last verified ownership; may lag the chain by days. */
  lastOwnerCheckDate: string | null;
}

export interface MatricaNftPage {
  mint: string;
  /** Null when Matrica has not indexed an owner for this mint. */
  owner: MatricaPageOwner | null;
}

export type MatricaPageResult =
  | { status: "ok"; page: MatricaNftPage }
  | { status: "not-found" }
  | { status: "error"; httpStatus: number | null; message: string };

/**
 * Normalise Matrica's free-form twitter field to a bare handle. Accepts
 * `@name`, `name`, and twitter.com / x.com profile URLs; anything else is
 * dropped rather than stored as garbage.
 */
export function normalizeTwitterHandle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let handle = raw.trim();
  const url = handle.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/@?([A-Za-z0-9_]+)/i,
  );
  handle = url ? url[1] : handle.replace(/^@/, "");
  return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : null;
}

/**
 * Parse the HTML of matrica.io/nft/<mint>. Returns null when the HTML is not
 * an NFT page (Matrica serves its /404 page with HTTP 200 for unknown mints).
 */
export function parseMatricaNftPage(html: string): MatricaNftPage | null {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) return null;

  let data: MatricaNextData;
  try {
    data = JSON.parse(match[1]) as MatricaNextData;
  } catch {
    return null;
  }

  const nft = data.props?.pageProps?.nftInfo?.data;
  if (!nft?.id) return null;

  const owner = nft.owner;
  const wallet = owner?.id ?? nft.ownerId ?? null;
  if (!wallet) return { mint: nft.id, owner: null };

  const user = owner?.user;
  // Unregistered wallets get a placeholder user whose "username" is the
  // wallet plus a random suffix; that is not an identity.
  const registered = !!user && user.registered !== false && !!user.username;

  return {
    mint: nft.id,
    owner: {
      wallet,
      userId: registered ? (user.id ?? null) : null,
      username: registered ? (user.username ?? null) : null,
      pfp: registered ? (user.profile?.pfp || null) : null,
      twitter:
        registered && user.profile?.showTwitter !== false
          ? normalizeTwitterHandle(user.profile?.twitter)
          : null,
      lastOwnerCheckDate: nft.lastOwnerCheckDate ?? null,
    },
  };
}

export type FetchLike = (
  url: string,
  init?: { headers?: Record<string, string> },
) => Promise<{ status: number; ok: boolean; text(): Promise<string> }>;

export async function fetchMatricaNftPage(
  mint: string,
  fetchImpl: FetchLike = fetch,
): Promise<MatricaPageResult> {
  try {
    const res = await fetchImpl(
      `${MATRICA_SITE}/nft/${encodeURIComponent(mint)}`,
      { headers: { "user-agent": USER_AGENT, accept: "text/html" } },
    );
    if (res.status === 404) return { status: "not-found" };
    if (!res.ok) {
      return {
        status: "error",
        httpStatus: res.status,
        message: `HTTP ${res.status}`,
      };
    }
    const page = parseMatricaNftPage(await res.text());
    if (!page) return { status: "not-found" };
    return { status: "ok", page };
  } catch (err) {
    return {
      status: "error",
      httpStatus: null,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export function ownerToEntry(owner: MatricaPageOwner): MatricaEntry {
  return {
    username: owner.username,
    userId: owner.userId,
    pfp: owner.pfp,
    twitter: owner.twitter,
  };
}

export interface ScrapeOwnersResult {
  /** wallet → identity for every owner seen this run. */
  entries: Record<string, MatricaEntry>;
  /** Pages that loaded and carried an owner. */
  resolved: number;
  /** Pages that loaded but Matrica had no owner on record. */
  noOwner: number;
  /** Mints Matrica does not know about. */
  notFound: number;
  /** Network / HTTP failures (blocked IP, 5xx, timeouts). */
  failed: number;
  /** First failure message, for logs. */
  firstError: string | null;
}

/**
 * Resolve Matrica identities for a set of mints by scraping each NFT page
 * with bounded concurrency. Failures never produce entries, so callers can
 * safely upsert the result over existing data.
 */
export async function scrapeMatricaOwners(
  mints: string[],
  opts: { concurrency?: number; fetchImpl?: FetchLike } = {},
): Promise<ScrapeOwnersResult> {
  const concurrency = Math.max(1, opts.concurrency ?? 4);
  const result: ScrapeOwnersResult = {
    entries: {},
    resolved: 0,
    noOwner: 0,
    notFound: 0,
    failed: 0,
    firstError: null,
  };

  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, mints.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= mints.length) return;
        const res = await fetchMatricaNftPage(mints[i], opts.fetchImpl);
        if (res.status === "ok") {
          if (res.page.owner) {
            result.entries[res.page.owner.wallet] = ownerToEntry(res.page.owner);
            result.resolved++;
          } else {
            result.noOwner++;
          }
        } else if (res.status === "not-found") {
          result.notFound++;
        } else {
          result.failed++;
          if (!result.firstError) {
            result.firstError = `${mints[i]}: ${res.message}`;
          }
        }
      }
    }),
  );
  return result;
}

/**
 * Overlay freshly scraped identities on the stored table. Fresh observations
 * win per wallet; wallets not seen this run keep their previous entry, so a
 * partial or blocked run can never erase known identities.
 */
export function mergeMatricaEntries(
  existing: Record<string, MatricaEntry>,
  fresh: Record<string, MatricaEntry>,
): Record<string, MatricaEntry> {
  return { ...existing, ...fresh };
}
