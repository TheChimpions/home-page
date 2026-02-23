import Image from "next/image";

export default function JoinCommunity() {
  return (
    <section className="">
      <div className="relative overflow-hidden rounded-md border border-gray-modern-800 bg-gray-modern-900/70 px-6 py-6 sm:px-8 sm:py-8 shadow-[0_0_24px_rgba(0,0,0,0.35)]">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-1"
          style={{
            background: "linear-gradient(180deg, #B411EE 0%, #11EEB4 100%)",
          }}
        />
        <div className="flex flex-col gap-10 lg:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-title text-[2rem] leading-7 sm:text-[2.5rem]">
              Ready to join the community?
            </h3>
            <p className=" text-white text-xl leading-5  max-w-xl">
              Become a Chimpion holder and gain access to our exclusive
              community, governance rights, and unique opportunities.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:items-end w-full md:w-auto">
            <a
              href="https://tensor.trade"
              target="_blank"
              rel="noopener noreferrer"
              className="group h-18 flex w-full font-bold  lg:max-w-auto items-center justify-between gap-3 rounded-sm border border-gray-modern-800 bg-gray-modern-900/50 px-4 py-3 text-2xl font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
            >
              <span>
                <span className="hidden xs:inline-block">Buy on </span> Tensor
              </span>
              <span className="hidden xs:flex w-9 justify-end shrink-0">
                <Image
                  src="/logo/tensor.svg"
                  alt="Tensor"
                  width={35}
                  height={16}
                  className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                />
              </span>
            </a>
            <a
              href="https://magiceden.io"
              target="_blank"
              rel="noopener noreferrer"
              className="group h-18 flex w-full font-bold lg:max-w-auto items-center justify-between gap-3 rounded-sm border border-gray-modern-800 bg-gray-modern-900/50 px-4 py-3 text-2xl font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
            >
              <span>
                <span className="hidden xs:inline-block">Buy on </span> {""}
                Eden
              </span>
              <span className="hidden xs:flex w-9 justify-end shrink-0">
                <Image
                  src="/logo/magic-eden.svg"
                  alt="Magic Eden"
                  width={25}
                  height={16}
                  className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
