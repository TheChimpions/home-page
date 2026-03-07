import { Connection } from "@solana/web3.js";

export const connection = new Connection(process.env.NEXT_PUBLIC_HELIUS_RPC!, {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000,
});
