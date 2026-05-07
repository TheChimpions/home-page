import { unstable_cache } from "next/cache";
import { getBrowser } from "./puppeteer-browser";

const REVALIDATE_SECONDS = 24 * 60 * 60;
const NAV_TIMEOUT_MS = 20000;
const CONTENT_TIMEOUT_MS = 20000;

export interface OrbDebugSnapshot {
  url: string;
  pickedValue: number | null;
  labeledMatches: { label: string; usd: number }[];
  allDollarAmounts: number[];
  largest: number | null;
  bodySnippet: string;
  spanCandidates: number[];
}

export async function debugOrbPortfolio(
  address: string,
): Promise<OrbDebugSnapshot | null> {
  const browser = await getBrowser();
  if (!browser) return null;

  let page;
  try {
    page = await browser.newPage();
    const url = `https://orbmarkets.io/address/${address}/portfolio`;
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });

    await page
      .waitForFunction(
        () => {
          const body = document.body.innerText;
          if (/0 tokens/i.test(body)) return false;
          const matches = body.match(/\$[\d,]+(?:\.\d+)?/g) ?? [];
          return matches.length >= 3;
        },
        { timeout: CONTENT_TIMEOUT_MS, polling: 500 },
      )
      .catch(() => null);

    const result = await page.evaluate(() => {
      const parseUsd = (s: string) =>
        parseFloat(s.replace(/[$,]/g, "")) || 0;

      const spanValues: number[] = [];
      const spans = Array.from(
        document.querySelectorAll<HTMLSpanElement>(
          'span.whitespace-nowrap[data-state="closed"]',
        ),
      );
      for (const s of spans) {
        const m = (s.textContent ?? "").match(/\$[\d,]+(?:\.\d+)?/);
        if (m) spanValues.push(parseUsd(m[0]));
      }

      const labeled: { label: string; usd: number }[] = [];
      const els = Array.from(document.querySelectorAll("*"));
      for (const el of els) {
        const text = (el.textContent ?? "").trim();
        if (text.length > 200 || text.length < 5) continue;
        const labels = [
          /total\s*portfolio/i,
          /portfolio\s*value/i,
          /total\s*value/i,
          /net\s*worth/i,
          /balance/i,
        ];
        for (const re of labels) {
          if (re.test(text)) {
            const m = text.match(/\$[\d,]+(?:\.\d+)?/);
            if (m) {
              labeled.push({ label: text.slice(0, 80), usd: parseUsd(m[0]) });
              break;
            }
          }
        }
      }

      const matches =
        document.body.innerText.match(/\$[\d,]+(?:\.\d+)?/g) ?? [];
      const all = matches.map(parseUsd);
      const largest = all.length ? Math.max(...all) : null;

      return {
        spanValues,
        labeled,
        all,
        largest,
        bodySnippet: document.body.innerText.slice(0, 3000),
      };
    });

    const picked =
      result.spanValues.length > 0 ? Math.max(...result.spanValues) : null;

    return {
      url,
      pickedValue: picked,
      labeledMatches: result.labeled,
      allDollarAmounts: result.all,
      largest: result.largest,
      bodySnippet: result.bodySnippet,
      spanCandidates: result.spanValues,
    };
  } catch (err) {
    console.warn(`Orb debug error for ${address}:`, err);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

async function scrapePortfolio(address: string): Promise<number | null> {
  const browser = await getBrowser();
  if (!browser) return null;

  let page;
  try {
    page = await browser.newPage();
    await page.goto(
      `https://orbmarkets.io/address/${address}/portfolio`,
      {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT_MS,
      },
    );

    await page
      .waitForFunction(
        () => {
          const body = document.body.innerText;
          if (/0 tokens/i.test(body)) return false;
          const matches = body.match(/\$[\d,]+(?:\.\d+)?/g) ?? [];
          return matches.length >= 3;
        },
        { timeout: CONTENT_TIMEOUT_MS, polling: 500 },
      )
      .catch(() => null);

    const value = await page.evaluate(() => {
      const parseUsd = (s: string) =>
        parseFloat(s.replace(/[$,]/g, "")) || 0;

      const spans = Array.from(
        document.querySelectorAll<HTMLSpanElement>(
          'span.whitespace-nowrap[data-state="closed"]',
        ),
      );
      const spanCandidates: number[] = [];
      for (const s of spans) {
        const m = (s.textContent ?? "").match(/\$[\d,]+(?:\.\d+)?/);
        if (m) spanCandidates.push(parseUsd(m[0]));
      }
      if (spanCandidates.length > 0) return Math.max(...spanCandidates);

      const labelCandidates: number[] = [];
      const els = Array.from(document.querySelectorAll("*"));
      for (const el of els) {
        const text = (el.textContent ?? "").trim();
        if (text.length > 200) continue;
        if (!/total\s*value/i.test(text)) continue;
        const match = text.match(/\$[\d,]+(?:\.\d+)?/);
        if (match) labelCandidates.push(parseUsd(match[0]));
      }
      if (labelCandidates.length > 0) return Math.max(...labelCandidates);
      return null;
    });

    return value;
  } catch (err) {
    console.warn(`Orb portfolio scrape error for ${address}:`, err);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

export const fetchOrbPortfolioUSD = unstable_cache(
  scrapePortfolio,
  ["orb-portfolio-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: ["treasury"] },
);
