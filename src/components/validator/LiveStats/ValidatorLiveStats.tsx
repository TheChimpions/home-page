import CountUpStat from "@/components/ui/CountUpStat";
import FadeUp from "@/components/ui/FadeUp";

const TRILLIUM_URL =
  "https://api.trillium.so/validator_rewards/CHiaohVV2SQCFhiYP73iQzWT6HxnZqnAZJJqAYTeLAo";

interface TrilliumEpoch {
  epoch: number;
  delegator_compound_total_apy: number;
  commission: number;
  sw_uptime: number;
  activated_stake: number;
  skip_rate: number;
}

interface ValidatorStats {
  apy: number | null;
  commission: number | null;
  uptime: number | null;
  activatedStake: number | null;
}

async function fetchValidatorStats(): Promise<ValidatorStats> {
  const data = await fetch(TRILLIUM_URL, { next: { revalidate: 3600 } })
    .then((r) => (r.ok ? (r.json() as Promise<TrilliumEpoch[]>) : null))
    .then((arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : null))
    .catch(() => null);

  return {
    apy: data?.delegator_compound_total_apy ?? null,
    commission: data?.commission ?? null,
    uptime: data?.sw_uptime ?? null,
    activatedStake: data?.activated_stake ?? null,
  };
}

const numCls = "text-white font-title text-[3rem] leading-10 tabular-nums";

export default async function ValidatorLiveStats() {
  const stats = await fetchValidatorStats();

  const stakeM =
    stats.activatedStake !== null ? stats.activatedStake / 1_000_000 : null;

  const liveStats = [
    {
      label: "APY",
      node:
        stats.apy !== null ? (
          <CountUpStat end={stats.apy} decimals={2} suffix="%" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Commission",
      node:
        stats.commission !== null ? (
          <CountUpStat end={stats.commission} decimals={0} suffix="%" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Uptime",
      node:
        stats.uptime !== null ? (
          <CountUpStat end={stats.uptime} decimals={2} suffix="%" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Delegated SOL",
      node:
        stakeM !== null ? (
          <CountUpStat end={stakeM} decimals={2} suffix="M" className={numCls} />
        ) : (
          <span className={numCls}>—</span>
        ),
    },
    {
      label: "Delegators",
      node: <CountUpStat end={28} className={numCls} />,
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
