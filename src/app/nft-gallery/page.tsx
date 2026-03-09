import type { Metadata } from "next";
import Gallery from "@/components/nft-gallery/Gallery/Gallery";

export const metadata: Metadata = {
  title: "NFT Gallery",
  description:
    "Explore the full Chimpions NFT collection. Browse all 5,000 unique chimps, filter by traits, and find your favorite.",
  openGraph: {
    title: "NFT Gallery | The Chimpions",
    description:
      "Explore the full Chimpions NFT collection. Browse all 5,000 unique chimps, filter by traits, and find your favorite.",
  },
};

export default function NftGalleryPage() {
  return (
    <div className="relative">
      <Gallery />
    </div>
  );
}
