import Image from "next/image";
import Link from "next/link";
import FadeUp from "@/components/ui/FadeUp";

const ecosystemItems = [
  {
    title: "The DAO",
    description: "Learn how the DAO works, and how to participate",
    href: "/the-dao",
    color: "#c239f4",
    iconSrc: "/assets/the-dao.svg",
  },
  {
    title: "Gallery",
    description: "Browse the 222 animated Chimpions",
    href: "/nft-gallery",
    color: "#39f4c2",
    iconSrc: "/assets/gallery.svg",
  },
  {
    title: "Capital",
    description: "Lorem ipsum dolor sit amet",
    href: "/treehouse-capital",
    color: "#eeb411",
    iconSrc: "/assets/capital.svg",
  },
  {
    title: "Treehouse",
    description: "Lorem ipsum dolor sit amet",
    href: "/the-treehouse",
    color: "#fcfcfd",
    iconSrc: "/assets/tree-house.svg",
  },
];

const cardCls =
  "block vision-card shooting-top group rounded-sm border border-gray-modern-800 bg-gray-modern-950 p-6 lg:p-10 transition-all duration-300";

function EcosystemCard({ item }: { item: (typeof ecosystemItems)[number] }) {
  return (
    <Link
      href={item.href}
      className={cardCls}
      style={{ "--card-color": item.color } as React.CSSProperties}
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="size-10">
            <Image
              src={item.iconSrc}
              alt={item.title}
              width={40}
              height={40}
              className="size-10 object-contain transition-all duration-300 group-hover:brightness-0"
            />
          </div>
          <h3 className="mt-4 text-white font-bold text-[2rem] transition-colors duration-300 group-hover:text-gray-modern-950">
            {item.title}
          </h3>
          <p className="mt-2 text-gray-modern-400 text-xl leading-[1.2rem] transition-colors duration-300 group-hover:text-gray-modern-700">
            {item.description}
          </p>
        </div>
        <div className="arrow-bounce mt-10 transition-all duration-300 group-hover:brightness-0 shrink-0">
          <Image
            src="/assets/arrow-right.svg"
            alt="Arrow right"
            width={24}
            height={24}
            className="shrink-0"
          />
        </div>
      </div>
    </Link>
  );
}

export default function Ecosystem() {
  return (
    <>
      <section className="lg:hidden relative bg-gray-modern-900">
        <div className="absolute top-0 left-0 right-0">
          <Image
            src="/bgs/bg-ecosystem-mobile.png"
            alt=""
            width={800}
            height={400}
            priority
            unoptimized
            className="w-full h-auto [image-rendering:pixelated]"
          />
        </div>

        <div className="relative px-4 pt-20 pb-20">
          <div className="text-center flex flex-col pb-12">
            <h2 className="text-white font-title text-[3rem] leading-10.5 mb-4">
              Our{" "}
              <span
                className="animate-gradient-flow"
                style={
                  {
                    background:
                      "linear-gradient(90deg, #10c190 0%, #8dfcde 25%, #10c190 50%, #8dfcde 75%, #10c190 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  } as React.CSSProperties
                }
              >
                Ecosystem
              </span>
            </h2>
            <p className="text-white text-xl leading-[1.2rem]">
              Explore what makes The Chimpions unique
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {ecosystemItems.map((item, i) => (
              <FadeUp key={item.title} delay={i * 100}>
                <EcosystemCard item={item} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="hidden lg:block relative overflow-hidden bg-gray-modern-900">
        <Image
          src="/bgs/bg-ecosystem-desktop.png"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover 3xl:hidden"
        />

        <Image
          src="/bgs/bg-ecosystem-large.png"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover hidden 3xl:block"
        />

        <div className="relative max-w-480 mx-auto px-4 3xl:px-24 py-20">
          <div className="text-center flex flex-col pb-20">
            <h2 className="text-white font-title text-[3rem] leading-10.5 mb-4">
              Our{" "}
              <span
                className="animate-gradient-flow"
                style={
                  {
                    background:
                      "linear-gradient(90deg, #10c190 0%, #8dfcde 25%, #10c190 50%, #8dfcde 75%, #10c190 100%)",
                    backgroundSize: "200% 100%",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  } as React.CSSProperties
                }
              >
                Ecosystem
              </span>
            </h2>
            <p className="text-white text-xl leading-[1.2rem]">
              Explore what makes The Chimpions unique
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ecosystemItems.map((item, i) => (
              <FadeUp key={item.title} delay={i * 100}>
                <EcosystemCard item={item} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
