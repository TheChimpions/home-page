import CountUpStat from "@/components/ui/CountUpStat";
import FadeUp from "@/components/ui/FadeUp";
import {
  fetchValidatorStake,
  fetchValidatorDelegators,
  fetchValidatorStakewiz,
} from "@/lib/collection-stats";

const numCls = "text-white font-title text-[3rem] leading-10 tabular-nums";

export default async function ValidatorLiveStats() {
  const [stakewiz, stakeSol, delegators] = await Promise.all([
    fetchValidatorStakewiz(),
    fetchValidatorStake(),
    fetchValidatorDelegators(),
  ]);

  const stakeK =
    stakeSol !== null ? Math.round(stakeSol / 1000) : null;
  const apy = stakewiz?.apy_estimate ?? null;
  const commission = stakewiz?.commission ?? null;
  const uptime = stakewiz?.credit_ratio ?? null;

  const liveStats = [
    {
      label: "APY",
      node:
        apy !== null ? (
          <CountUpStat end={apy} decimals={2} suffix="%" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Commission",
      node:
        commission !== null ? (
          <CountUpStat
            end={commission}
            decimals={0}
            suffix="%"
            className={numCls}
          />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Uptime",
      node:
        uptime !== null ? (
          <CountUpStat end={uptime} decimals={2} suffix="%" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Delegated SOL",
      node:
        stakeK !== null ? (
          <CountUpStat end={stakeK} decimals={0} suffix="k" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Delegators",
      node:
        delegators !== null ? (
          <CountUpStat
            end={delegators.uniqueDelegators}
            decimals={0}
            className={numCls}
          />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-center text-white font-title text-[2.5rem] leading-11">
        Live Stats
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {liveStats.map((stat, i) => (
          <FadeUp key={stat.label} delay={(i % 5) * 80}>
            <article className="rounded-md border border-gray-modern-800 bg-gray-modern-900 px-6 py-8 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] flex flex-col gap-4">
              <p className="text-gray-modern-400 text-xl leading-5">
                {stat.label}
              </p>
              <div className="flex justify-center mt-3">
                {stat.node}
              </div>
            </article>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
