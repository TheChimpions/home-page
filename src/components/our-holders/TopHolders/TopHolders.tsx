import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";
import type { HolderProfile } from "@/lib/collection-stats";
import { truncateAddress } from "@/lib/utils";
import HolderAvatar from "../HolderAvatar";

interface TopHoldersProps {
  holders: HolderProfile[];
}

export default function TopHolders({ holders }: TopHoldersProps) {
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
        {holders.map((holder, i) => {
          const display = holder.username
            ? `@${holder.username}`
            : truncateAddress(holder.wallet);
          const twitterHandle = holder.twitter?.replace(/^@/, "");
          const countLabel = `${holder.count} ${holder.count === 1 ? "Chimpion" : "Chimpions"}`;
          return (
            <FadeUp key={holder.wallet} delay={i * 80}>
              <div className="group flex items-center justify-between gap-3 xs:gap-4 rounded-md border border-gray-modern-800 bg-gray-modern-900 p-6 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-gray-modern-700 hover:bg-gray-modern-900/90 hover:shadow-[0_0_24px_rgba(0,0,0,0.4)] cursor-pointer">
                <div className="flex items-center gap-3 xs:gap-6 min-w-0 flex-1">
                  <div className="relative size-16 xs:size-22 shrink-0 rounded-full overflow-hidden border border-gray-modern-700 bg-gray-modern-800 transition-transform duration-300 group-hover:scale-110">
                    <HolderAvatar src={holder.pfp} alt={display} />
                  </div>
                  <div className="flex flex-col gap-1.5 xs:gap-3 min-w-0 flex-1">
                    {twitterHandle ? (
                      <a
                        href={`https://x.com/${twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-xl font-bold truncate hover:underline"
                      >
                        {display}
                      </a>
                    ) : (
                      <p className="text-white text-xl font-bold truncate">
                        {display}
                      </p>
                    )}
                    <p className="text-aqua-marine-400 text-xl font-bold xs:hidden">
                      {countLabel}
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
                  <span className="whitespace-nowrap text-xl">{countLabel}</span>
                </div>
              </div>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}
