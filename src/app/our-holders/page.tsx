import type { Metadata } from "next";
import OurHolders from "@/components/our-holders/OurHolders/OurHolders";

export const metadata: Metadata = {
  title: "Our Holders",
  description:
    "Meet the Chimpions community — dedicated holders who believe in the project and help shape its future.",
  openGraph: {
    title: "Our Holders | The Chimpions",
    description:
      "Meet the Chimpions community — dedicated holders who believe in the project and help shape its future.",
  },
};

export default function OurHoldersPage() {
  return (
    <div className="relative">
      <OurHolders />
    </div>
  );
}
