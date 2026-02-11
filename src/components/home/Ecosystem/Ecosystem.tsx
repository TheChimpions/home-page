import Image from "next/image";
import Link from "next/link";

const ecosystemItems = [
  {
    title: "The DAO",
    description: "Learn how the DAO works, and how to participate",
    href: "/the-dao",
    color: "text-electric-purple-400",
    iconSrc: "/assets/the-dao.svg",
  },
  {
    title: "Gallery",
    description: "Browse the 222 animated Chimpions",
    href: "/nft-gallery",
    color: "text-aqua-marine-400",
    iconSrc: "/assets/gallery.svg",
  },
  {
    title: "Capital",
    description: "Lorem ipsum dolor sit amet",
    href: "/treehouse-capital",
    color: "text-gold-500",
    iconSrc: "/assets/capital.svg",
  },
  {
    title: "Treehouse",
    description: "Lorem ipsum dolor sit amet",
    href: "/the-treehouse",
    color: "text-gray-modern-25",
    iconSrc: "/assets/tree-house.svg",
  },
];

export default function Ecosystem() {
  return (
    <>
      {/* Mobile */}
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
              Our <span className="text-aqua-marine-400">Ecosystem</span>
            </h2>
            <p className="text-white text-[1.05rem] tracking-[-2px]">
              Explore what makes The Chimpions unique
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {ecosystemItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-sm border border-gray-modern-800 bg-gray-modern-950 p-10 transition-all hover:border-gray-modern-700 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="size-15">
                      <Image
                        src={item.iconSrc}
                        alt={item.title}
                        width={60}
                        height={60}
                        className="size-15 object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-white font-title font-bold text-[34px] tracking-[2px]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-modern-400 text-base leading-5 tracking-[-2px]">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-10 text-white transition-transform group-hover:translate-x-1 shrink-0">
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
            ))}
          </div>
        </div>
      </section>

      {/* Desktop */}
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
              Our <span className="text-aqua-marine-400">Ecosystem</span>
            </h2>
            <p className="text-white text-[1.05rem] tracking-[-2px]">
              Explore what makes The Chimpions unique
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ecosystemItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-sm border border-gray-modern-800 bg-gray-modern-950 p-10 transition-all hover:border-gray-modern-700 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="size-15">
                      <Image
                        src={item.iconSrc}
                        alt={item.title}
                        width={60}
                        height={60}
                        className="size-15 object-contain"
                      />
                    </div>
                    <h3 className="mt-4 text-white font-title font-bold text-[34px] tracking-[2px]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-modern-400 text-base leading-5 tracking-[-2px]">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-10 text-white transition-transform group-hover:translate-x-1 shrink-0">
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
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
