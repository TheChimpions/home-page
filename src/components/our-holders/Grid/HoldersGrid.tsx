import Image from "next/image";
import FadeUp from "@/components/ui/FadeUp";
import type { HolderProfile } from "@/lib/collection-stats";
import { truncateAddress } from "@/lib/utils";

interface HoldersGridProps {
  holders: HolderProfile[];
}

export default function HoldersGrid({ holders }: HoldersGridProps) {
  if (holders.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-modern-400 text-xl">
          No holders found.
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {holders.map((holder, i) => {
          const display = holder.username
            ? `@${holder.username}`
            : truncateAddress(holder.wallet);
          const twitterHandle = holder.twitter?.replace(/^@/, "");
          return (
            <FadeUp key={holder.wallet} delay={(i % 4) * 80}>
              <div className="group rounded-md border border-gray-modern-800 flex flex-col gap-6 bg-gray-modern-900 p-4 text-center shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-[1.02] hover:border-gray-modern-700 hover:shadow-[0_0_24px_rgba(0,0,0,0.4)] cursor-pointer">
                <div className="relative mx-auto size-21 rounded-full overflow-hidden border border-gray-modern-700 bg-gray-modern-800/60 transition-transform duration-300 group-hover:scale-110">
                  {holder.pfp ? (
                    <Image
                      src={holder.pfp}
                      alt={display}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src="/assets/profile-placeholder.svg"
                      alt={display}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2">
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
                  <div className="flex items-center justify-center gap-2">
                    <Image
                      src="/assets/chimps-aqua-marine.svg"
                      alt="Chimps"
                      width={19}
                      height={19}
                      className="transition-transform duration-300 group-hover:rotate-12"
                    />
                    <p className="text-aqua-marine-400 font-bold text-xl">
                      {holder.count} {holder.count === 1 ? "Chimpion" : "Chimpions"}
                    </p>
                  </div>
                </div>

                {twitterHandle && (
                  <a
                    href={`https://x.com/${twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-gray-modern-25 underline hover:text-white transition-colors"
                  >
                    Twitter Profile
                  </a>
                )}
              </div>
            </FadeUp>
          );
        })}
      </div>
    </div>
  );
}
