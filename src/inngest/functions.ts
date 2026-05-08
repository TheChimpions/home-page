import { revalidateTag } from "next/cache";
import { inngest } from "./client";
import { getMatricaProfileByWallet } from "@/lib/matrica";
import { scrapeTwitterForProfile } from "@/lib/matrica-scraper";
import { fetchAllChimpions } from "@/lib/solana-nft";

export const fanoutScrapeUsers = inngest.createFunction(
  {
    id: "scrape-twitter-fanout",
    retries: 1,
    triggers: [{ event: "matrica/scrape.fanout" }],
  },
  async ({ event, step }) => {
    const wallets = (event.data?.wallets ?? []) as string[];
    if (wallets.length === 0) {
      console.log("[inngest] fanout: no wallets");
      return { count: 0 };
    }

    console.log(`[inngest] fanout: emitting ${wallets.length} per-user events`);
    await step.sendEvent(
      "send-per-user-events",
      wallets.map((wallet) => ({
        name: "matrica/scrape.user",
        data: { wallet },
      })),
    );
    return { count: wallets.length };
  },
);

export const scrapeUserTwitter = inngest.createFunction(
  {
    id: "scrape-twitter-user",
    retries: 4,
    concurrency: { limit: 1, key: "global" },
    throttle: { limit: 1, period: "8s", key: "global" },
    triggers: [{ event: "matrica/scrape.user" }],
  },
  async ({ event, step }) => {
    const wallet = event.data?.wallet as string | undefined;
    if (!wallet) return { status: "no-wallet" };

    const profile = await step.run("fetch-matrica-profile", async () => {
      return getMatricaProfileByWallet(wallet);
    });

    const username = profile?.user?.username ?? null;
    if (!username) {
      console.log(`[inngest] ${wallet.slice(0, 8)}… no Matrica account`);
      return { wallet, status: "no-matrica-account" };
    }

    const handle = await step.run("scrape-twitter", async () => {
      const result = await scrapeTwitterForProfile(profile);
      if (result === null) {
        throw new Error(
          `Scrape returned null for ${username} — will retry with backoff`,
        );
      }
      return result;
    });

    console.log(`[inngest] ${username} → @${handle}`);

    await step.sendEvent("notify-resolved", {
      name: "matrica/scrape.user.resolved",
      data: { wallet, username, handle },
    });

    return { wallet, username, handle, status: "resolved" };
  },
);

export const onScrapeResolved = inngest.createFunction(
  {
    id: "post-scrape-revalidate",
    triggers: [{ event: "matrica/scrape.user.resolved" }],
    debounce: { period: "60s", key: "scrape-batch" },
  },
  async ({ step }) => {
    console.log(
      "[inngest] post-scrape revalidation: clearing chimpions-assembly tag",
    );
    await step.run("revalidate", async () => {
      revalidateTag("chimpions-assembly", "default");
    });
    await step.run("warm", async () => {
      await fetchAllChimpions();
    });
    return { status: "revalidated" };
  },
);

export const refreshAssemblyCron = inngest.createFunction(
  {
    id: "refresh-assembly-cron",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }) => {
    console.log("[inngest] cron: refreshing chimpions-assembly cache");
    await step.run("revalidate", async () => {
      revalidateTag("chimpions-assembly", "default");
    });
    await step.run("warm", async () => {
      await fetchAllChimpions();
    });
    return { status: "refreshed" };
  },
);
