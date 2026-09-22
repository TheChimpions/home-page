import idl from "./idl/chimp_swap.json";

const BY_NAME = new Map(idl.errors.map((e) => [e.name, e.msg] as const));
const BY_CODE = new Map(idl.errors.map((e) => [e.code, e.msg] as const));

/** Friendlier wording for the errors a holder is most likely to hit. */
const FRIENDLY: Record<string, string> = {
  Paused: "The swap board is paused right now. Try again later.",
  FeeAboveMax:
    "The swap fee changed while you were confirming. Reload and try again.",
  NotInCollection: "That NFT is not a verified Chimpion.",
  NotHoldingToken: "Your wallet no longer holds that Chimpion.",
  SelfSwap: "You cannot swap with your own listing.",
  SameMint: "Pick a different Chimpion to offer.",
  Unauthorized: "Only the wallet that posted this listing can remove it.",
};

const SPL_TOKEN_ERRORS: Record<number, string> = {
  0x11: "That Chimpion is frozen (listed or locked elsewhere).",
  0x1: "Insufficient SOL to cover the fee and rent.",
};

/**
 * Best-effort human message for a failed swap transaction. Handles wallet
 * rejections, Anchor error names/codes, and the SPL Token errors that
 * surface when an NFT is frozen or the wallet is short on SOL.
 */
export function describeSwapError(err: unknown): string {
  const raw =
    err instanceof Error
      ? `${err.message}\n${((err as { logs?: string[] }).logs ?? []).join("\n")}`
      : String(err);

  if (/user rejected|rejected the request|user denied/i.test(raw)) {
    return "Transaction cancelled in wallet.";
  }
  if (/insufficient (lamports|funds)/i.test(raw)) {
    return "Insufficient SOL to cover the fee and rent.";
  }
  if (/AccountNotInitialized|could not find account|0xbc4/i.test(raw)) {
    return "That listing is no longer available.";
  }
  if (/already in use/i.test(raw)) {
    return "That Chimpion is already listed.";
  }

  const byName = raw.match(/Error Code: (\w+)/);
  if (byName) {
    const name = byName[1];
    return FRIENDLY[name] ?? BY_NAME.get(name) ?? `Transaction failed: ${name}`;
  }

  const byCode = raw.match(/custom program error: 0x([0-9a-f]+)/i);
  if (byCode) {
    const code = parseInt(byCode[1], 16);
    const anchorName = idl.errors.find((e) => e.code === code)?.name;
    if (anchorName && FRIENDLY[anchorName]) return FRIENDLY[anchorName];
    const anchorMsg = BY_CODE.get(code);
    if (anchorMsg) return anchorMsg;
    const spl = SPL_TOKEN_ERRORS[code];
    if (spl) return spl;
  }

  if (/blockhash not found|expired/i.test(raw)) {
    return "Transaction expired before it confirmed. Please try again.";
  }
  return "Transaction failed. Please try again.";
}
