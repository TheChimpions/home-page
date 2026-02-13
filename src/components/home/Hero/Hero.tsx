import Image from "next/image";

export default function Hero() {
  return (
    <>
      {/* Mobile */}
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
              style={{
                background: "linear-gradient(90deg, #B411EE 0%, #11EEB4 25%, #B411EE 50%, #11EEB4 75%, #B411EE 100%)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              } as React.CSSProperties}
            >
              The Chimpions
            </span>
          </h1>

          <p className="text-xs text-center text-white leading-5.5 mt-6 px-4 ">
            A values-first and art-driven DAO investing in builders, art and
            Web3 culture. The modern think tank on Solana.
          </p>

          <div className="mt-12 w-full -mx-6">
            <Image
              src="/assets/chimps-mobile.png"
              alt="The Chimpions"
              width={400}
              height={300}
              priority
              unoptimized
              className="w-full h-auto [image-rendering:pixelated]"
            />
          </div>
        </div>
      </section>

      {/* Desktop */}
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
                style={{
                  background: "linear-gradient(90deg, #B411EE 0%, #11EEB4 25%, #B411EE 50%, #11EEB4 75%, #B411EE 100%)",
                  backgroundSize: "200% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                } as React.CSSProperties}
              >
                The Chimpions
              </span>
            </h1>

            <p className="text-sm text-white leading-5.5 mt-4 lg:max-w-md xl:max-w-2xl 2xl:max-w-full">
              A values-first and art-driven DAO investing in builders, art and
              Web3 culture.
              <br />
              The modern think tank on Solana.
            </p>
          </div>

          <div className="absolute right-0 3xl:right-13.75 -bottom-7.5 z-10">
            <Image
              src="/bgs/chimps.png"
              alt="The Chimpions NFTs"
              width={386}
              height={700}
              priority
              unoptimized
              className="h-185 w-auto [image-rendering:pixelated]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
