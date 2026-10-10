import { inngest } from "./client";
import { runFullEnrichment, runProvenanceEnrichment } from "@/lib/solana-nft";
import { connection } from "@/lib/connection";
import { fetchSwapEvents } from "@/lib/grail-grove/swap-events";
import { announceSwap } from "@/lib/grail-grove/announce";

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

/**
 * Announce Grail Grove swaps in the Discord buy-alert channel. Triggered per
 * program transaction by the Helius webhook; non-swap transactions (listings,
 * delists) decode to nothing and end here. Decoding throws until the
 * transaction is readable, so Inngest's retries cover RPC lag.
 */
export const announceGrailGroveSwap = inngest.createFunction(
  {
    id: "announce-grail-grove-swap",
    triggers: [{ event: "grail-grove/transaction" }],
  },
  async ({ event, step }) => {
    const signature = event.data.signature as string;
    const swaps = await step.run("decode", () =>
      fetchSwapEvents(connection, signature),
    );
    let announced = 0;
    for (const [i, swap] of swaps.entries()) {
      const posted = await step.run(`announce-${i}`, () => announceSwap(swap));
      if (posted) announced++;
    }
    return { signature, swaps: swaps.length, announced };
  },
);
