import Image from "next/image";

interface Edition {
  symbol: string;
  name: string;
  image: string;
  description: string;
}

async function fetchEditions(): Promise<Edition[]> {
  try {
    const res = await fetch(
      "https://api-mainnet.magiceden.io/organizations/the_chimpions?edge_cache=true",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];

    const data = (await res.json()) as {
      families?: {
        collections?: {
          symbol: string;
          name: string;
          image: string;
          description?: string;
        }[];
      }[];
    };

    const collections = data.families?.[0]?.collections ?? [];
    return collections
      .filter((c) => c.symbol !== "the_chimpions")
      .map((c) => ({
        symbol: c.symbol,
        name: c.name,
        image: c.image,
        description: c.description ?? "",
      }));
  } catch {
    return [];
  }
}

export default async function TreehouseEditions() {
  const editions = await fetchEditions();

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
        {editions.map((edition, index) => (
          <a
            key={edition.symbol}
            href={`https://magiceden.io/marketplace/${edition.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-md border border-gray-modern-800 bg-gray-modern-900 p-3 shadow-[0_0_18px_rgba(0,0,0,0.25)] transition-colors hover:border-gray-modern-600"
          >
            <div className="relative aspect-square overflow-hidden rounded-sm border border-gray-modern-800 bg-gray-modern-950">
              {edition.image && (
                <Image
                  src={edition.image}
                  alt={edition.name}
                  fill
                  unoptimized
                  priority={index < 4}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={`object-cover transition-transform duration-300 ${edition.symbol === "tws9" ? "scale-[1.25] group-hover:scale-[1.4]" : "group-hover:scale-105"}`}
                  style={{
                    objectFit: "cover",
                    objectPosition:
                      edition.symbol === "tws9" ? "20% center" : "center",
                  }}
                />
              )}
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <h3 className="text-white text-2xl leading-6 font-bold">
                {edition.name}
              </h3>
              <p className="text-aqua-marine-400 text-base">
                Edition {index + 1}
              </p>
              {edition.description && (
                <p className="text-gray-modern-500 text-base line-clamp-2">
                  {edition.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <a
          href="https://magiceden.io/creators/the_chimpions"
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
