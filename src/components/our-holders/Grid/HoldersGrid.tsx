import Image from "next/image";

const holders = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  handle: "@holderName",
  count: "2 Chimpions",
  tags: ["Beta", "Collector"],
}));

export default function HoldersGrid() {
  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {holders.map((holder) => (
          <div
            key={holder.id}
            className="group rounded-md border border-gray-modern-800 flex flex-col gap-6 bg-gray-modern-900 p-4 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-[1.02] hover:border-gray-modern-700 hover:shadow-[0_0_24px_rgba(0,0,0,0.4)] cursor-pointer"
          >
            <div className="mx-auto size-21 rounded-full border border-gray-modern-700 bg-gray-modern-800/60 transition-transform duration-300 group-hover:scale-110" />

            <div className="flex flex-col gap-2">
              {" "}
              <p className=" text-white text-sm font-bold tracking-[-1px]">
                {holder.handle}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Image
                  src="/assets/chimps-aqua-marine.svg"
                  alt="Chimps"
                  width={19}
                  height={19}
                  className="transition-transform duration-300 group-hover:rotate-12"
                />
                <p className=" text-aqua-marine-400 font-bold text-[11px] tracking-[-1px]">
                  {holder.count}
                </p>
              </div>
            </div>

            <div className=" flex items-center justify-center gap-4">
              <span className="rounded-xs bg-gold-500/20 p-2 text-[10px] font-bold text-gray-modern-25 transition-all duration-300 group-hover:bg-gold-500/30 group-hover:scale-105">
                {holder.tags[0]}
              </span>
              <span className="rounded-xs bg-electric-purple-500/20 p-2 text-[10px] font-bold text-gray-modern-25 transition-all duration-300 group-hover:bg-electric-purple-500/30 group-hover:scale-105">
                {holder.tags[1]}
              </span>
            </div>

            <a
              href={`https://x.com/${holder.handle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-gray-modern-25 underline tracking-[-2px] hover:text-white transition-colors"
            >
              Twitter Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
