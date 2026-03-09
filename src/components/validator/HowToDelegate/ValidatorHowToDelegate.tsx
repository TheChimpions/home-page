"use client";

import Image from "next/image";
import { toast } from "sonner";
import StakeTerminal from "@/components/validator/StakeTerminal/StakeTerminal";
import FadeUp from "@/components/ui/FadeUp";

const walletSteps = [
  "Open Phantom, Backpack, Solflare, etc.",
  "Go to: Stake -> Validators",
  "Search: Chimpions or paste validator address",
  "Choose amount and confirm",
];

const chimpsolBenefits = [
  "ChimpSol is composable",
  "Grows your yield over time",
  "Liquid and tradeable",
];

const validatorAddress = "2AKNir1uW2Hmnzuuqpizu9SuFzj2GpRFLx2cCChtPUpbc";

export default function ValidatorHowToDelegate() {
  const handleCopyAddress = async () => {
    let didCopy = false;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(validatorAddress);
        didCopy = true;
      }
    } catch {
      didCopy = false;
    }

    if (!didCopy && typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.value = validatorAddress;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      didCopy = document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (!didCopy) {
      toast.error("Could not copy address");
      return;
    }

    toast.success("Address copied");
  };

  return (
    <section className="flex flex-col gap-8 lg:gap-10 ">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
          How to{" "}
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
            Delegate
          </span>
        </h2>
      </div>

      <div className="relative flex flex-col gap-6 lg:gap-14">
        <FadeUp delay={0} className="w-full">
          <div className="mx-auto grid w-full grid-cols-1 gap-6 lg:grid-cols-[287px_1fr] lg:items-start">
            <div className="hidden w-full max-w-71.75 rounded-md bshadow-[0_0_18px_rgba(0,0,0,0.25)] lg:block">
              <div className="overflow-hidden">
                <Image
                  src="/assets/screenshot.webp"
                  alt="Wallet screenshot"
                  width={287}
                  height={638}
                  unoptimized
                  className="block h-auto w-full"
                />
              </div>
            </div>

            <article className="relative w-full rounded-md border border-gray-modern-800 bg-gray-modern-900 p-6 md:p-9 shadow-[0_0_18px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col gap-10">
                <div className="flex flex-col xs:flex-row xs:items-center gap-4">
                  <div className="flex size-17 shrink-0 items-center justify-center bg-electric-purple-500 text-white font-title text-[2rem] leading-none">
                    1
                  </div>

                  <h3 className="text-white font-bold text-[2rem] leading-9">
                    Stake directly
                    <br />
                    in your wallet
                  </h3>
                </div>

                <ol className="flex flex-col gap-6 text-gray-modern-300 text-xl leading-5">
                  {walletSteps.map((step, index) => (
                    <li key={step}>
                      {index + 1}- {step}
                    </li>
                  ))}
                </ol>

                <Image
                  src="/assets/arrow-down.webp"
                  alt=""
                  width={89}
                  height={34}
                  unoptimized
                  className="pointer-events-none absolute left-18 top-full hidden h-104 w-auto lg:block"
                />
              </div>
            </article>
          </div>
        </FadeUp>

        <div className="mx-auto h-px w-full bg-gray-modern-800" />

        <FadeUp delay={150} className="w-full">
          <div className="mx-auto grid w-full grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start mb-6">
            <article className="rounded-md border border-gray-modern-800 bg-gray-modern-900 p-6 md:p-9 shadow-[0_0_18px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col xs:flex-row xs:items-center gap-4">
                  <div className="flex size-17 shrink-0 items-center justify-center bg-aqua-marine-700 text-white font-title text-[2rem] leading-none">
                    2
                  </div>

                  <h3 className="text-white text-[2rem] leading-9 font-bold max-w-sm">
                    Mint ChimpSol (Liquid Staking)
                  </h3>
                </div>

                <p className="max-w-lg text-gray-modern-400 text-xl leading-5">
                  Use our built-in Jupiter Terminal widget to swap SOL -&gt;
                  ChimpSol
                </p>

                <ul className="flex flex-col gap-6">
                  {chimpsolBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <span className="text-aqua-marine-500 text-xl leading-none">
                        ✓
                      </span>
                      <span className="text-gray-modern-100 text-xl leading-5">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <div className="flex flex-col rounded-md overflow-hidden">
              <StakeTerminal />
            </div>
          </div>
        </FadeUp>
      </div>

      <FadeUp delay={0}>
        <article className="rounded-md border border-gray-modern-800 bg-gray-modern-800/90 px-6 py-6 sm:px-6 w-full mx-auto text-center">
          <div className="flex flex-col gap-6">
            <h3 className="text-center text-white font-bold text-[1.5rem] leading-5">
              Our{" "}
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
                validator address
              </span>
            </h3>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="w-full rounded-sm border border-gray-modern-900 bg-gray-modern-900 px-3 py-3 cursor-pointer transition-colors hover:border-gray-modern-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-marine-500/70"
              aria-label="Copy validator address"
            >
              <p className="text-center text-gray-modern-300 text-xl tracking-tight break-all">
                {validatorAddress}
              </p>
            </button>

            <p className="text-center text-gray-modern-500 text-lg leading-5">
              Copy this address when staking through command line or supported
              wallets
            </p>
          </div>
        </article>
      </FadeUp>
    </section>
  );
}
