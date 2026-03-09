import type { Metadata } from "next";
import ChimpSwap from "@/components/chimp-swap/ChimpSwap";

export const metadata: Metadata = {
  title: "Chimp Swap",
  description:
    "Swap and list your Chimpions NFTs directly on-chain. Fast, simple, and community-powered trading for Chimpions holders.",
  openGraph: {
    title: "Chimp Swap | The Chimpions",
    description:
      "Swap and list your Chimpions NFTs directly on-chain. Fast, simple, and community-powered trading for Chimpions holders.",
  },
};

export default function ChimpSwapPage() {
  return (
    <div className="relative">
      <ChimpSwap />
    </div>
  );
}
