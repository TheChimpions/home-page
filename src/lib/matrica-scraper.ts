import { unstable_cache } from "next/cache";
import puppeteer, { Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const REVALIDATE_SECONDS = 30 * 24 * 60 * 60;
const NAV_TIMEOUT_MS = 15000;
const CONTENT_TIMEOUT_MS = 8000;

let browserPromise: Promise<Browser | null> | null = null;

async function launchBrowser(): Promise<Browser | null> {
  try {
    const isServerless =
      !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (isServerless) {
      return await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }
    const localPath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    return await puppeteer.launch({
      executablePath: localPath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (err) {
    console.warn("Matrica scraper: failed to launch browser:", err);
    return null;
  }
}

async function getBrowser(): Promise<Browser | null> {
  if (!browserPromise) browserPromise = launchBrowser();
  const browser = await browserPromise;
  if (!browser || !browser.connected) {
    browserPromise = launchBrowser();
    return browserPromise;
  }
  return browser;
}

async function scrapeUser(username: string): Promise<string | null> {
  const browser = await getBrowser();
  if (!browser) return null;

  let page;
  try {
    page = await browser.newPage();
    await page.goto(`https://matrica.io/user/${username}`, {
      waitUntil: "networkidle2",
      timeout: NAV_TIMEOUT_MS,
    });

    await page
      .waitForFunction(
        () => !document.body.innerText.includes("Loading..."),
        { timeout: CONTENT_TIMEOUT_MS },
      )
      .catch(() => null);

    const handle = await page.evaluate(() => {
      const RESERVED = new Set([
        "intent",
        "share",
        "i",
        "home",
        "explore",
        "search",
        "matrica",
        "matricalabs",
      ]);
      const links = Array.from(
        document.querySelectorAll("a"),
      ) as HTMLAnchorElement[];
      for (const link of links) {
        const href = link.href || "";
        const m = href.match(
          /https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/,
        );
        if (m && !RESERVED.has(m[1].toLowerCase())) {
          return m[1];
        }
      }
      return null;
    });

    return handle;
  } catch (err) {
    console.warn(`Matrica scrape error for ${username}:`, err);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

export const scrapeMatricaTwitter = unstable_cache(
  scrapeUser,
  ["matrica-scraped-twitter-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: ["matrica-profile"] },
);
