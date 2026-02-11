import Image from "next/image";

export default function About() {
  return (
    <section className="relative bg-gray-modern-950">
      <div className="max-w-480 mx-auto px-4 3xl:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.2fr] gap-6 sm:gap-10 items-center">
          <h2 className="text-white font-title text-[55px] leading-13.75 sm:leading-16 sm:text-[4rem]">
            What is
            <br />
            The Chimpions
          </h2>

          <p className="text-white text-sm leading-5.5 ">
            The Chimpions is more than an NFT collection—it&apos;s a movement.
            222 unique, meticulously crafted digital primates represent
            ownership in a holder-governed DAO that operates a Solana validator,
            invests in Web3 startups, and builds tools for the community. We
            believe in art, capital allocation, and integrity above all.
          </p>
        </div>

        <div className="mt-11 border">
          <div className="relative w-full aspect-1224/133">
            <Image
              src="/assets/chimps-board-4.png"
              alt="Chimpions mosaic"
              fill
              sizes="100vw"
              quality={100}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
