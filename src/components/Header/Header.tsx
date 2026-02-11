"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "The DAO", href: "/the-dao" },
  { label: "NFT Gallery", href: "/nft-gallery" },
  { label: "Our Holders", href: "/our-holders" },
  { label: "The Treehouse", href: "/the-treehouse" },
  { label: "Treehouse Capital", href: "/treehouse-capital" },
  { label: "Validator", href: "/validator" },
  { label: "Merch", href: "/merch" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-modern-900 border-b border-gray-modern-800">
        <div className="w-full 4xl:py-6 ">
          <div className="max-w-480 mx-auto px-4 3xl:px-20 h-20 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="4xl:hidden flex flex-col gap-1 w-7 h-6 justify-center"
              aria-label="Open menu"
            >
              <Image src="/assets/menu.svg" alt="Menu" width={24} height={18} />
            </button>

            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 4xl:relative 4xl:left-0 4xl:translate-x-0 shrink-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
            >
              <Image
                src="/logo/logo-header.png"
                alt="The Chimpions"
                width={76}
                height={45}
                className="xs:h-11.25 xs:w-19 w-13.5 h-7.75
"
                priority
              />
            </Link>

            <nav className="hidden 4xl:flex items-center gap-8 flex-1 justify-center mx-8">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-sans transition-colors hover:text-gold-500 whitespace-nowrap flex items-center gap-1 tracking-[-1px] ${
                      isActive
                        ? "text-gold-500 font-bold"
                        : "text-gray-modern-400"
                    }`}
                  >
                    {isActive && (
                      <Image
                        src="/assets/yellow-arrow.svg"
                        alt=""
                        width={20}
                        height={20}
                        className="w-6 h-6"
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden xl:flex items-center gap-4 shrink-0">
              <a
                href="https://tensor.trade"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-3 flex flex-row gap-2 lg:px-4 h-10 items-center border border-gray-modern-700 text-white text-xs lg:text-sm font-sans  hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
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
                href="https://magiceden.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-3 flex flex-row gap-2 lg:px-4 h-10 items-center border border-gray-modern-700 text-white text-xs lg:text-sm font-sans  hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
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

            <div className="md:hidden w-7"></div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        currentPath={pathname}
      />
    </>
  );
}
