import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

const reasons = [
  {
    title: "Among the Best APY's",
    description:
      "Competitive staking rewards that are among the highest on Solana, maximizing your earning potential.",
    iconSrc: "/assets/trophy.svg",
    color: "#eeb411",
  },
  {
    title: "Treehouse Access",
    description:
      "Gain access to the exclusive Treehouse sub-community with holder benefits and networking opportunities.",
    iconSrc: "/assets/treehouse-green.svg",
    color: "#11EEB4",
  },
  {
    title: "Exclusive Airdrops",
    description:
      "Eligible for exclusive airdrops and limited editions available only to our staking community.",
    iconSrc: "/assets/airdrops.svg",
    color: "#fcfcfd",
  },
  {
    title: "Fund DAO Initiatives",
    description:
      "Your staking revenue directly helps fund DAO initiatives, investments, and ecosystem growth projects.",
    iconSrc: "/assets/dao.svg",
    color: "#B411EE",
  },
];

export default function ValidatorWhyStake() {
  return (
    <section className="flex flex-col gap-10">
      <h2 className="text-center text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
        Why Stake with{" "}
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
          Chimpions
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {reasons.map((reason, i) => (
          <FadeUp key={reason.title} delay={i * 100} className="h-full">
            <article
              className="vision-card shooting-top group rounded-sm border border-gray-modern-800 bg-gray-modern-950 p-6 lg:p-10 shadow-[0_0_18px_rgba(0,0,0,0.25)] flex flex-col gap-8 md:gap-12 transition-all duration-300 h-full"
              style={{ "--card-color": reason.color } as React.CSSProperties}
            >
              <Image
                src={reason.iconSrc}
                alt={reason.title}
                width={40}
                height={40}
                className="size-10 object-contain transition-all duration-300 group-hover:brightness-0"
              />
              <div className="flex flex-col gap-2">
                <h3 className="text-white text-[2rem] leading-8 font-bold transition-colors duration-300 group-hover:text-gray-modern-950">
                  {reason.title}
                </h3>
                <p className="text-gray-modern-400 text-xl leading-5 transition-colors duration-300 group-hover:text-gray-modern-700">
                  {reason.description}
                </p>
              </div>
            </article>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
