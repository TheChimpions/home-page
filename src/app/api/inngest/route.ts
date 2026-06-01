import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  enrichOnDemand,
  provenanceRefresh,
  refreshEnrichmentCron,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [refreshEnrichmentCron, enrichOnDemand, provenanceRefresh],
});
