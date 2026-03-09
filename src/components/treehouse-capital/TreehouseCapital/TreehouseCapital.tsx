import Image from "next/image";
import TreehouseCapitalHero from "../Hero/TreehouseCapitalHero";
import TreehouseCapitalStrategy from "../Strategy/TreehouseCapitalStrategy";
import TreehouseCapitalFeeModel from "../FeeModel/TreehouseCapitalFeeModel";
import TreehouseCapitalPortfolio from "../Portfolio/TreehouseCapitalPortfolio";
import TreehouseCapitalPitchForm from "../PitchForm/TreehouseCapitalPitchForm";

export default function TreehouseCapital() {
  return (
    <>
      <section className="relative overflow-hidden bg-gray-modern-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-[110vw] -translate-x-1/2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#11112A]" />
          <Image
            src="/assets/bg-treehouse-capital.png"
            alt=""
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-480 flex-col gap-16 px-4 pt-16 lg:gap-20 lg:px-4 pb-13 lg:pt-24 3xl:px-20">
          <TreehouseCapitalHero />
          <TreehouseCapitalStrategy />
          <TreehouseCapitalFeeModel />
          <TreehouseCapitalPortfolio />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#212F49]">
        <Image
          src="/assets/pitch.png"
          alt=""
          width={280}
          height={248}
          className="pointer-events-none absolute left-0 top-1/2 hidden h-auto w-70 -translate-y-1/2 [image-rendering:pixelated] lg:block"
        />
        <div className="relative z-10 mx-auto max-w-480 px-4 pb-8 lg:px-4 3xl:px-20">
          <TreehouseCapitalPitchForm />
        </div>
      </section>
    </>
  );
}
