import Image from "next/image";

const editions = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: "Forest Fellowship",
  piece: `Piece ${index + 1}`,
  artist: "Matasatsu & Metabolong",
  handle: "@Matabolong",
  imageSrc: "/assets/forest-fellowship.png",
}));

export default function TreehouseEditions() {
  return (
    <section className="relative">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <h2 className="text-white font-title text-[2rem] leading-11 xs:text-[3rem] sm:leading-12">
          Together We Stand{" "}
          <span
            className="animate-gradient-flow"
            style={
              {
                background:
                  "linear-gradient(90deg, #B411EE 0%, #E8B9FE 25%, #B411EE 50%, #E8B9FE 75%, #B411EE 100%)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              } as React.CSSProperties
            }
          >
            Editions
          </span>
        </h2>
        <p className="max-w-4xl text-white text-xl leading-5">
          A collection of 10 exclusive art pieces created by talented artists in
          our community. Each piece carried utility such as WL spots or token
          allocation when airdropped.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {editions.map((edition) => (
          <article
            key={edition.id}
            className="overflow-hidden rounded-md border border-gray-modern-800 bg-gray-modern-900/70 p-3 shadow-[0_0_18px_rgba(0,0,0,0.25)]"
          >
            <div className="relative aspect-[0.81/1] overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950">
              <Image
                src={edition.imageSrc}
                alt={edition.title}
                fill
                priority={edition.id <= 3}
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <h3 className="text-white text-2xl leading-6 font-bold">
                {edition.title}
              </h3>
              <p className="text-aqua-marine-400 text-base ">{edition.piece}</p>
              <p className="text-gray-modern-500 text-base">{edition.artist}</p>
              <p className="text-gray-modern-25 text-base underline underline-offset-2 cursor-pointer">
                {edition.handle}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <a
          href="https://magiceden.io"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-12 items-center gap-3 py-2 text-center border border-gray-modern-700 px-6 text-sm font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
        >
          <span className="font-bold text-xl">View on Magic Eden</span>
          <Image
            src="/logo/magic-eden.svg"
            alt="Magic Eden"
            width={21}
            height={16}
            className="brightness-0 invert transition-all group-hover:brightness-0 group-hover:invert-0"
          />
        </a>
      </div>
    </section>
  );
}
