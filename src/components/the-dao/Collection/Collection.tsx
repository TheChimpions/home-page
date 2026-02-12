const collectionStats = [
  { label: "Total Supply", value: "00" },
  { label: "Tribes", value: "00" },
  { label: "Floor Price", value: "00" },
  { label: "On-Chain", value: "00" },
];

export default function Collection() {
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
            <div className="flex flex-col gap-2 ">
              <h2 className="text-white font-title leading-11 text-[3rem] sm:leading-13">
                The Collection
              </h2>
              <p className="text-white text-sm leading-5.5 tracking-[-2px] max-w-xl">
                222 unique Chimpions form the foundation of our DAO.
              </p>
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-6">
              {collectionStats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-6">
                  <span className="text-gray-modern-400 text-xs leading-4 tracking-tighter">
                    {stat.label}
                  </span>
                  <span className="text-white font-sans font-bold text-[3rem] leading-10 scale-x-75 origin-center lg:origin-left">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
