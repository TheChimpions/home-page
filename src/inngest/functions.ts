import { revalidateTag } from "next/cache";
import { inngest } from "./client";
import { scrapeTwitterByUsername } from "@/lib/matrica-scraper";
import { fetchAllChimpions } from "@/lib/solana-nft";
import { setScrapedTwitter } from "@/lib/twitter-overrides";

interface ScrapeUserPayload {
  username: string;
  sig: string;
}

export const fanoutScrapeUsers = inngest.createFunction(
  {
    id: "scrape-twitter-fanout",
    retries: 1,
    triggers: [{ event: "matrica/scrape.fanout" }],
  },
  async ({ event, step }) => {
    const users = (event.data?.users ?? []) as ScrapeUserPayload[];
    if (users.length === 0) {
      console.log("[inngest] fanout: no users");
      return { count: 0 };
    }

    console.log(
      `[inngest] fanout: emitting ${users.length} per-user scrape events`,
    );
    await step.sendEvent(
      "send-per-user-events",
      users.map((u) => ({
        name: "matrica/scrape.user",
        data: u,
      })),
    );
    return { count: users.length };
  },
);

export const scrapeUserTwitter = inngest.createFunction(
  {
    id: "scrape-twitter-user",
    retries: 4,
    concurrency: { limit: 1, key: "'global'" },
    throttle: { limit: 1, period: "8s", key: "'global'" },
    triggers: [{ event: "matrica/scrape.user" }],
  },
  async ({ event, step }) => {
    const username = event.data?.username as string | undefined;
    const sig = event.data?.sig as string | undefined;
    if (!username || !sig) {
      console.warn(
        "[inngest] scrape.user missing username or sig — skipping",
      );
      return { status: "bad-payload" };
    }

    const handle = await step.run("scrape-twitter", async () => {
      return scrapeTwitterByUsername(username, sig);
    });

    await step.run("persist-to-kv", async () => {
      await setScrapedTwitter(username, handle);
    });

    if (handle === null) {
      console.log(`[inngest] ${username} → no twitter (persisted, will not retry)`);
      return { username, handle: null, status: "no-twitter" };
    }

    console.log(`[inngest] ${username} → @${handle} (persisted to KV)`);

    await step.sendEvent("notify-resolved", {
      name: "matrica/scrape.user.resolved",
      data: { username, handle },
    });

    return { username, handle, status: "resolved" };
  },
);

export const onScrapeResolved = inngest.createFunction(
  {
    id: "post-scrape-revalidate",
    triggers: [{ event: "matrica/scrape.user.resolved" }],
    debounce: { period: "60s", key: "'scrape-batch'" },
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
