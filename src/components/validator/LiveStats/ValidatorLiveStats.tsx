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
  skipRate: number | null;
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
    skipRate: data?.skip_rate ?? null,
  };
}

function formatStake(sol: number | null): string {
  if (sol === null) return "—";
  if (sol >= 1_000_000) return `${(sol / 1_000_000).toFixed(2)}M`;
  if (sol >= 1_000) return `${(sol / 1_000).toFixed(1)}K`;
  return sol.toLocaleString();
}

export default async function ValidatorLiveStats() {
  const stats = await fetchValidatorStats();

  const liveStats = [
    {
      label: "APY",
      value: stats.apy !== null ? `${stats.apy.toFixed(2)}%` : "—",
    },
    {
      label: "Commission",
      value: stats.commission !== null ? `${stats.commission}%` : "—",
    },
    {
      label: "Uptime",
      value: stats.uptime !== null ? `${stats.uptime.toFixed(2)}%` : "—",
    },
    {
      label: "Delegated SOL",
      value: formatStake(stats.activatedStake),
    },
    {
      label: "Delegators",
      value: "28",
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-center text-white font-title text-[2.5rem] leading-11">
        Live Stats
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {liveStats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-md border border-gray-modern-800 bg-gray-modern-900 px-6 py-8 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] flex flex-col gap-4"
          >
            <p className="text-gray-modern-400 text-xl leading-5">
              {stat.label}
            </p>
            <p className="mt-3 text-white font-title text-[3rem] leading-10">
              {stat.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
