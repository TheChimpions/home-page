import { unstable_cache } from "next/cache";
import { getBrowser } from "./puppeteer-browser";
import type { MatricaProfile } from "./matrica";

const REVALIDATE_SECONDS = 365 * 24 * 60 * 60;
const NAV_TIMEOUT_MS = 5000;
const CONTENT_TIMEOUT_MS = 4000;
const CIRCUIT_FAILURE_THRESHOLD = 3;

let consecutiveFailures = 0;
let circuitOpenedAt = 0;
const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000;

export function profileSignature(profile: MatricaProfile | null): string {
  if (!profile?.user) return "none";
  const u = profile.user;
  const payload = JSON.stringify({
    id: u.id ?? null,
    username: u.username ?? null,
    about: u.profile?.about ?? null,
    pfp: u.profile?.pfp ?? null,
  });
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = (Math.imul(31, h) + payload.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function isLikelyValidUsername(username: string): boolean {
  if (!username) return false;
  if (username.length < 2 || username.length > 25) return false;
  return /^[A-Za-z0-9_]+$/.test(username);
}

async function scrapeUser(
  username: string,
  _profileSig: string,
): Promise<string | null> {
  void _profileSig;
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  if (!isLikelyValidUsername(username)) return null;

  if (consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    if (Date.now() - circuitOpenedAt < CIRCUIT_COOLDOWN_MS) {
      return null;
    }
    consecutiveFailures = 0;
  }

  const browser = await getBrowser();
  if (!browser) return null;

  let page;
  let timedOut = false;
  try {
    page = await browser.newPage();
    await page.goto(`https://matrica.io/user/${username}`, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });

    await page
      .waitForFunction(
        () => {
          const text = document.body.innerText;
          if (text.includes("Loading...")) return false;
          const links = Array.from(document.querySelectorAll("a"));
          return links.some((l) => {
            const href = (l as HTMLAnchorElement).href || "";
            return /(?:x\.com|twitter\.com)\//.test(href);
          });
        },
        { timeout: CONTENT_TIMEOUT_MS, polling: 250 },
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

    consecutiveFailures = 0;
    return handle;
  } catch (err) {
    timedOut = true;
    consecutiveFailures++;
    if (consecutiveFailures === CIRCUIT_FAILURE_THRESHOLD) {
      circuitOpenedAt = Date.now();
      console.warn(
        `Matrica scrape circuit opened after ${CIRCUIT_FAILURE_THRESHOLD} consecutive failures; pausing scrapes for ${CIRCUIT_COOLDOWN_MS / 1000}s`,
      );
    }
    console.warn(
      `Matrica scrape ${timedOut ? "timeout" : "error"} for ${username}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

const cachedScrape = unstable_cache(
  scrapeUser,
  ["matrica-scraped-twitter-v2"],
  { revalidate: REVALIDATE_SECONDS, tags: ["matrica-profile"] },
);

export async function scrapeTwitterForProfile(
  profile: MatricaProfile | null,
): Promise<string | null> {
  if (!profile?.user?.username) return null;
  return cachedScrape(profile.user.username, profileSignature(profile));
}
