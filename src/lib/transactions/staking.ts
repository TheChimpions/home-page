import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";

type QuoteResponse = {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: "ExactIn" | "ExactOut";
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
    feeAccount: string;
  };
  priceImpactPct: string;
  routePlan: {
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      feeAmount?: string;
    };
  }[];
  contextSlot: number;
  timeTaken: number;
};

export async function swapChimpSolFromJupiter(
  connection: Connection,
  quoteResponse: QuoteResponse,
  publicKey: PublicKey,
  signAndSendTransaction: (tx: VersionedTransaction) => Promise<string>
): Promise<string> {
  const response = await fetch("/api/jupiter-swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: publicKey.toBase58(),
    }),
  });

  const data = await response.json();

  if (!data?.swapTransaction) {
    throw new Error("No transaction returned from Jupiter");
  }

  const transaction = VersionedTransaction.deserialize(
    Buffer.from(data.swapTransaction, "base64")
  );

  const signature = await signAndSendTransaction(transaction);
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}
