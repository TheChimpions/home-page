import Image from "next/image";

const visionCards = [
  {
    title: "Elevate 1/1 Art",
    description:
      'Bring back the true "non-fungible" spirit of NFTs through unique, hand-crafted art.',
    iconSrc: "/assets/elevate.svg",
    color: "#11EEB4",
  },
  {
    title: "Build on Solana",
    description:
      "Create meaningful presence through validator operations, alpha sharing, and collaboration.",
    iconSrc: "/assets/build.svg",
    color: "#B411EE",
  },
  {
    title: "Create Real Value",
    description:
      "Generate sustainable value through strategic investments, art curation, and network effects.",
    iconSrc: "/assets/create.svg",
    color: "#EEB411",
  },
];

export default function OurVision() {
  return (
    <section className="relative overflow-hidden bg-gray-modern-950">
      <div aria-hidden="true" className="absolute inset-0">
        <Image
          src="/assets/texture_bottom-mobile.png"
          alt="Background"
          fill
          priority
          unoptimized
          className="object-cover [image-rendering:pixelated] block lg:hidden"
        />

        <Image
          src="/assets/texture-the-dao.png"
          alt=""
          fill
          priority
          unoptimized
          className="hidden object-cover [image-rendering:pixelated] lg:block"
        />
      </div>

      <div className="relative max-w-480 mx-auto 3xl:px-20 pt-18 lg:pt-28 lg:pb-32">
        <div className="flex flex-col gap-10">
          <div className="text-center px-4 3xl:px-0 flex flex-col gap-6">
            <p className="text-white font-title leading-11 text-[4rem] sm:leading-13">
              Art. Capital.{" "}
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
                    display: "inline",
                  } as React.CSSProperties
                }
              >
                Integrity
              </span>
            </p>
            <p className=" text-gray-modern-400 text-[0.95rem] leading-5 tracking-[-2px] sm:text-sm sm:leading-5.5 max-w-2xl mx-auto">
              A holder-owned DAO building sustainable value through art, capital
              allocation, and community governance.
            </p>
          </div>

          <div className="sm:mt-10 flex justify-center">
            <div className="relative size-25.25 sm:size-33">
              <Image
                src="/logo/logo_bordered_fff.png"
                alt="The Chimpions emblem"
                width={101}
                height={101}
                className="object-contain [image-rendering:pixelated] lg:hidden"
              />
              <Image
                src="/logo/logo_bordered.png"
                alt="The Chimpions emblem"
                width={132}
                height={132}
                className="hidden object-contain [image-rendering:pixelated] lg:block"
              />
            </div>
          </div>

          <div className="px-4 3xl:px-0 text-center flex flex-col gap-4">
            <h2 className="text-white font-title leading-11 text-[3rem] sm:leading-13">
              Our{" "}
              <span
                className="animate-gradient-flow"
                style={
                  {
                    background:
                      "linear-gradient(90deg, #c19110 0%, #f8d063 25%, #c19110 50%, #f8d063 75%, #c19110 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  } as React.CSSProperties
                }
              >
                Vision
              </span>
            </h2>
            <p className=" text-white text-[0.95rem] leading-5 tracking-[-2px] sm:text-sm sm:leading-5.5 max-w-3xl mx-auto">
              To create a long-term, values-first community powered by art,
              creativity, and integrity. The Chimpions is a safe space to grow
              as a collector, builder, or artist - with no hype cycles, no PnDs,
              and no extractive culture.
            </p>
          </div>

          <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 3xl:p-0 bg-gray-modern-950 lg:bg-transparent pb-20 lg:pb-0">
            {visionCards.map((card) => (
              <div
                key={card.title}
                className="shooting-top group rounded-md border border-gray-modern-800 bg-gray-modern-900/70 p-5 sm:p-6 shadow-[0_0_24px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-gray-modern-900/90 cursor-pointer"
                style={
                  {
                    "--card-color": card.color,
                  } as React.CSSProperties
                }
              >
                <Image
                  src={card.iconSrc}
                  alt={card.title}
                  width={60}
                  height={60}
                  className="size-15 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                />
                <h3
                  className="mt-8 text-white font-title text-[22px] leading-6 sm:text-[26px] sm:leading-7 transition-colors duration-300 group-hover:[color:var(--card-color)]"
                >
                  {card.title}
                </h3>
                <p className="mt-2 text-gray-modern-400 text-[0.95rem] leading-5 tracking-[-2px] sm:text-sm sm:leading-5.5 transition-colors duration-300 group-hover:text-gray-modern-300">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
