import Image from "next/image";

export default function TreehouseCapitalHero() {
  return (
    <section className="mx-auto w-full">
      <article className="overflow-hidden rounded-md border border-gray-modern-700/70 shadow-[0_0_18px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
          <div className="relative flex h-[16.9375rem] items-center justify-center bg-[#202736] px-8 py-10 lg:px-12 lg:py-11">
            <Image
              src="/assets/left-capital.png"
              alt=""
              fill
              unoptimized
              className="pointer-events-none absolute inset-0 object-cover [image-rendering:pixelated]"
            />
            <Image
              src="/assets/chimpions-treehouse-capital.png"
              alt="Treehouse Capital logo"
              width={220}
              height={220}
              unoptimized
              className="relative z-10 h-auto w-44 sm:w-52"
            />
          </div>

          <div className="relative flex h-[16.9375rem] items-center justify-center bg-aqua-marine-500 px-8 py-10 lg:px-12 lg:py-11">
            <Image
              src="/assets/right-capital.png"
              alt=""
              fill
              unoptimized
              className="pointer-events-none absolute inset-0 object-cover [image-rendering:pixelated]"
            />
            <div className="flex flex-col  text-gray-modern-950 relative z-10 text-center text-2xl max-w-sm leading-5 gap-2">
              <p>
                Backing founders, not hype. Treehouse Capital is The
                Chimpions&apos; early-stage investment arm.{" "}
              </p>
              <p>
                We invest in the earliest stages of great and bold ideas, often
                before the public hears about them.
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
