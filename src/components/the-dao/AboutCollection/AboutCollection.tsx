import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const perks = [
  "The Chimpions' private server",
  "DAO governance",
  "IRL events",
  "Exclusive alpha and opportunities",
  "Private investments via Treehouse Capital",
  "Upcoming merch drops",
];

export default function AboutCollection() {
  return (
    <section className="relative bg-gray-modern-950">
      <div className="max-w-480 mx-auto px-4 3xl:px-20 pb-24 lg:pb-32">
        <div className="rounded-lg border border-gray-modern-800 bg-gray-modern-900 p-6 lg:p-10 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <FadeUp delay={0}>
              <div className="flex flex-col gap-6">
                <h2 className="text-white font-title text-[2rem] xs:text-[3rem]  sm:text-[4rem] leading-9 xs:leading-11 sm:leading-15">
                  About the
                  <br />
                  <span
                    className="animate-gradient-flow"
                    style={
                      {
                        background:
                          "linear-gradient(90deg, #10c190 0%, #8dfcde 25%, #10c190 50%, #8dfcde 75%, #10c190 100%)",
                        backgroundSize: "200% 100%",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                      } as React.CSSProperties
                    }
                  >
                    NFT Collection
                  </span>
                </h2>
                <p className=" text-gray-modern-400 text-xl leading-5.5">
                  The Chimpions is a 1/1 animated pixel art NFT collection of
                  222 hand-drawn pieces. No generative layers - every Chimpion
                  is unique.
                </p>

                <div className="flex flex-col gap-6">
                  <p className="text-white text-xl font-bold">
                    Holding a Chimpion gives you access to:
                  </p>
                  <ul className="flex flex-col gap-3">
                    {perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-3">
                        <span className=" size-1.5 rounded-xs bg-gold-500 shrink-0" />
                        <span className="text-gray-modern-25 text-xl leading-5">
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 w-full md:w-auto">
                  <a
                    href="https://www.tensor.trade/trade/the_chimpions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full font-bold  h-12 lg:w-auto items-center rounded-sm justify-center gap-3  border border-gray-modern-700 bg-gray-modern-900/50 px-6 py-3 text-xl font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
                  >
                    <span className="font-bold">
                      <span className="hidden xs:inline-block">View on</span>{" "}
                      {""}
                      Tensor
                    </span>
                    <Image
                      src="/logo/tensor.svg"
                      alt="Tensor"
                      width={40}
                      quality={100}
                      priority
                      height={16}
                      className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                    />
                  </a>
                  <a
                    href="https://magiceden.io/creators/the_chimpions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full font-bold h-12 lg:w-auto items-center rounded-sm justify-center gap-3  border border-gray-modern-700 bg-gray-modern-900/50 px-6 py-3 text-xl font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
                  >
                    <span className="font-bold">
                      <span className="hidden xs:inline-block">View on </span>{" "}
                      Magic Eden
                    </span>
                    <Image
                      src="/logo/magic-eden.svg"
                      alt="Magic Eden"
                      width={25}
                      height={16}
                      className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                    />
                  </a>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={150}>
              <div className="w-full">
                <div className="overflow-hidden rounded-md border border-gray-modern-800 bg-gray-modern-950">
                  <video
                    src="/assets/chimpions-box.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full"
                  />
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
