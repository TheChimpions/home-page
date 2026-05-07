import { unstable_cache } from "next/cache";
import { getBrowser } from "./puppeteer-browser";

const REVALIDATE_SECONDS = 24 * 60 * 60;
const NAV_TIMEOUT_MS = 15000;
const CONTENT_TIMEOUT_MS = 10000;

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
        () => /\$[\d,]+(?:\.\d+)?/.test(document.body.innerText),
        { timeout: CONTENT_TIMEOUT_MS, polling: 250 },
      )
      .catch(() => null);

    const value = await page.evaluate(() => {
      const parseUsd = (s: string) =>
        parseFloat(s.replace(/[$,]/g, "")) || 0;

      const els = Array.from(document.querySelectorAll("*"));
      for (const el of els) {
        const text = el.textContent ?? "";
        if (
          text.length < 200 &&
          /total\s*value/i.test(text)
        ) {
          const match = text.match(/\$[\d,]+(?:\.\d+)?/);
          if (match) return parseUsd(match[0]);
        }
      }

      const matches = document.body.innerText.match(
        /\$[\d,]+(?:\.\d+)?/g,
      );
      if (!matches || matches.length === 0) return null;
      return Math.max(...matches.map(parseUsd));
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
