import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const companies = [
  {
    id: "doublezero",
    logoSrc: "/assets/dz.svg",
    logoAlt: "DoubleZero",
    logoWidth: 217,
    logoHeight: 34,
    websiteHref: "https://doublezero.xyz/",
    twitterHref: "https://x.com/doublezero",
    description:
      "Revolutionary gaming platform bringing web3 mechanics to traditional gaming experiences.",
    cardClassName: "bg-[#0E775B]",
  },
  {
    id: "carrot",
    logoSrc: "/assets/carrot.svg",
    logoAlt: "CARROT",
    logoWidth: 142,
    logoHeight: 33,
    websiteHref: "https://deficarrot.com/",
    twitterHref: "https://x.com/DeFiCarrot",
    description:
      "Next-generation DeFi protocol focused on sustainable yield farming and liquidity strategy.",
    cardClassName: "bg-[#0E775B]",
  },
  {
    id: "portals",
    logoSrc: "/assets/portals.svg",
    logoAlt: "portals",
    logoWidth: 130,
    logoHeight: 30,
    websiteHref: "https://theportal.to/",
    twitterHref: "https://x.com/_portals_",
    description:
      "Advanced infrastructure tooling for Solana developers, simplifying complex blockchain interactions.",
    cardClassName: "bg-[#0E775B]",
  },
];

export default function TreehouseCapitalPortfolio() {
  return (
    <section className="mx-auto w-full ">
      <article className="relative overflow-hidden rounded-md border border-[#c8d3c5] bg-[#d6dfd3] px-5 py-8 shadow-[0_0_18px_rgba(0,0,0,0.25)] lg:px-10 lg:py-20">
        <Image
          src="/assets/portfolio.png"
          alt=""
          width={1104}
          height={223}
          className="pointer-events-none absolute left-0 top-0 h-auto w-full [image-rendering:pixelated]"
        />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="text-center flex flex-col gap-4">
            <h2 className="font-title text-[2.5rem] leading-10 text-[#212F49] sm:text-[3rem] sm:leading-11">
              Portfolio Companies
            </h2>
            <p className="text-base leading-5 text-[#11112A]">
              Current public participations:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:auto-rows-fr lg:grid-cols-3">
            {companies.map((company, i) => (
              <FadeUp key={company.id} delay={i * 150}>
                <article
                  className={`flex h-full min-h-35 flex-col gap-4 rounded-md px-4 py-4 text-center ${company.cardClassName}`}
                >
                  <div className="mx-auto flex h-9 items-center justify-center">
                    <Image
                      src={company.logoSrc}
                      alt={company.logoAlt}
                      width={company.logoWidth}
                      height={company.logoHeight}
                      className="h-auto max-h-9 w-auto max-w-full"
                    />
                  </div>
                  <p className="flex-1 text-[1rem] leading-5 text-aqua-marine-100/90">
                    {company.description}
                  </p>
                  <div className="mt-auto flex items-center justify-center gap-6 text-base leading-5">
                    <a
                      href={company.websiteHref}
                      target={
                        company.websiteHref.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        company.websiteHref.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-aqua-marine-500 underline underline-offset-4"
                    >
                      Website
                    </a>
                    <a
                      href={company.twitterHref}
                      target={
                        company.twitterHref.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        company.twitterHref.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-gold-500 underline underline-offset-4"
                    >
                      Twitter
                    </a>
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
