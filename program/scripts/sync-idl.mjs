// Copies the built IDL + TypeScript types into the Next.js app so the web
// client and the on-chain program never drift. Run after `anchor build`.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const programRoot = join(here, "..");
const dest = join(programRoot, "..", "src", "lib", "chimp-swap", "idl");
mkdirSync(dest, { recursive: true });

for (const [from, to] of [
  ["target/idl/chimp_swap.json", "chimp_swap.json"],
  ["target/types/chimp_swap.ts", "chimp_swap.ts"],
]) {
  copyFileSync(join(programRoot, from), join(dest, to));
  console.log(`synced ${from} → src/lib/chimp-swap/idl/${to}`);
}
