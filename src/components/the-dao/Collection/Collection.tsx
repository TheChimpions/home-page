import CountUpStat from "@/components/ui/CountUpStat";
import { fetchMEStats } from "@/lib/collection-stats";

const numCls = "text-white font-sans font-bold text-[4rem] leading-10 tabular-nums";

export default async function Collection() {
  const meStats = await fetchMEStats();
  const floorSOL =
    meStats.floorPrice !== null ? meStats.floorPrice / 1_000_000_000 : null;

  const collectionStats = [
    {
      label: "Total Supply",
      node: <CountUpStat end={222} className={numCls} />,
    },
    {
      label: "Tribes",
      node: <CountUpStat end={4} className={numCls} />,
    },
    {
      label: "Floor Price",
      node:
        floorSOL !== null ? (
          <CountUpStat end={floorSOL} decimals={1} suffix=" SOL" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Listed",
      node:
        meStats.listedCount !== null ? (
          <CountUpStat end={meStats.listedCount} className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
  ];

  return (
    <section className="relative bg-gray-modern-950">
      <div className="max-w-480 mx-auto px-4 3xl:px-20 pb-24 lg:pb-28">
        <div className="relative overflow-hidden rounded-md border border-gray-modern-800 bg-gray-modern-900/80 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-1"
            style={{
              background: "linear-gradient(180deg, #B411EE 0%, #11EEB4 100%)",
            }}
          />

          <div className="px-6 sm:px-10 py-8 sm:py-10 flex flex-col items-center text-center lg:items-start lg:text-start gap-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-white font-title leading-11 text-[3rem] sm:leading-13">
                The Collection
              </h2>
              <p className="text-white text-xl leading-5 max-w-xl">
                222 unique Chimpions form the foundation of our DAO.
              </p>
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-6">
              {collectionStats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-4 items-center lg:items-start">
                  <span className="text-gray-modern-400 text-xl leading-5">
                    {stat.label}
                  </span>
                  {stat.node}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
