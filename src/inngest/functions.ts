import { revalidateTag } from "next/cache";
import { inngest } from "./client";
import { runFullEnrichment } from "@/lib/solana-nft";

export const refreshEnrichmentCron = inngest.createFunction(
  {
    id: "refresh-enrichment-cron",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }) => {
    console.log("[inngest] cron: running full enrichment (matrica + listings)");
    const result = await step.run("enrich", async () => runFullEnrichment());
    await step.run("invalidate-assembly", async () => {
      revalidateTag("chimpions-assembly", "default");
    });
    return { status: "refreshed", ...result };
  },
);

export const enrichOnDemand = inngest.createFunction(
  {
    id: "enrich-on-demand",
    triggers: [{ event: "chimpions/enrichment.refresh" }],
  },
  async ({ step }) => {
    console.log("[inngest] event-triggered enrichment");
    const result = await step.run("enrich", async () => runFullEnrichment());
    await step.run("invalidate-assembly", async () => {
      revalidateTag("chimpions-assembly", "default");
    });
    return { status: "refreshed", ...result };
  },
);
