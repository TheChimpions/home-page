const liveStats = [
  { label: "APY", value: "7.2%" },
  { label: "Commission", value: "5%" },
  { label: "Uptime", value: "99,8%" },
  { label: "Delegated SOL", value: "2.1m SOL" },
  { label: "Total Stakers", value: "1,247" },
];

export default function ValidatorLiveStats() {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-center text-white font-title text-[2.5rem] leading-11 ">
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
