export default function NFTCardSkeleton() {
  return (
    <div className="rounded-md border flex flex-col gap-4 border-gray-modern-600 bg-rich-black-900 p-4 shadow-[0_0_18px_rgba(0,0,0,0.25)] animate-pulse">
      <div className="h-3 bg-gray-modern-800 rounded w-3/4"></div>

      <div className="relative w-full aspect-square overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950">
        <div className="absolute inset-0 bg-linear-to-br from-gray-modern-900 to-gray-modern-950"></div>
      </div>

      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-5 bg-gray-modern-800 rounded"></div>
              <div className="h-3 bg-gray-modern-800 rounded w-12"></div>
            </div>
            <div className="h-3 bg-gray-modern-800 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
