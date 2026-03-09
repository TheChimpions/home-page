import type { Metadata } from "next";
import TheTreehouse from "@/components/the-treehouse/TheTreehouse/TheTreehouse";

export const metadata: Metadata = {
  title: "The Treehouse",
  description:
    "The Treehouse is the exclusive hub for Chimpions holders — access perks, staking, Together We Stand editions, and community benefits.",
  openGraph: {
    title: "The Treehouse | The Chimpions",
    description:
      "The Treehouse is the exclusive hub for Chimpions holders — access perks, staking, Together We Stand editions, and community benefits.",
  },
};

export default function TheTreehousePage() {
  return (
    <div className="relative">
      <TheTreehouse />
    </div>
  );
}
