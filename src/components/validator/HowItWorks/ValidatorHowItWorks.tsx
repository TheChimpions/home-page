import Image from "next/image";

const items = [
  {
    title: "Stake directly",
    description:
      "Stake directly to our validator via your wallet for traditional delegation rewards",
    iconSrc: "/assets/pc.svg",
  },
  {
    title: "Swap to ChimpSol",
    description:
      "Or swap to the LST token ChimpSol for liquid staking benefits",
    iconSrc: "/assets/coin.svg",
  },
];

export default function ValidatorHowItWorks() {
  return (
    <section className="flex flex-col gap-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-white font-title leading-11 text-[40px] xs:text-[50px] sm:leading-12">
          How it{" "}
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
            works
          </span>
        </h2>
        <p className="mt-4 text-gray-modern-400 text-xl leading-7">
          When you delegate your SOL to The Chimpions validator, you&apos;re directly helping secure the network while supporting a values-driven DAO.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-11 lg:grid-cols-2 lg:gap-28 mx-auto">
        <Image
          src="/assets/dashes.png"
          alt=""
          width={214}
          height={102}
          unoptimized
          className="pointer-events-none absolute left-1/2 -top-14 hidden -translate-x-1/2 lg:block"
        />

        {items.map((item) => (
          <article key={item.title} className="text-center">
            <div className="flex justify-center">
              <Image
                src={item.iconSrc}
                alt={item.title}
                width={60}
                height={60}
                className="size-15"
              />
            </div>
            <h3 className="mt-8 text-white text-[2rem] leading-8 sm:text-[2.5rem]">
              {item.title}
            </h3>
            <p className="mt-3 text-gray-modern-400 text-xl leading-5 max-w-sm mx-auto">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
