import { inngest } from "./client";
import { runFullEnrichment, runProvenanceEnrichment } from "@/lib/solana-nft";

export const refreshEnrichmentCron = inngest.createFunction(
  {
    id: "refresh-enrichment-cron",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }) => {
    console.log("[inngest] cron: running full enrichment (matrica + listings)");
    const result = await step.run("enrich", async () => runFullEnrichment());
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
    return { status: "refreshed", ...result };
  },
);

export const provenanceRefresh = inngest.createFunction(
  {
    id: "provenance-refresh",
    triggers: [{ event: "chimpions/provenance.refresh" }],
  },
  async ({ step }) => {
    console.log("[inngest] event-triggered provenance refresh");
    const result = await step.run("provenance", async () =>
      runProvenanceEnrichment(),
    );
    return { status: "refreshed", ...result };
  },
);
