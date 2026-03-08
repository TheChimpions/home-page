import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

export default function About() {
  return (
    <section className="relative bg-gray-modern-950">
      <div className="max-w-480 mx-auto px-4 3xl:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_0.9fr] gap-6 sm:gap-10 items-center">
          <FadeUp>
            <h2 className="text-white font-title text-[55px] leading-13.75 sm:leading-16 sm:text-[4rem]">
              What is
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
            </h2>
          </FadeUp>

          <FadeUp delay={150}>
            <p className="text-white text-xl leading-[1.2rem]">
              The Chimpions is more than an NFT collection—it&apos;s a movement.
              222 unique, meticulously crafted digital primates represent
              ownership in a holder-governed DAO that operates a Solana validator,
              invests in Web3 startups, and builds tools for the community. We
              believe in art, capital allocation, and integrity above all.
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={300}>
          <div className="mt-11 border">
            <div className="relative w-full aspect-1224/133">
              <Image
                src="/assets/chimps-board-4.png"
                alt="Chimpions mosaic"
                fill
                sizes="100vw"
                quality={100}
                className="object-contain"
              />
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
