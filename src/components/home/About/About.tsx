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
            <div className="text-white text-xl leading-relaxed space-y-4">
              <p>
                The Chimpions is a curated collection of 222 NFTs, forming a
                network of individuals united by shared values. Each Chimpion is
                a 1/1 digital identity and a key to the DAO. At its core, The
                Chimpions is a values-first organization:
              </p>
              <ul className="space-y-1 pl-4 list-disc">
                <li>Integrity over hype</li>
                <li>Long-term thinking over short-term speculation</li>
                <li>Contribution over extraction</li>
              </ul>
              <p>
                Backed by a community-owned treasury, The Chimpions funds
                initiatives across Web3, art, and DeFi — from infrastructure and
                investments to creative projects and real-world activations.
              </p>
              <p>
                As a holder, you help govern a living treasury, back emerging
                builders, and shape projects with real impact.
              </p>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={300}>
          <div className="mt-11 border border-gray-modern-800 overflow-hidden max-h-77.5">
            <img
              src="/assets/chimpions-banner.gif"
              alt="Chimpions mosaic"
              className="w-full [image-rendering:pixelated]"
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
