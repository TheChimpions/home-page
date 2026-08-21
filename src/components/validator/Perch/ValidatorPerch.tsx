import Image from "next/image";
import Link from "next/link";
import FadeUp from "@/components/ui/FadeUp";

const features = [
  "Track any validator on mainnet & testnet",
  "Live epoch progress & leader-slot stats",
  "Leader rewards banked every epoch",
  "SFDP compliance, commission & BLS-key checks",
];

const aquaGradient = {
  background:
    "linear-gradient(90deg, #11EEB4 0%, #b9feeb 25%, #11EEB4 50%, #b9feeb 75%, #11EEB4 100%)",
  backgroundSize: "200% 100%",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as React.CSSProperties;

export default function ValidatorPerch() {
  return (
    <section className="flex flex-col gap-10">
      <div className="mx-auto max-w-3xl text-center flex flex-col gap-4">
        <h2 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
          Meet{" "}
          <span className="animate-gradient-flow" style={aquaGradient}>
            Perch
          </span>
        </h2>
        <p className="text-gray-modern-400 font-sans text-xl leading-6">
          Your validator, in your pocket.
        </p>
      </div>

      <FadeUp>
        <div className="grid grid-cols-1 items-center gap-8 lg:gap-12 rounded-sm border border-gray-modern-800 bg-gray-modern-950 p-6 lg:p-10 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:grid-cols-[minmax(0,280px)_1fr]">
          <div className="mx-auto w-full max-w-65 overflow-hidden rounded-3xl border border-gray-modern-800 shadow-[0_0_32px_rgba(17,238,180,0.22)]">
            <Image
              src="/assets/perch-app.png"
              alt="Perch — Solana Validator Tracker app"
              width={1320}
              height={2868}
              className="block h-auto w-full"
            />
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-gray-modern-300 font-sans text-xl leading-6">
              Perch is a pixel-perfect Solana validator tracker that watches the
              chain so you don&apos;t have to. Epoch progress, leader slots,
              rewards, and SFDP compliance — all in glorious 8-bit. No accounts,
              no tracking, just the numbers that matter, brought to you by The
              Chimpions.
            </p>

            <ul className="flex flex-col gap-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-gray-modern-200 font-sans text-lg leading-5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 size-2.5 shrink-0 bg-aqua-marine-500 [image-rendering:pixelated]"
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <a
                href="https://apps.apple.com/us/app/sol-perch/id6773548821"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center border border-gray-modern-700 bg-gray-modern-900/50 px-4 font-sans text-lg text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
              >
                Download on the App Store
              </a>
              <span className="inline-flex h-10 items-center justify-center border border-gray-modern-800 px-4 font-sans text-lg text-gray-modern-400">
                Coming soon to Google Play
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href="/validator/perch/privacy"
                className="text-gray-modern-50 hover:text-gold-500 font-sans text-lg transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500"
              >
                Perch Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
