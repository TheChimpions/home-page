import type { Metadata } from "next";
import Validator from "@/components/validator/Validator/Validator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Validator",
  description:
    "Stake your SOL with The Chimpions validator and earn rewards while supporting the community. Low commission, high reliability.",
  openGraph: {
    title: "Validator | The Chimpions",
    description:
      "Stake your SOL with The Chimpions validator and earn rewards while supporting the community. Low commission, high reliability.",
  },
};

export default function ValidatorPage() {
  return (
    <div className="relative">
      <Validator />
    </div>
  );
}
