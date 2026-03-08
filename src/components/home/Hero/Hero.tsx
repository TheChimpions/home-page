import Image from "next/image";
import Typewriter from "@/components/ui/Typewriter";
import HeroCarousel from "./HeroCarousel";
import HeroCarouselHorizontal from "./HeroCarouselHorizontal";

const line1 = "A values-first and art-driven DAO investing in builders, art and Web3 culture.";
const line2 = "The modern think tank on Solana.";
const speed = 38;
const initialDelay = 150;
const line2Delay = initialDelay + line1.length * speed + 150;

const pCls = "text-[1.25rem] text-white leading-5.5";

export default function Hero() {
  return (
    <>
      <section className="lg:hidden relative overflow-hidden bg-gray-modern-950">
        <Image
          src="/assets/texture_bottom-mobile.png"
          alt="Background"
          fill
          priority
          unoptimized
          className="object-cover [image-rendering:pixelated]"
        />

        <div className="relative flex flex-col items-center text-center pb-10">
          <h1 className="text-[40px] xs:text-[50px] leading-11 font-title font-medium text-white mt-18 text-center px-4 ">
            Welcome to
            <br />
            <span
              className="animate-gradient-flow"
              style={
                {
                  background:
                    "linear-gradient(90deg, #B411EE 0%, #11EEB4 25%, #B411EE 50%, #11EEB4 75%, #B411EE 100%)",
                  backgroundSize: "200% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                } as React.CSSProperties
              }
            >
              The Chimpions
            </span>
          </h1>

          <div className="mt-6 px-4 text-center flex flex-col gap-1">
            <p className={`${pCls} relative`}>
              <span className="invisible select-none" aria-hidden>{line1}</span>
              <span className="absolute inset-0">
                <Typewriter text={line1} delay={initialDelay} speed={speed} snapCursorOnDone />
              </span>
            </p>
            <p className={`${pCls} relative`}>
              <span className="invisible select-none" aria-hidden>{line2}</span>
              <span className="absolute inset-0">
                <Typewriter text={line2} delay={line2Delay} speed={speed} hideCursorUntilStart />
              </span>
            </p>
          </div>

          <div className="mt-12 w-full">
            <HeroCarouselHorizontal />
          </div>
        </div>
      </section>

      <section className="hidden lg:block relative h-175 overflow-hidden bg-[#0B0F1A]">
        <Image
          src="/bgs/hero-bg.png"
          alt="Hero Background"
          fill
          priority
          unoptimized
          className="object-cover [image-rendering:pixelated]"
        />

        <div className="relative h-full max-w-480 mx-auto px-4 3xl:px-20 flex items-center justify-between">
          <div className="w-full">
            <h1 className="text-[64px] leading-17.5 font-title font-medium text-white">
              Welcome to
              <br />
              <span
                className="animate-gradient-flow"
                style={
                  {
                    background:
                      "linear-gradient(90deg, #B411EE 0%, #11EEB4 25%, #B411EE 50%, #11EEB4 75%, #B411EE 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  } as React.CSSProperties
                }
              >
                The Chimpions
              </span>
            </h1>

            <div className="mt-4 flex flex-col gap-1 lg:max-w-md xl:max-w-2xl 2xl:max-w-full">
              <p className={`${pCls} relative`}>
                <span className="invisible select-none" aria-hidden>{line1}</span>
                <span className="absolute inset-0">
                  <Typewriter text={line1} delay={initialDelay} speed={speed} snapCursorOnDone />
                </span>
              </p>
              <p className={`${pCls} relative`}>
                <span className="invisible select-none" aria-hidden>{line2}</span>
                <span className="absolute inset-0">
                  <Typewriter text={line2} delay={line2Delay} speed={speed} hideCursorUntilStart />
                </span>
              </p>
            </div>
          </div>

          <div className="absolute right-0 3xl:right-13.75 -bottom-7.5 z-10 h-185">
            <HeroCarousel />
          </div>
        </div>
      </section>
    </>
  );
}
