import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const strategyCards = [
  {
    title: "Deep Involvement with Builders",
    description:
      "We work closely with founders from day one, providing hands-on support and guidance.",
    iconSrc: "/assets/deep.webp",
  },
  {
    title: "Real-time Feedback",
    description:
      "Active users in our community provide immediate, valuable feedback on new projects.",
    iconSrc: "/assets/feedback.webp",
  },
  {
    title: "Long-term Vision",
    description:
      "The DAO's alignment ensures we think beyond quick wins to lasting value creation.",
    iconSrc: "/assets/long-term.webp",
  },
];

export default function TreehouseCapitalStrategy() {
  return (
    <section className="mx-auto flex w-full flex-col gap-10">
      <h2 className="text-center font-title text-[2.5rem] leading-10 text-white sm:text-[3rem] sm:leading-11">
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
          Strategy
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {strategyCards.map((card, i) => (
          <FadeUp key={card.title} delay={i * 150}>
          <article
            className="group flex min-h-58 flex-col justify-between gap-4 rounded-md border border-[#c8d3c5] bg-[#d6dfd3] p-6 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-colors duration-300 hover:bg-[#212F49] hover:border-[#212F49]"
          >
            <Image
              src={card.iconSrc}
              alt=""
              width={60}
              height={60}
              className="size-15 brightness-0 saturate-0 opacity-80 transition-all duration-300 group-hover:invert group-hover:opacity-100"
            />
            <div className="flex flex-col">
              <h3 className="text-2xl leading-7 text-[#212F49] font-bold transition-colors duration-300 group-hover:text-[#d6dfd3]">
                {card.title}
              </h3>
              <p className="min-h-10 text-base leading-5 text-[#215E85] transition-colors duration-300 group-hover:text-[#d6dfd3]/70">
                {card.description}
              </p>
            </div>
          </article>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
