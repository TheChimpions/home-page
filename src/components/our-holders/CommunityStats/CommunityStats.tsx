import Image from "next/image";

const stats = [
  {
    label: "Unique holders",
    value: "156",
    icon: "/assets/unique-holders.svg",
  },
  {
    label: "Countries",
    value: "42",
    icon: "/assets/countries.svg",
  },
  {
    label: "Whales (5+ NFTs)",
    value: "12",
    icon: "/assets/whales.svg",
  },
  {
    label: "Diamond Hands",
    value: "89%",
    icon: "/assets/diamond-hands.svg",
  },
];

export default function CommunityStats() {
  return (
    <section className="flex flex-col gap-12">
      <h2 className="text-white font-title text-[2rem] leading-11 xs:text-[2.5rem] sm:leading-12 text-center">
        Community Stats
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-md border flex flex-col gap-4 border-gray-modern-800 bg-gray-modern-900/70 px-5 py-6 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-105 hover:border-gray-modern-700 hover:bg-gray-modern-900/90 hover:shadow-[0_0_24px_rgba(0,0,0,0.4)] cursor-pointer"
          >
            <div className="flex justify-center">
              <Image
                src={stat.icon}
                alt=""
                width={40}
                height={40}
                className="size-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
              />
            </div>
            <p className="text-white text-[20px] font-bold leading-6 transition-colors duration-300 group-hover:text-aqua-marine-400">
              {stat.value}
            </p>
            <p className="text-gray-modern-400 text-[11px] tracking-[-1px] transition-colors duration-300 group-hover:text-gray-modern-300">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
