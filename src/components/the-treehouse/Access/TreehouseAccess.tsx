import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

type AccessCard = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: "arrow" | "magiceden";
};

const accessCards: AccessCard[] = [
  {
    title: "Stake with",
    description:
      "Stake via The Chimpions validator directly in your wallet or by holding The Chimpions LST.",
    ctaLabel: "Visit validator page",
    ctaHref: "/validator",
    icon: "arrow",
  },
  {
    title: "Hold a Together We Stand Edition",
    description:
      "Hold a Together We Stand Edition 0uN one of our exclusive TUS arts pieces to gain automatic access to The Treehouse community.",
    ctaLabel: "View on Magic Eden",
    ctaHref: "https://magiceden.io/creators/the_chimpions",
    icon: "magiceden",
  },
  {
    title: "Receive an Invitation",
    description:
      "Stake via The Chimpions validator directly in your wallet or by holding The Chimpions LST.",
  },
];

export default function TreehouseAccess() {
  return (
    <section id="treehouse-access" className="flex flex-col gap-8 scroll-mt-28">
      <FadeUp>
        <div className="text-center">
          <h2 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
            How to get{" "}
            <span
              className="animate-gradient-flow"
              style={
                {
                  background:
                    "linear-gradient(90deg, #eeb411 0%, #f8d063 25%, #eeb411 50%, #f8d063 75%, #eeb411 100%)",
                  backgroundSize: "200% 100%",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                } as React.CSSProperties
              }
            >
              access
            </span>
          </h2>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1  lg:grid-cols-[0.95fr_0.95fr] gap-6 items-stretch">
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          {accessCards.map((card, i) => (
            <FadeUp key={card.title} delay={i * 120}>
              <div
                className="vision-card shooting-top group rounded-lg border border-gray-modern-800 bg-gray-modern-900 p-6 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300"
                style={{ "--card-color": "#EEB411" } as React.CSSProperties}
              >
                <Image
                  src="/assets/plus.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 transition-all duration-300 group-hover:brightness-0"
                />
                <h3 className="mt-6 text-white font-bold text-[2.25rem] leading-9 sm:leading-10 transition-colors duration-300 group-hover:text-gray-modern-950">
                  {card.title}
                </h3>
                <p className="mt-4 text-gray-modern-400 text-xl leading-5 transition-colors duration-300 group-hover:text-gray-modern-700">
                  {card.description}
                </p>

                {card.ctaLabel && card.ctaHref && (
                  <a
                    href={card.ctaHref}
                    target={
                      card.ctaHref.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      card.ctaHref.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="group/cta mt-5 inline-flex h-12 items-center gap-3 rounded-sm border border-gray-modern-700 bg-gray-modern-900/50 px-4 text-[1.25rem] font-sans text-white transition-colors group-hover:bg-gray-modern-950 group-hover:border-gray-modern-800 group-hover/cta:bg-black group-hover/cta:border-gray-modern-600"
                  >
                    <span className="font-bold">{card.ctaLabel}</span>
                    {card.icon === "magiceden" && (
                      <Image
                        src="/logo/magic-eden.svg"
                        alt="Magic Eden"
                        width={21}
                        height={16}
                        className="brightness-0 invert"
                      />
                    )}
                  </a>
                )}
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={80} className="order-1 lg:order-2">
          <div className="relative aspect-4/5 lg:aspect-auto lg:min-h-80 overflow-hidden rounded-md shadow-[0_0_18px_rgba(0,0,0,0.25)] h-full">
            <Image
              src="/assets/treehouse.webp"
              alt="Treehouse visual"
              fill
              priority
              quality={100}
              unoptimized
              className="object-contain lg:object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(13,18,28,0.05) 0%, rgba(13,18,28,0.2) 100%)",
              }}
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
