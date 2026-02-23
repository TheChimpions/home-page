import Image from "next/image";

const holders = Array.from({ length: 5 }, (_, index) => ({
  id: index,
  handle: "@holderName",
  count: "2 Chimpions",
  profile: "Twitter Profile",
}));

export default function TopHolders() {
  return (
    <section className="flex flex-col gap-12">
      <div className="text-center flex flex-col gap-3">
        <h2 className="text-white font-title text-[2rem] leading-11 xs:text-[2.5rem] sm:leading-12 text-center">
          Top{" "}
          <span
            className="animate-gradient-flow"
            style={
              {
                background:
                  "linear-gradient(90deg, #10c190 0%, #8dfcde 25%, #10c190 50%, #8dfcde 75%, #10c190 100%)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              } as React.CSSProperties
            }
          >
            Holders
          </span>
        </h2>
        <p className="text-white text-xl leading-5">
          Meet the community members who own and shape The Chimpions ecosystem
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {holders.map((holder) => (
          <div
            key={holder.id}
            className="group flex items-center justify-between gap-3 xs:gap-4 rounded-md border border-gray-modern-800 bg-gray-modern-900 p-6 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-gray-modern-700 hover:bg-gray-modern-900/90 hover:shadow-[0_0_24px_rgba(0,0,0,0.4)] cursor-pointer"
          >
            <div className="flex items-center gap-3 xs:gap-6 min-w-0 flex-1">
              <div className="relative size-16 xs:size-22 shrink-0 rounded-full overflow-hidden border border-gray-modern-700 bg-gray-modern-800 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/assets/profile-placeholder.svg"
                  alt={holder.handle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1.5 xs:gap-3 min-w-0 flex-1">
                <p className="text-white text-xl font-bold truncate">
                  {holder.handle}
                </p>
                <a
                  href={`https://x.com/${holder.handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-modern-25 underline text-base hover:text-white transition-colors"
                >
                  {holder.profile}
                </a>
                <p className="text-aqua-marine-400 text-xl font-bold xs:hidden">
                  {holder.count}
                </p>
              </div>
            </div>

            <div className="hidden xs:flex xs:flex-col xs:items-end gap-1.5 text-aqua-marine-400 text-xs font-bold shrink-0">
              <Image
                src="/assets/chimps-aqua-marine.svg"
                alt="Chimps"
                width={40}
                height={34}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span className="whitespace-nowrap text-xl">{holder.count}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
