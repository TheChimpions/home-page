import { describe, expect, it } from "vitest";
import {
  fetchMatricaNftPage,
  mergeMatricaEntries,
  normalizeTwitterHandle,
  parseMatricaNftPage,
  scrapeMatricaOwners,
  type FetchLike,
} from "../matrica";

function nextDataHtml(payload: unknown): string {
  return `<!DOCTYPE html><html><head></head><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script></body></html>`;
}

function nftPage(nft: Record<string, unknown>) {
  return nextDataHtml({
    page: "/nft/[nft]",
    props: { pageProps: { nftInfo: { status: 200, data: nft } } },
  });
}

const registeredOwnerPage = nftPage({
  id: "HAG9irKTxNHJ5UsgYqgvXex58bGsMfEtHWh9bJAYxVNc",
  ownerId: "DtV8MCWtYVgT4QiTyjdnhUGENWSZXGbUdUVyC2JX1Dj3",
  lastOwnerCheckDate: "2026-09-29T13:49:50.637Z",
  owner: {
    id: "DtV8MCWtYVgT4QiTyjdnhUGENWSZXGbUdUVyC2JX1Dj3",
    user: {
      id: "e5f84d59-1ae5-4f41-9c69-35874a33d54b",
      username: "MemeGold",
      registered: true,
      profile: {
        pfp: "https://nft.matrica.io/nft/65aU.png",
        twitter: "https://x.com/memegold_sol",
        showTwitter: true,
      },
    },
  },
});

const unregisteredOwnerPage = nftPage({
  id: "3ZMeJsEu",
  ownerId: "7CUrYgHtperNe5miWhWCfxKMtQqHEwFvGaqw2bPkV7JT",
  lastOwnerCheckDate: "2025-10-02T04:34:23.475Z",
  owner: {
    id: "7CUrYgHtperNe5miWhWCfxKMtQqHEwFvGaqw2bPkV7JT",
    user: {
      id: "placeholder-user",
      username: "7CUrYgHtperNe5miWhWCfxKMtQqHEwFvGaqw2bPkV7JT-2xzkdu",
      registered: false,
      profile: { pfp: null, twitter: null },
    },
  },
});

const noOwnerPage = nftPage({
  id: "9QBK2jvw",
  ownerId: null,
  owner: null,
  lastOwnerCheckDate: "2026-08-25T23:21:00.947Z",
});

const notFoundPage = nextDataHtml({ page: "/404", props: { pageProps: {} } });

describe("parseMatricaNftPage", () => {
  it("extracts the owner wallet and registered identity", () => {
    const page = parseMatricaNftPage(registeredOwnerPage);
    expect(page).toEqual({
      mint: "HAG9irKTxNHJ5UsgYqgvXex58bGsMfEtHWh9bJAYxVNc",
      owner: {
        wallet: "DtV8MCWtYVgT4QiTyjdnhUGENWSZXGbUdUVyC2JX1Dj3",
        userId: "e5f84d59-1ae5-4f41-9c69-35874a33d54b",
        username: "MemeGold",
        pfp: "https://nft.matrica.io/nft/65aU.png",
        twitter: "memegold_sol",
        lastOwnerCheckDate: "2026-09-29T13:49:50.637Z",
      },
    });
  });

  it("treats an unregistered placeholder user as a wallet with no identity", () => {
    const page = parseMatricaNftPage(unregisteredOwnerPage);
    expect(page?.owner).toEqual({
      wallet: "7CUrYgHtperNe5miWhWCfxKMtQqHEwFvGaqw2bPkV7JT",
      userId: null,
      username: null,
      pfp: null,
      twitter: null,
      lastOwnerCheckDate: "2025-10-02T04:34:23.475Z",
    });
  });

  it("returns a null owner when Matrica has not indexed one", () => {
    expect(parseMatricaNftPage(noOwnerPage)).toEqual({
      mint: "9QBK2jvw",
      owner: null,
    });
  });

  it("hides twitter when the profile opts out of showing it", () => {
    const html = nftPage({
      id: "m",
      owner: {
        id: "w",
        user: {
          id: "u",
          username: "name",
          registered: true,
          profile: { twitter: "handle", showTwitter: false },
        },
      },
    });
    expect(parseMatricaNftPage(html)?.owner?.twitter).toBeNull();
  });

  it("returns null for the 404 page, missing payload, or broken JSON", () => {
    expect(parseMatricaNftPage(notFoundPage)).toBeNull();
    expect(parseMatricaNftPage("<html><body>nope</body></html>")).toBeNull();
    expect(
      parseMatricaNftPage(
        '<script id="__NEXT_DATA__" type="application/json">{not json</script>',
      ),
    ).toBeNull();
  });
});

describe("normalizeTwitterHandle", () => {
  it("accepts handles, @handles and profile URLs", () => {
    expect(normalizeTwitterHandle("MemeGold")).toBe("MemeGold");
    expect(normalizeTwitterHandle("@MemeGold")).toBe("MemeGold");
    expect(normalizeTwitterHandle("https://twitter.com/MemeGold")).toBe("MemeGold");
    expect(normalizeTwitterHandle("https://x.com/@MemeGold?s=20")).toBe("MemeGold");
    expect(normalizeTwitterHandle("x.com/MemeGold/status/1")).toBe("MemeGold");
  });

  it("rejects empty or malformed values", () => {
    expect(normalizeTwitterHandle("")).toBeNull();
    expect(normalizeTwitterHandle(null)).toBeNull();
    expect(normalizeTwitterHandle(undefined)).toBeNull();
    expect(normalizeTwitterHandle("not a handle!")).toBeNull();
    expect(normalizeTwitterHandle("https://instagram.com/someone")).toBeNull();
  });
});

function fakeFetch(
  routes: Record<string, { status: number; body: string } | Error>,
): FetchLike & { calls: string[] } {
  const calls: string[] = [];
  const impl: FetchLike = async (url) => {
    calls.push(url);
    const mint = decodeURIComponent(url.split("/nft/")[1]);
    const route = routes[mint];
    if (!route) throw new Error(`unexpected mint ${mint}`);
    if (route instanceof Error) throw route;
    return {
      status: route.status,
      ok: route.status >= 200 && route.status < 300,
      text: async () => route.body,
    };
  };
  return Object.assign(impl, { calls });
}

describe("fetchMatricaNftPage", () => {
  it("maps HTTP outcomes to result variants", async () => {
    const fetchImpl = fakeFetch({
      ok: { status: 200, body: registeredOwnerPage },
      soft404: { status: 200, body: notFoundPage },
      hard404: { status: 404, body: "" },
      blocked: { status: 403, body: "forbidden" },
      boom: new Error("ECONNRESET"),
    });

    expect((await fetchMatricaNftPage("ok", fetchImpl)).status).toBe("ok");
    expect((await fetchMatricaNftPage("soft404", fetchImpl)).status).toBe("not-found");
    expect((await fetchMatricaNftPage("hard404", fetchImpl)).status).toBe("not-found");
    expect(await fetchMatricaNftPage("blocked", fetchImpl)).toEqual({
      status: "error",
      httpStatus: 403,
      message: "HTTP 403",
    });
    expect(await fetchMatricaNftPage("boom", fetchImpl)).toEqual({
      status: "error",
      httpStatus: null,
      message: "ECONNRESET",
    });
    expect(fetchImpl.calls[0]).toBe("https://matrica.io/nft/ok");
  });
});

describe("scrapeMatricaOwners", () => {
  it("keys entries by the owner wallet and never emits entries for failures", async () => {
    const fetchImpl = fakeFetch({
      a: { status: 200, body: registeredOwnerPage },
      b: { status: 200, body: unregisteredOwnerPage },
      c: { status: 200, body: noOwnerPage },
      d: { status: 200, body: notFoundPage },
      e: { status: 503, body: "" },
      f: new Error("timeout"),
    });

    const result = await scrapeMatricaOwners(["a", "b", "c", "d", "e", "f"], {
      concurrency: 2,
      fetchImpl,
    });

    expect(result.resolved).toBe(2);
    expect(result.noOwner).toBe(1);
    expect(result.notFound).toBe(1);
    expect(result.failed).toBe(2);
    expect(result.firstError).toMatch(/^(e: HTTP 503|f: timeout)$/);
    expect(Object.keys(result.entries).sort()).toEqual([
      "7CUrYgHtperNe5miWhWCfxKMtQqHEwFvGaqw2bPkV7JT",
      "DtV8MCWtYVgT4QiTyjdnhUGENWSZXGbUdUVyC2JX1Dj3",
    ]);
    expect(result.entries.DtV8MCWtYVgT4QiTyjdnhUGENWSZXGbUdUVyC2JX1Dj3).toEqual({
      username: "MemeGold",
      userId: "e5f84d59-1ae5-4f41-9c69-35874a33d54b",
      pfp: "https://nft.matrica.io/nft/65aU.png",
      twitter: "memegold_sol",
    });
    expect(result.entries["7CUrYgHtperNe5miWhWCfxKMtQqHEwFvGaqw2bPkV7JT"]).toEqual({
      username: null,
      userId: null,
      pfp: null,
      twitter: null,
    });
    expect(fetchImpl.calls).toHaveLength(6);
  });

  it("handles an empty mint list", async () => {
    const result = await scrapeMatricaOwners([], { fetchImpl: fakeFetch({}) });
    expect(result).toEqual({
      entries: {},
      resolved: 0,
      noOwner: 0,
      notFound: 0,
      failed: 0,
      firstError: null,
    });
  });
});

describe("mergeMatricaEntries", () => {
  it("lets fresh observations win while preserving unseen wallets", () => {
    const existing = {
      w1: { username: "old", userId: "u1", pfp: null },
      w2: { username: "keep", userId: "u2", pfp: "p2" },
    };
    const fresh = {
      w1: { username: "new", userId: "u1", pfp: "p1", twitter: "t" },
      w3: { username: null, userId: null, pfp: null, twitter: null },
    };
    expect(mergeMatricaEntries(existing, fresh)).toEqual({
      w1: fresh.w1,
      w2: existing.w2,
      w3: fresh.w3,
    });
  });
});
