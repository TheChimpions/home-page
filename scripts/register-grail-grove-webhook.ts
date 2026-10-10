/**
 * Create (or update) the Helius webhook that reports Grail Grove program
 * transactions to /api/webhooks/grail-grove.
 *
 *   pnpm register-swap-webhook                 # show what would be sent
 *   pnpm register-swap-webhook --apply         # create or update it
 *   pnpm register-swap-webhook --url https://preview.example/api/webhooks/grail-grove --apply
 *
 * Needs HELIUS_API_KEY (mainnet) and HELIUS_WEBHOOK_AUTH, the shared secret
 * Helius sends back as the Authorization header. Use the same secret in the
 * site's environment.
 */
const PROGRAM_ID = "GrA1LdMTRsZPrLZLjbZbQ9Cx4XNbyL1bz7enprBkDv49";
const DEFAULT_URL = "https://www.chimpions.co/api/webhooks/grail-grove";
const HELIUS_API = "https://api.helius.xyz/v0/webhooks";

interface HeliusWebhook {
  webhookID: string;
  webhookURL: string;
  accountAddresses: string[];
}

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

async function helius<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${HELIUS_API}${path}?api-key=${process.env.HELIUS_API_KEY}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Helius ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

async function main() {
  loadEnv();
  if (!process.env.HELIUS_API_KEY) throw new Error("HELIUS_API_KEY is not set");
  const authHeader = process.env.HELIUS_WEBHOOK_AUTH;
  if (!authHeader) throw new Error("HELIUS_WEBHOOK_AUTH is not set");

  const webhookURL = arg("--url") ?? DEFAULT_URL;
  const body = {
    webhookURL,
    transactionTypes: ["ANY"],
    accountAddresses: [PROGRAM_ID],
    webhookType: "raw",
    authHeader,
  };

  const existing = (await helius<HeliusWebhook[]>("")).find(
    (w) => w.webhookURL === webhookURL,
  );
  console.log(
    existing
      ? `Webhook ${existing.webhookID} already points at ${webhookURL}; it will be updated.`
      : `No webhook for ${webhookURL}; one will be created.`,
  );
  console.log(`Watching ${PROGRAM_ID} (raw, all transaction types).`);

  if (!process.argv.includes("--apply")) {
    console.log("Dry run. Re-run with --apply to save it.");
    return;
  }

  const saved = existing
    ? await helius<HeliusWebhook>(`/${existing.webhookID}`, {
        method: "PUT",
        body: JSON.stringify(body),
      })
    : await helius<HeliusWebhook>("", { method: "POST", body: JSON.stringify(body) });
  console.log(`Saved webhook ${saved.webhookID}.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
