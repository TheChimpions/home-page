import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const insideItems = [
  {
    title: "Art center",
    description:
      "For sharing art alpha and amazing art pieces. Discover emerging artists, get early access to drops, and connect with the creative community.",
    iconSrc: "/assets/elevate.svg",
  },
  {
    title: "Research center",
    description:
      "Deep research on interesting projects. Comprehensive analysis, due diligence reports, and collaborative research initiatives.",
    iconSrc: "/assets/search-purple.svg",
  },
  {
    title: "AI Center",
    description:
      "For experimentation and AI tooling. Cutting-edge AI applications, tool development, and collaborative AI projects.",
    iconSrc: "/assets/ai-center.svg",
  },
];

export default function TreehouseInside() {
  return (
    <section id="treehouse-inside" className="relative scroll-mt-28">
      <Image
        src="/assets/purple-left.png"
        alt=""
        width={1019}
        height={1192}
        priority
        className="pointer-events-none absolute -right-80 -top-52 hidden w-2xl opacity-45 lg:block"
      />

      <div className="relative z-10 flex flex-col gap-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 lg:gap-10 text-center">
          <h2 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
            Inside you will{" "}
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
              find
            </span>
          </h2>
          <p className="text-white text-xl leading-5">
            To create a long-term, values-first community powered by art,
            creativity, and integrity. The Chimpions is a safe space to grow as
            a collector, builder, or artist - with no hype cycles, no PnDs, and
            no extractive culture.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          {insideItems.map((item, i) => (
            <FadeUp key={item.title} delay={i * 150}>
            <article className="text-center p-6">
              <div className="flex justify-center">
                <Image
                  src={item.iconSrc}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="size-15"
                />
              </div>
              <h3 className="mt-8 text-white text-2xl font-bold leading-6">
                {item.title}
              </h3>
              <p className="mt-3 text-gray-modern-400 text-xl leading-5">
                {item.description}
              </p>
            </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
