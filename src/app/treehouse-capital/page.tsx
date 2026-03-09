import type { Metadata } from "next";
import TreehouseCapital from "@/components/treehouse-capital/TreehouseCapital/TreehouseCapital";

export const metadata: Metadata = {
  title: "Treehouse Capital",
  description:
    "Treehouse Capital is the investment arm of The Chimpions — backing early-stage Solana projects with community-driven due diligence.",
  openGraph: {
    title: "Treehouse Capital | The Chimpions",
    description:
      "Treehouse Capital is the investment arm of The Chimpions — backing early-stage Solana projects with community-driven due diligence.",
  },
};

export default function TreehouseCapitalPage() {
  return (
    <div className="relative">
      <TreehouseCapital />
    </div>
  );
}
