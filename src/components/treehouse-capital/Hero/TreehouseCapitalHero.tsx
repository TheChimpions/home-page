"use client";

import Image from "next/image";
import Typewriter from "@/components/ui/Typewriter";

const line1 = "Backing founders, not hype. Treehouse Capital is The Chimpions' early-stage investment arm.";
const line2 = "We invest in the earliest stages of great and bold ideas, often before the public hears about them.";
const speed = 38;
const initialDelay = 150;
const line2Delay = initialDelay + line1.length * speed + 150;

const pCls = "text-2xl leading-5 text-gray-modern-950";

export default function TreehouseCapitalHero() {
  return (
    <section className="mx-auto w-full">
      <article className="overflow-hidden rounded-md border border-gray-modern-700/70 shadow-[0_0_18px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
          <div className="relative flex h-67.75 items-center justify-center bg-[#202736] px-8 py-10 lg:px-12 lg:py-11">
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

          <div className="relative flex h-67.75 items-center justify-center bg-aqua-marine-500 px-8 py-10 lg:px-12 lg:py-11">
            <Image
              src="/assets/right-capital.png"
              alt=""
              fill
              unoptimized
              className="pointer-events-none absolute inset-0 object-cover [image-rendering:pixelated]"
            />
            <div className="flex flex-col relative z-10 text-center max-w-sm gap-2">
              <p className={`${pCls} relative`}>
                <span className="invisible select-none" aria-hidden>{line1}</span>
                <span className="absolute inset-0">
                  <Typewriter text={line1} delay={initialDelay} speed={speed} snapCursorOnDone />
                </span>
              </p>
              <p className={`${pCls} relative`}>
                <span className="invisible select-none" aria-hidden>{line2}</span>
                <span className="absolute inset-0">
                  <Typewriter text={line2} delay={line2Delay} speed={speed} hideCursorUntilStart />
                </span>
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
