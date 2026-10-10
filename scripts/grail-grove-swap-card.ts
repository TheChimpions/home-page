/**
 * Render (and optionally announce) the Grail Grove swap card for a transaction.
 *
 *   pnpm swap-card <signature>                  # writes grail-grove-swap.png
 *   pnpm swap-card <signature> --out card.png
 *   pnpm swap-card <signature> --announce       # also posts to Discord
 *
 * Reads .env.local; variables already set in the shell win, so point it at
 * mainnet with NEXT_PUBLIC_HELIUS_RPC / NEXT_PUBLIC_CHIMP_SWAP_PROGRAM_ID /
 * NEXT_PUBLIC_SOLANA_CLUSTER when .env.local is set up for devnet.
 */
import { writeFile } from "node:fs/promises";

function loadEnv() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Fine when the variables are already in the environment.
  }
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  loadEnv();
  const signature = process.argv[2];
  if (!signature || signature.startsWith("--")) {
    throw new Error("Usage: pnpm swap-card <signature> [--out file] [--announce]");
  }

  // Imported after loadEnv so module-level env reads see .env.local.
  const { Connection } = await import("@solana/web3.js");
  const { fetchSwapEvents } = await import("../src/lib/grail-grove/swap-events");
  const { announceSwap, describeSwap, loadSwapCardData } = await import(
    "../src/lib/grail-grove/announce"
  );
  const { renderSwapCard } = await import("../src/lib/grail-grove/swap-card");

  const connection = new Connection(process.env.NEXT_PUBLIC_HELIUS_RPC!, "confirmed");
  const swaps = await fetchSwapEvents(connection, signature);
  if (swaps.length === 0) {
    console.log("No Grail Grove swap in that transaction.");
    return;
  }

  const out = arg("--out") ?? "grail-grove-swap.png";
  for (const [i, swap] of swaps.entries()) {
    const data = await loadSwapCardData(swap);
    const file = swaps.length > 1 ? out.replace(/\.png$/, `-${i + 1}.png`) : out;
    await writeFile(file, await renderSwapCard(data));
    console.log(`${describeSwap(data)}\n→ ${file}`);

    if (process.argv.includes("--announce")) {
      const posted = await announceSwap(swap);
      console.log(posted ? "Posted to Discord." : "Already announced; skipped.");
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
