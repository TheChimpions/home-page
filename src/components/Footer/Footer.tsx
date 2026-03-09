"use client";

import Link from "next/link";
import Image from "next/image";

const chimpionsLinks = [
  { label: "Home", href: "/" },
  { label: "The DAO", href: "/the-dao" },
  { label: "NFT Gallery", href: "/nft-gallery" },
  { label: "Our Holders", href: "/our-holders" },
  { label: "The Treehouse", href: "/the-treehouse" },
  { label: "Treehouse Capital", href: "/treehouse-capital" },
];

export default function Footer() {
  return (
    <>
      <footer className="lg:hidden bg-gray-modern-900 border-t border-gray-modern-800">
        <div className="px-4 py-16 flex flex-col items-center text-center">
          <Image
            src="/logo/logo-footer.png"
            alt="The Chimpions"
            width={106}
            priority
            quality={100}
            height={63}
            className="[image-rendering:pixelated]"
          />

          <p className="text-gray-modern-300 text-xl font-sans leading-5 mt-6">
            222 unique Chimpions. One powerful DAO.
            <br />
            Built on Solana.
          </p>

          <div className="mt-12">
            <h3 className="text-gray-modern-25 font-sans text-xl font-bold mb-4">
              The Chimpions
            </h3>
            <div className="flex flex-col items-center gap-4">
              {chimpionsLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-modern-50 hover:text-gold-500 text-xl font-sans transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-gray-modern-25 font-sans text-xl font-bold mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://x.com/TheChimpions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-modern-50 hover:text-gold-500 text-xl font-sans transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com/invite/thechimpions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-modern-50 hover:text-gold-500 text-xl font-sans transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-modern-800 w-full my-10"></div>

          <p className="text-gray-modern-50 text-base font-sans font-normal">
            © {new Date().getFullYear()} Chimpions
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-11 w-full">
            <a
              href="https://www.tensor.trade/trade/the_chimpions"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full font-bold sm:max-w-xs px-4 flex flex-row gap-2 h-10 items-center justify-center border border-gray-modern-700 text-white text-xl font-sans hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
            >
              <span>Tensor</span>
              <Image
                src="/logo/tensor.svg"
                alt="Tensor"
                width={32}
                height={25}
                className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
              />
            </a>
            <a
              href="https://magiceden.io/creators/the_chimpions"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full font-bold sm:max-w-xs px-4 flex flex-row gap-2 h-10 items-center justify-center border border-gray-modern-700 text-white text-xl font-sans hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
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
      </footer>

      <footer className="hidden lg:block bg-gray-modern-900 border-t border-gray-modern-800">
        <div className="max-w-480 mx-auto px-4 3xl:px-20 pb-0 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr_0.6fr] gap-12">
            <div className="flex flex-col gap-6">
              <Image
                src="/logo/logo-footer.svg"
                alt="The Chimpions"
                width={106}
                priority
                quality={100}
                height={63}
              />
              <p className="text-gray-modern-300 text-xl font-sans leading-5 max-w-3xl">
                222 unique Chimpions. One powerful DAO.
                <br />
                Built on Solana.
              </p>
            </div>

            <div>
              <h3 className="text-gray-modern-25 font-sans text-xl font-bold  mb-5">
                The Chimpions
              </h3>
              <div className="flex flex-wrap gap-x-6 gap-y-6 max-w-xs">
                {chimpionsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-modern-50 hover:text-gold-500 text-xl font-sans transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:justify-self-end lg:text-right">
              <h3 className="text-gray-modern-25 font-sans text-xl font-bold mb-5">
                Community
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-modern-50 hover:text-gold-500 text-xl font-sans transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-modern-50 hover:text-gold-500 text-xl font-sans transition-colors underline underline-offset-2 decoration-gray-modern-400 hover:decoration-gold-500"
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-480 mx-auto px-4 3xl:px-20 my-14">
          <div className="border-t border-gray-modern-800"></div>
        </div>

        <div className="">
          <div className="max-w-480 mx-auto px-4 3xl:px-20 pt-0 pb-16 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-modern-50 text-base font-sans font-normal">
              © {new Date().getFullYear()} Chimpions
            </p>

            <div className="flex items-center gap-4 shrink-0">
              <a
                href="https://www.tensor.trade/trade/the_chimpions"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-3 flex font-bold flex-row gap-2 lg:px-4 h-10 items-center border border-gray-modern-700 text-white text-xl  font-sans hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
              >
                <span>Tensor</span>
                <Image
                  src="/logo/tensor.svg"
                  alt="Tensor"
                  width={32}
                  height={25}
                  className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                />
              </a>
              <a
                href="https://magiceden.io/creators/the_chimpions"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-3 flex font-bold flex-row gap-2 lg:px-4 h-10 items-center border border-gray-modern-700 text-white text-xl font-sans hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
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
      </footer>
    </>
  );
}
