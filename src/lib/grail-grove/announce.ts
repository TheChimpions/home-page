import { resolveAssetImage } from "@/lib/asset-overrides";
import { getMatricaUsernames, getRedis } from "@/lib/enrichment-cache";
import {
  fetchHeliusAssetBatch,
  summarizeChimpAsset,
  type HeliusAsset,
} from "@/lib/helius-asset";
import { orbTxUrl, truncateAddress } from "@/lib/utils";
import type { SwapEvent } from "./swap-events";
import { renderSwapCard, type SwapCardData } from "./swap-card";

const CARD_FILENAME = "grail-grove-swap.png";
const ANNOUNCED_TTL_SECONDS = 60 * 60 * 24 * 90;

/**
 * A still JPEG of the chimp's art. Chimps are often GIFs (or carry an MP4
 * animation_url) that Satori can't draw, so the static image is run through
 * Helius's image CDN, which returns the first frame as JPEG.
 */
export function stillChimpImage(asset: HeliusAsset): string {
  const source = resolveAssetImage(
    asset.id,
    asset.content?.links?.image ||
      asset.content?.metadata?.image ||
      asset.content?.files?.[0]?.uri ||
      "",
  );
  return `https://cdn.helius-rpc.com/cdn-cgi/image/width=600,format=jpeg/${source}`;
}

/** Everything the card and Discord message need for one swap. */
export async function loadSwapCardData(swap: SwapEvent): Promise<SwapCardData> {
  const [assets, names] = await Promise.all([
    fetchHeliusAssetBatch([swap.listedMint, swap.offeredMint]),
    getMatricaUsernames([swap.lister, swap.taker]),
  ]);
  const party = (wallet: string, mint: string) => {
    const asset = assets.find((a) => a.id === mint);
    const summary = asset ? summarizeChimpAsset(asset) : null;
    return {
      name: names[wallet] ?? truncateAddress(wallet),
      chimpName: summary?.name ?? truncateAddress(mint),
      chimpImage: asset ? stillChimpImage(asset) : "",
      tribe: summary?.tribe,
    };
  };
  return {
    lister: party(swap.lister, swap.listedMint),
    taker: party(swap.taker, swap.offeredMint),
    feeLamports: swap.feeLamports,
  };
}

/** One-line summary used as the Discord embed description. */
export function describeSwap(data: SwapCardData): string {
  return `**${data.taker.name}** swapped **${data.taker.chimpName}** for **${data.lister.chimpName}**, posted by **${data.lister.name}**`;
}

async function postToDiscord(
  webhookUrl: string,
  swap: SwapEvent,
  data: SwapCardData,
  png: Buffer,
): Promise<void> {
  const form = new FormData();
  form.append(
    "payload_json",
    JSON.stringify({
      embeds: [
        {
          title: "🌳 Grail Grove Swap",
          url: orbTxUrl(swap.signature),
          description: describeSwap(data),
          color: 0xb411ee,
          image: { url: `attachment://${CARD_FILENAME}` },
          footer: { text: "chimpions.co/grail-grove" },
          ...(swap.blockTime
            ? { timestamp: new Date(swap.blockTime * 1000).toISOString() }
            : {}),
        },
      ],
      attachments: [{ id: 0, filename: CARD_FILENAME }],
    }),
  );
  form.append(
    "files[0]",
    new Blob([new Uint8Array(png)], { type: "image/png" }),
    CARD_FILENAME,
  );

  const res = await fetch(webhookUrl, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Discord webhook ${res.status}: ${await res.text()}`);
  }
}

const announcedKey = (swap: SwapEvent) =>
  `grail-grove:announced:${swap.signature}:${swap.listedMint}`;

/**
 * Post a swap to the Discord buy-alert channel, once. Returns false when it
 * was already announced. Throws on failure so the caller can retry.
 */
export async function announceSwap(swap: SwapEvent): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_GRAIL_GROVE_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("DISCORD_GRAIL_GROVE_WEBHOOK_URL is not set");
  }

  const redis = getRedis();
  if (redis && (await redis.exists(announcedKey(swap)))) return false;

  const data = await loadSwapCardData(swap);
  const png = await renderSwapCard(data);
  await postToDiscord(webhookUrl, swap, data, png);

  await redis?.set(announcedKey(swap), 1, { ex: ANNOUNCED_TTL_SECONDS });
  return true;
}
