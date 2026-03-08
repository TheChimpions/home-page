import CountUpStat from "@/components/ui/CountUpStat";
import {
  fetchMEStats,
  fetchValidatorStake,
  parseStakeCountUp,
} from "@/lib/collection-stats";

const numCls = "text-white text-[3rem] font-bold leading-10 tabular-nums";

export default async function Stats() {
  const [meStats, validatorStake] = await Promise.all([
    fetchMEStats(),
    fetchValidatorStake(),
  ]);

  const stakeData = parseStakeCountUp(validatorStake);
  const floorSOL =
    meStats.floorPrice !== null ? meStats.floorPrice / 1_000_000_000 : null;

  const stats = [
    {
      label: "Validator Stake",
      node: stakeData ? (
        <CountUpStat
          end={stakeData.end}
          decimals={stakeData.decimals}
          suffix={stakeData.suffix}
          className={numCls}
        />
      ) : (
        <span className={numCls}>—</span>
      ),
    },
    { label: "Monthly Revenue", node: <span className={numCls}>$7k</span> },
    { label: "Treasury", node: <span className={numCls}>$357k</span> },
    { label: "AUM", node: <span className={numCls}>$90k/y</span> },
    {
      label: "Floor Price",
      node:
        floorSOL !== null ? (
          <CountUpStat end={floorSOL} decimals={1} suffix=" SOL" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
  ];

  return (
    <section className="relative bg-gray-modern-900 border border-gray-modern-800 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full w-1 z-10"
        style={{
          background: "linear-gradient(180deg, #B411EE 0%, #11EEB4 100%)",
        }}
      />

      <div className="relative max-w-480 mx-auto px-4 3xl:px-20 py-14">
        <div className="lg:hidden flex flex-col gap-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-8">
            {stats.slice(0, 4).map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-4">
                <span className="text-gray-modern-400 text-xl">{stat.label}</span>
                {stat.node}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <span className="text-gray-modern-400 text-xl">{stats[4].label}</span>
            {stats[4].node}
          </div>
        </div>

        <div className="hidden lg:flex items-start justify-between">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-start gap-4">
              <span className="text-gray-modern-400 text-xl">{stat.label}</span>
              {stat.node}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
