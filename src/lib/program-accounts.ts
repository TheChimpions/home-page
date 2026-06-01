const HELIUS_API_KEY =
  process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY;

// A normal user wallet is owned by the System Program. Marketplace escrows and
// other on-chain accounts are PDAs owned by their program (or are executable
// programs themselves), so the account owner is the discriminator.
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

// getMultipleAccounts accepts up to 100 pubkeys per call.
const BATCH_SIZE = 100;

// Resolved across the process so repeated checks for the same address (common
// when many provenance chains share escrows/wallets) don't re-hit the RPC.
const isProgramCache = new Map<string, boolean>();

interface RpcAccount {
  owner?: string;
  executable?: boolean;
}

/**
 * Given a list of wallet addresses, return the subset that are program-owned
 * accounts (marketplace escrows, PDAs, executables) rather than real,
 * user-controlled wallets. Addresses that don't exist on-chain are treated as
 * normal wallets — a fresh keypair that only ever received an NFT may have no
 * lamport-funded account, and dropping it would hide a genuine holder.
 *
 * Failures default to "not a program account" so a transient RPC error never
 * silently removes real holders/owners.
 */
export async function fetchProgramAccounts(
  addresses: string[],
): Promise<Set<string>> {
  const programAccounts = new Set<string>();
  if (!HELIUS_API_KEY || addresses.length === 0) return programAccounts;

  const unique = [...new Set(addresses)];
  const toLookup = unique.filter((a) => !isProgramCache.has(a));

  for (let i = 0; i < toLookup.length; i += BATCH_SIZE) {
    const batch = toLookup.slice(i, i + BATCH_SIZE);
    const data = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "program-account-check",
          method: "getMultipleAccounts",
          // dataSlice 0 bytes: we only need owner/executable, not the payload.
          params: [batch, { encoding: "base64", dataSlice: { offset: 0, length: 0 } }],
        }),
        next: { revalidate: 3600 },
      },
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    const values: (RpcAccount | null)[] = data?.result?.value ?? [];
    batch.forEach((addr, idx) => {
      const acc = values[idx];
      // Missing account / failed lookup → treat as a normal wallet (safe default).
      const isProgram =
        !!acc && (acc.executable === true || acc.owner !== SYSTEM_PROGRAM);
      isProgramCache.set(addr, isProgram);
    });
  }

  for (const addr of unique) {
    if (isProgramCache.get(addr)) programAccounts.add(addr);
  }
  return programAccounts;
}
