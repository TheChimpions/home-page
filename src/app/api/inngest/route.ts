import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  fanoutScrapeUsers,
  scrapeUserTwitter,
  onScrapeResolved,
  refreshAssemblyCron,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    fanoutScrapeUsers,
    scrapeUserTwitter,
    onScrapeResolved,
    refreshAssemblyCron,
  ],
});
