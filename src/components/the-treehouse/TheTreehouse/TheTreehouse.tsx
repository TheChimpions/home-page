import Image from "next/image";
import TreehouseHero from "../Hero/TreehouseHero";
import TreehouseAccess from "../Access/TreehouseAccess";
import TreehouseInside from "../Inside/TreehouseInside";
import TreehouseEditions from "../Editions/TreehouseEditions";
import TreehouseJoinCommunity from "../JoinCommunity/TreehouseJoinCommunity";

export default function TheTreehouse() {
  return (
    <section className="relative overflow-hidden bg-gray-modern-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
      >
        <Image
          src="/assets/texture_bottom-mobile.webp"
          alt=""
          width={390}
          height={740}
          priority
          unoptimized
          className="block h-auto w-full [image-rendering:pixelated] lg:hidden"
        />
        <Image
          src="/assets/texture-the-dao.webp"
          alt=""
          width={1440}
          height={946}
          priority
          unoptimized
          className="hidden h-auto w-full [image-rendering:pixelated] lg:block"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-20 sm:h-28 lg:h-36"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13, 18, 28, 0) 0%, rgba(13, 18, 28, 0.7) 55%, rgba(13, 18, 28, 1) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-480 flex-col gap-20 px-4 pb-24 pt-16 lg:gap-24 lg:px-4 3xl:px-20 lg:pt-24 lg:pb-28">
        <TreehouseHero />
        <TreehouseAccess />
        <TreehouseInside />
        <TreehouseEditions />
        <TreehouseJoinCommunity />
      </div>
    </section>
  );
}
