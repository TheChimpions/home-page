import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Keypair } from "@solana/web3.js";
import { fetchProvenanceBatch, fetchProvenanceForMint } from "../provenance";

const MINT = "3Ab85csTnAmZ8k7Z36nf6DZnLVFyPSoWGCxY3xDRLy3H";
// Real on-curve wallets: off-curve addresses are dropped as escrow accounts.
const MINTER = Keypair.generate().publicKey.toBase58();
const BUYER = Keypair.generate().publicKey.toBase58();

function tx(signature: string, timestamp: number, to: string, mint = MINT) {
  return {
    signature,
    timestamp,
    tokenTransfers: [{ mint, toUserAccount: to, tokenAmount: 1 }],
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

/** Fake fetch that replies with each queued response in order. */
function queuedFetch(...responses: (() => Response | Promise<Response>)[]) {
  const fn = vi.fn(async () => {
    const next = responses.shift();
    if (!next) throw new Error("unexpected extra fetch");
    return next();
  });
  return fn as unknown as typeof fetch & typeof fn;
}

const fast = { retryDelayMs: 0 };

describe("fetchProvenanceForMint", () => {
  beforeEach(() => {
    vi.stubEnv("HELIUS_API_KEY", "test-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns the chain oldest-first on success", async () => {
    const fetchImpl = queuedFetch(() =>
      json([tx("s2", 200, BUYER), tx("s1", 100, MINTER)]),
    );
    const chain = await fetchProvenanceForMint(MINT, { ...fast, fetchImpl });
    expect(chain).toEqual([
      { wallet: MINTER, acquiredAt: 100 },
      { wallet: BUYER, acquiredAt: 200 },
    ]);
  });

  it("returns null instead of an empty chain when Helius errors", async () => {
    const fetchImpl = queuedFetch(() => json({ error: "bad" }, 400));
    expect(await fetchProvenanceForMint(MINT, { ...fast, fetchImpl })).toBeNull();
  });

  it("returns null when the network call throws", async () => {
    const fetchImpl = queuedFetch(() => {
      throw new Error("ECONNRESET");
    });
    expect(await fetchProvenanceForMint(MINT, { ...fast, fetchImpl })).toBeNull();
  });

  it("retries a rate-limited request and succeeds", async () => {
    const fetchImpl = queuedFetch(
      () => json({ error: "rate limited" }, 429),
      () => json([tx("s1", 100, MINTER)]),
    );
    const chain = await fetchProvenanceForMint(MINT, { ...fast, fetchImpl });
    expect(chain).toEqual([{ wallet: MINTER, acquiredAt: 100 }]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("gives up with null after repeated rate limits", async () => {
    const fetchImpl = queuedFetch(
      () => json({}, 429),
      () => json({}, 429),
      () => json({}, 429),
    );
    expect(await fetchProvenanceForMint(MINT, { ...fast, fetchImpl })).toBeNull();
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("returns null rather than a partial chain when a later page fails", async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) =>
      tx(`s${i}`, 1000 - i, `w${i}`),
    );
    const fetchImpl = queuedFetch(
      () => json(fullPage),
      () => json({ error: "boom" }, 400),
    );
    expect(await fetchProvenanceForMint(MINT, { ...fast, fetchImpl })).toBeNull();
  });

  it("returns null when no API key is configured", async () => {
    vi.stubEnv("HELIUS_API_KEY", "");
    const fetchImpl = queuedFetch();
    expect(await fetchProvenanceForMint(MINT, { ...fast, fetchImpl })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("fetchProvenanceBatch", () => {
  beforeEach(() => {
    vi.stubEnv("HELIUS_API_KEY", "test-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("separates fetched chains from failed mints", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) =>
      String(url).includes("/goodMint/")
        ? json([tx("s1", 100, MINTER, "goodMint")])
        : json({ error: "bad" }, 400),
    ) as unknown as typeof fetch;

    const result = await fetchProvenanceBatch(["goodMint", "badMint"], {
      ...fast,
      fetchImpl,
      concurrency: 1,
    });
    expect(result.chains).toEqual({
      goodMint: [{ wallet: MINTER, acquiredAt: 100 }],
    });
    expect(result.failed).toEqual(["badMint"]);
  });
});
