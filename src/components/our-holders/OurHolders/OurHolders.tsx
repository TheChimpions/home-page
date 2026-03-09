import Image from "next/image";
import OurHoldersHero from "../Hero/OurHoldersHero";
import HoldersGrid from "../Grid/HoldersGrid";
import CommunityStats from "../CommunityStats/CommunityStats";
import TopHolders from "../TopHolders/TopHolders";
import JoinCommunity from "../JoinCommunity/JoinCommunity";

export default function OurHolders() {
  return (
    <section className="relative overflow-hidden bg-gray-modern-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
      >
        <Image
          src="/assets/texture_bottom-mobile.png"
          alt=""
          width={390}
          height={740}
          priority
          className="block w-full h-auto [image-rendering:pixelated] lg:hidden"
        />
        <Image
          src="/assets/texture-the-dao.png"
          alt=""
          width={1440}
          height={946}
          priority
          className="hidden w-full h-auto [image-rendering:pixelated] lg:block"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-20 sm:h-28 lg:h-36"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13, 18, 28, 0) 0%, rgba(13, 18, 28, 0.7) 55%, rgba(13, 18, 28, 1) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-480 mx-auto px-4 3xl:px-20 pt-16 pb-24 lg:pt-24 lg:pb-28 flex flex-col gap-20">
        <div className="flex flex-col gap-6">
          <OurHoldersHero />
          <HoldersGrid />
        </div>
        <CommunityStats />
        <TopHolders />
        <JoinCommunity />
      </div>
    </section>
  );
}
