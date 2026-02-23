import Image from "next/image";

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
    ctaHref: "https://magiceden.io",
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
      <div className="text-center">
        <h2 className="text-white font-title text-[2rem] leading-11 xs:text-[3rem] sm:leading-12">
          How to get{" "}
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
            access
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1  lg:grid-cols-[0.95fr_0.95fr] gap-6 items-stretch">
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          {accessCards.map((card) => (
            <div
              key={card.title}
              className="rounded-lg border border-gray-modern-800 bg-gray-modern-900 p-6 shadow-[0_0_18px_rgba(0,0,0,0.25)]"
            >
              <Image
                src="/assets/plus.svg"
                alt=""
                width={40}
                height={40}
                className="size-10"
              />
              <h3 className="mt-6 text-white font-bold text-[2.25rem] leading-9 sm:leading-10">
                {card.title}
              </h3>
              <p className="mt-4 text-gray-modern-400 text-xl   leading-5">
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
                  className="group mt-5 inline-flex h-12 items-center gap-3 rounded-sm border border-gray-modern-700 bg-gray-modern-900/50 px-4 text-[1.25rem] font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
                >
                  <span className="font-bold">{card.ctaLabel}</span>
                  {card.icon === "magiceden" && (
                    <Image
                      src="/logo/magic-eden.svg"
                      alt="Magic Eden"
                      width={21}
                      height={16}
                      className="brightness-0 invert transition-all group-hover:brightness-0 group-hover:invert-0"
                    />
                  )}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="relative aspect-4/5 lg:aspect-auto lg:min-h-80 overflow-hidden rounded-md shadow-[0_0_18px_rgba(0,0,0,0.25)] order-1 lg:order-2">
          <Image
            src="/assets/treehouse.png"
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
      </div>
    </section>
  );
}
