import Image from "next/image";

const reasons = [
  {
    title: "Among the Best APY's",
    description:
      "Competitive staking rewards that are among the highest on Solana, maximizing your earning potential.",
    iconSrc: "/assets/trophy.svg",
  },
  {
    title: "Treehouse Access",
    description:
      "Gain access to the exclusive Treehouse sub-community with holder benefits and networking opportunities.",
    iconSrc: "/assets/treehouse-green.svg",
  },
  {
    title: "Exclusive Airdrops",
    description:
      "Eligible for exclusive airdrops and limited editions available only to our staking community.",
    iconSrc: "/assets/airdrops.svg",
  },
  {
    title: "Fund DAO Initiatives",
    description:
      "Your staking revenue directly helps fund DAO initiatives, investments, and ecosystem growth projects.",
    iconSrc: "/assets/dao.svg",
  },
];

export default function ValidatorWhyStake() {
  return (
    <section className="flex flex-col gap-10">
      <h2 className="text-center text-white font-title text-[2rem] leading-11 xs:text-[3rem] sm:leading-12">
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
        {reasons.map((reason) => (
          <article
            key={reason.title}
            className="rounded-md border border-gray-modern-800 bg-gray-modern-900 px-6 py-8 shadow-[0_0_18px_rgba(0,0,0,0.25)] flex flex-col md:gap-12 gap-8"
          >
            <Image
              src={reason.iconSrc}
              alt={reason.title}
              width={60}
              height={60}
              className="size-15"
            />
            <div className="flex flex-col gap-2">
              <h3 className=" text-white text-[2rem] leading-8 font-bold">
                {reason.title}
              </h3>
              <p className=" text-gray-modern-400 text-xl leading-5">
                {reason.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
