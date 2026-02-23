"use client";

import Image from "next/image";

export default function JoinCta() {
  return (
    <section className="relative bg-gray-modern-950">
      <div className="max-w-480 mx-auto px-4 3xl:px-20 pt-21.25 pb-25 ">
        <div className="relative overflow-hidden rounded-md bg-gray-modern-900 px-6 lg:px-15.5 py-6 shadow-[4px_0_24px_0_rgba(7,7,7,0.20)]">
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-0.75"
            style={{
              background: "linear-gradient(180deg, #B411EE 0%, #11EEB4 100%)",
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
            <div>
              <h3 className="text-white font-title text-[2.5rem] leading-7.5">
                Want to be part of it?
              </h3>
              <p className="mt-4 text-white text-xl leading-5 max-w-lg">
                Join The Chimpions - buy an NFT, stake to our validator, or just
                vibe in the Treehouse.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end w-full md:w-auto">
              <a
                href="https://tensor.trade"
                target="_blank"
                rel="noopener noreferrer"
                className="group h-18 flex w-full font-bold lg:max-w-60 items-center justify-center gap-3 rounded-sm border border-gray-modern-800 bg-gray-modern-900/50 px-4 py-3 text-2xl font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
              >
                <span>Tensor</span>
                <Image
                  src="/logo/tensor.svg"
                  alt="Tensor"
                  width={35}
                  height={16}
                  className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                />
              </a>
              <a
                href="https://magiceden.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group h-18 flex w-full font-bold lg:max-w-60 items-center justify-center gap-3 rounded-sm border border-gray-modern-800 bg-gray-modern-900/50 px-4 py-3 text-2xl font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
              >
                <span>Magic Eden</span>
                <Image
                  src="/logo/magic-eden.svg"
                  alt="Magic Eden"
                  width={25}
                  height={16}
                  className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
