import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

export default function ValidatorDefiIntegration() {
  return (
    <section className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-gray-modern-900"
      />

      <Image
        src="/assets/purple-new.png"
        alt=""
        width={1019}
        height={1192}
        unoptimized
        className="pointer-events-none absolute left-[calc(50%-45vw-8rem)] -top-30 w-200 4xl:left-[calc(50%-49vw-8rem)] 4xl:-top-54 4xl:w-250"
      />

      <div className="relative z-10 grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:py-20">
        <div className="lg:max-w-md max-w-full flex flex-col gap-6">
          <h2 className="text-white font-title text-[2.5rem] leading-9 sm:text-[3rem] sm:leading-11">
            Solana DeFi
            <br />
            <span
              className="animate-gradient-flow"
              style={
                {
                  background:
                    "linear-gradient(90deg, #11EEB4 0%, #b9feeb 25%, #11EEB4 50%, #b9feeb 75%, #11EEB4 100%)",
                  backgroundSize: "200% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                } as React.CSSProperties
              }
            >
              Integration
            </span>
          </h2>

          <p className="text-gray-modern-400 text-xl leading-5 lg:max-w-xs max-w-full">
            ChimpSol is being integrated into the broader Solana DeFi ecosystem:
          </p>
        </div>

        <div className="grid gap-6 grid-rows-2 lg:max-w-2xl  w-full">
          <FadeUp delay={0}>
            <article className="h-full rounded-md border bg-gray-modern-800 border-gray-modern-800 px-6 py-6 shadow-[0_0_18px_rgba(0,0,0,0.25)] flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/assets/turn.svg"
                    alt="arrow"
                    width={24}
                    height={24}
                    className="size-6"
                  />
                  <p className="text-white font-title text-[1.5rem] leading-7">
                    Loopscale Integration
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Image
                    src="/assets/smile.svg"
                    alt="smile"
                    width={24}
                    height={24}
                    className="size-6"
                  />
                  <p className="text-white font-title text-[1.5rem] leading-7">
                    LIVE with 4x Multiplier
                  </p>
                </div>
              </div>

              <p className=" text-gray-modern-400 text-xl leading-5 max-w-sm">
                Enhanced rewards through Loopscale&apos;s innovative multiplier
                system
              </p>
            </article>
          </FadeUp>

          <FadeUp delay={150}>
            <article
              className="h-full rounded-md px-6 py-6 opacity-50 flex flex-col"
              style={{
                backgroundImage: [
                  "repeating-linear-gradient(90deg, rgba(54,69,82,0.9) 0 6px, transparent 6px 14px)",
                  "repeating-linear-gradient(90deg, rgba(54,69,82,0.9) 0 6px, transparent 6px 14px)",
                  "repeating-linear-gradient(0deg, rgba(54,69,82,0.9) 0 6px, transparent 6px 14px)",
                  "repeating-linear-gradient(0deg, rgba(54,69,82,0.9) 0 6px, transparent 6px 14px)",
                ].join(", "),
                backgroundSize: "14px 2px, 14px 2px, 2px 14px, 2px 14px",
                backgroundPosition: "0 0, 0 100%, 0 0, 100% 0",
                backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <Image
                  src="/assets/dao.svg"
                  alt="dao"
                  width={48}
                  height={48}
                  className="size-12"
                />
                <span
                  className="rounded-sm px-2  py-1 text-xl text-gray-modern-25"
                  style={{
                    backgroundImage: [
                      "repeating-linear-gradient(90deg, rgba(180,95,235,0.95) 0 4px, transparent 4px 9px)",
                      "repeating-linear-gradient(90deg, rgba(180,95,235,0.95) 0 4px, transparent 4px 9px)",
                      "repeating-linear-gradient(0deg, rgba(180,95,235,0.95) 0 4px, transparent 4px 9px)",
                      "repeating-linear-gradient(0deg, rgba(180,95,235,0.95) 0 4px, transparent 4px 9px)",
                    ].join(", "),
                    backgroundSize: "9px 1px, 9px 1px, 1px 9px, 1px 9px",
                    backgroundPosition: "0 0, 0 100%, 0 0, 100% 0",
                    backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
                  }}
                >
                  Coming soon
                </span>
              </div>

              <div className="mt-auto pt-12 flex flex-col gap-2">
                <h3 className=" text-gray-modern-200 font-title text-[1.5rem] leading-6">
                  More integrations
                  <br />
                  coming soon
                </h3>
                <p className=" text-gray-modern-500 text-xl">
                  Expanding ChimpSol utility across DeFi protocols
                </p>
              </div>
            </article>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
