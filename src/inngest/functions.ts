import { revalidateTag } from "next/cache";
import { inngest } from "./client";
import { fetchAllChimpions } from "@/lib/solana-nft";

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
