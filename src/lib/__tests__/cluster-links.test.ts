import { afterEach, describe, expect, it, vi } from "vitest";

/** Re-import utils with NEXT_PUBLIC_SOLANA_CLUSTER set to `cluster`. */
async function loadUtils(cluster?: string) {
  vi.resetModules();
  if (cluster === undefined) {
    vi.stubEnv("NEXT_PUBLIC_SOLANA_CLUSTER", "");
  } else {
    vi.stubEnv("NEXT_PUBLIC_SOLANA_CLUSTER", cluster);
  }
  return import("../utils");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

const SIG = "5gmwR1Tma7rgcvGegE1o13h2fNCStQefuKFhe6N13iqLTQvKmBwomFGyXyWvkt33fvWyH3UvhDvn2iyozyFEBp4c";
const ADDR = "nMnN7Lu8RxkoCAQ5jXGcoHkmPzEEHBGdfEpP6DNRT2Z";

describe("explorer links", () => {
  it("uses Orb on mainnet", async () => {
    const { orbTxUrl, orbAddressUrl } = await loadUtils();
    expect(orbTxUrl(SIG)).toBe(`https://orbmarkets.io/tx/${SIG}`);
    expect(orbAddressUrl(ADDR)).toBe(`https://orbmarkets.io/address/${ADDR}`);
  });

  it("adds the devnet cluster query, still on Orb", async () => {
    const { orbTxUrl, orbAddressUrl } = await loadUtils("devnet");
    expect(orbTxUrl(SIG)).toBe(`https://orbmarkets.io/tx/${SIG}?cluster=devnet`);
    expect(orbAddressUrl(ADDR)).toBe(`https://orbmarkets.io/address/${ADDR}?cluster=devnet`);
  });

  it("treats any other value as mainnet, with no cluster query", async () => {
    const { orbTxUrl } = await loadUtils("testnet");
    expect(orbTxUrl(SIG)).toBe(`https://orbmarkets.io/tx/${SIG}`);
  });
});
