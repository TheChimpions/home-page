export default function TreehouseJoinCommunity() {
  return (
    <section className="relative overflow-hidden rounded-md border border-gray-modern-800 bg-gray-modern-900/70 px-6 py-6 sm:px-8 sm:py-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-1"
        style={{
          background: "linear-gradient(180deg, #B411EE 0%, #11EEB4 100%)",
        }}
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <h3 className="text-white font-title text-[2rem] leading-8 sm:text-[2.5rem] sm:leading-10">
            Ready to join the community?
          </h3>
          <p className="mt-3 text-white text-xl leading-5">
            The Treehouse is where signal thrives. Join our community of
            artists, researchers, and builders who are shaping the future of
            Web3 culture.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-82.5 ">
          <a
            href="#treehouse-access"
            className="animate-gradient-bg inline-flex h-14 items-center justify-center text-center rounded-sm px-4 text-xl font-sans font-bold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(90deg, #B411EE 0%, #11EEB4 50%, #B411EE 100%)",
              backgroundSize: "200% 100%",
            }}
          >
            Check Access Requirements
          </a>

          <a
            href="#treehouse-inside"
            className="inline-flex h-14 items-center justify-center text-center rounded-sm border border-gray-modern-700 bg-gray-modern-900/50 px-4 text-xl font-sans font-bold text-white transition-colors hover:border-gray-modern-500 hover:bg-gray-modern-900"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
