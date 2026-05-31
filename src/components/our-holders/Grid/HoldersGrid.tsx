import FadeUp from "@/components/ui/FadeUp";
import type { HolderProfile } from "@/lib/collection-stats";
import HolderCard from "./HolderCard";

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
        {holders.map((holder, i) => (
          <FadeUp key={holder.wallet} delay={(i % 4) * 80} className="h-full">
            <HolderCard holder={holder} />
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
