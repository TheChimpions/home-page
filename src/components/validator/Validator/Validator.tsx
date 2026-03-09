import Image from "next/image";
import ValidatorHero from "../Hero/ValidatorHero";
import ValidatorLiveStats from "../LiveStats/ValidatorLiveStats";
import ValidatorHowItWorks from "../HowItWorks/ValidatorHowItWorks";
import ValidatorWhyStake from "../WhyStake/ValidatorWhyStake";
import ValidatorDefiIntegration from "../DefiIntegration/ValidatorDefiIntegration";
import ValidatorHowToDelegate from "../HowToDelegate/ValidatorHowToDelegate";

export default function Validator() {
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

      <div className="relative z-10 mx-auto flex max-w-480 flex-col gap-16 px-4 pb-24 pt-16 lg:gap-24 lg:px-4 3xl:px-20 lg:pt-24 lg:pb-28">
        <ValidatorHero />
        <ValidatorLiveStats />
        <ValidatorHowItWorks />
        <ValidatorWhyStake />
        <ValidatorDefiIntegration />
        <ValidatorHowToDelegate />
      </div>
    </section>
  );
}
