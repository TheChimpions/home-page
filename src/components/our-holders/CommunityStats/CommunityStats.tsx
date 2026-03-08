import Image from "next/image";
import CountUpStat from "@/components/ui/CountUpStat";
import FadeUp from "@/components/ui/FadeUp";
import {
  fetchMEStats,
  fetchHolderStats,
} from "@/lib/collection-stats";

const numCls =
  "text-white text-[2.25rem] font-medium font-title leading-6 transition-colors duration-300 group-hover:text-gray-modern-950 tabular-nums";

export default async function CommunityStats() {
  const [meStats, holderStats] = await Promise.all([
    fetchMEStats(),
    fetchHolderStats(),
  ]);

  const floorSOL =
    meStats.floorPrice !== null ? meStats.floorPrice / 1_000_000_000 : null;

  const stats = [
    {
      label: "Unique Holders",
      icon: "/assets/unique-holders.svg",
      node:
        holderStats.uniqueHolders !== null ? (
          <CountUpStat end={holderStats.uniqueHolders} className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Whales (5+ NFTs)",
      icon: "/assets/whales.svg",
      node:
        holderStats.whales !== null ? (
          <CountUpStat end={holderStats.whales} className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Floor Price",
      icon: "/assets/diamond-hands.svg",
      node:
        floorSOL !== null ? (
          <CountUpStat end={floorSOL} decimals={1} suffix=" SOL" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Listed",
      icon: "/assets/countries.svg",
      node:
        meStats.listedCount !== null ? (
          <CountUpStat end={meStats.listedCount} className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
  ];

  return (
    <section className="flex flex-col gap-12">
      <h2 className="text-white font-title text-[2rem] leading-11 xs:text-[2.5rem] sm:leading-12 text-center">
        Community Stats
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <FadeUp key={stat.label} delay={(i % 4) * 80}>
          <div
            className="vision-card shooting-top group rounded-md border flex flex-col gap-4 border-gray-modern-800 bg-gray-modern-900 px-5 py-6 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300"
            style={{ "--card-color": "#fcfcfd" } as React.CSSProperties}
          >
            <div className="flex justify-center">
              <Image
                src={stat.icon}
                alt=""
                width={40}
                height={40}
                className="size-10 transition-all duration-300 group-hover:scale-110 group-hover:brightness-0"
              />
            </div>
            <div className="flex justify-center">
              {stat.node}
            </div>
            <p className="text-gray-modern-400 text-xl transition-colors duration-300 group-hover:text-gray-modern-700">
              {stat.label}
            </p>
          </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
