export default function Stats() {
  const stats = [
    { label: "Validator Stake", value: "00" },
    { label: "Monthly Revenue", value: "00" },
    { label: "Treasury", value: "00" },
    { label: "AUM", value: "00" },
    { label: "Floor Price", value: "00" },
  ];

  return (
    <section className="relative bg-gray-modern-900  border border-gray-modern-800 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full w-1 z-10"
        style={{
          background: "linear-gradient(180deg, #B411EE 0%, #11EEB4 100%)",
        }}
      />

      <div className="relative max-w-480 mx-auto px-4 3xl:px-20 py-14">
        {/* Mobile */}
        <div className="lg:hidden flex flex-col gap-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-8">
            {stats.slice(0, 4).map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center gap-4"
              >
                <span className="text-gray-modern-400 text-xl">
                  {stat.label}
                </span>
                <span className="text-white text-[3rem] font-bold leading-10">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <span className="text-gray-modern-400 text-xl">
              {stats[4].label}
            </span>
            <span className="text-white text-[3rem] font-bold leading-10">
              {stats[4].value}
            </span>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-start justify-between">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-start gap-4">
              <span className="text-gray-modern-400 text-xl">{stat.label}</span>
              <span className="text-white text-[3rem] font-bold leading-10">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
