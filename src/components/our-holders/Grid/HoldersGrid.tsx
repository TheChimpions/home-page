import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";

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
        {holders.map((holder, i) => (
          <FadeUp key={holder.id} delay={(i % 4) * 80}>
          <div
            className="group rounded-md border border-gray-modern-800 flex flex-col gap-6 bg-gray-modern-900 p-4 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-[1.02] hover:border-gray-modern-700 hover:shadow-[0_0_24px_rgba(0,0,0,0.4)] cursor-pointer"
          >
            <div className="relative mx-auto size-21 rounded-full overflow-hidden border border-gray-modern-700 bg-gray-modern-800/60 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/assets/profile-placeholder.svg"
                alt={holder.handle}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-2">
              {" "}
              <p className=" text-white text-xl font-bold">{holder.handle}</p>
              <div className="flex items-center justify-center gap-2">
                <Image
                  src="/assets/chimps-aqua-marine.svg"
                  alt="Chimps"
                  width={19}
                  height={19}
                  className="transition-transform duration-300 group-hover:rotate-12"
                />
                <p className=" text-aqua-marine-400 font-bold text-xl">
                  {holder.count}
                </p>
              </div>
            </div>

            <div className=" flex items-center justify-center gap-4">
              <span className="rounded-xs bg-gold-500/20 p-2 text-xl font-bold text-gray-modern-25 transition-all duration-300 group-hover:bg-gold-500/30 group-hover:scale-105">
                {holder.tags[0]}
              </span>
              <span className="rounded-xs bg-electric-purple-500/20 p-2 text-xl font-bold text-gray-modern-25 transition-all duration-300 group-hover:bg-electric-purple-500/30 group-hover:scale-105">
                {holder.tags[1]}
              </span>
            </div>

            <a
              href={`https://x.com/${holder.handle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-gray-modern-25 underline  hover:text-white transition-colors"
            >
              Twitter Profile
            </a>
          </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
