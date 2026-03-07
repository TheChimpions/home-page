"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ChevronDown, ChevronUp, Wallet, LayoutList, Trash2 } from "lucide-react";
import MobileMenu from "./MobileMenu";
import MyListingsPanel from "./MyListingsPanel";

type NavLink = { label: string; href: string };
type NavGroup = { label: string; items: NavLink[] };
type NavEntry = NavLink | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => "items" in entry;

const navigation: NavEntry[] = [
  { label: "Home", href: "/" },
  { label: "The DAO", href: "/the-dao" },
  {
    label: "Community",
    items: [
      { label: "NFT Gallery", href: "/nft-gallery" },
      { label: "Our Holders", href: "/our-holders" },
      { label: "Chimp Swap", href: "/chimp-swap" },
    ],
  },
  {
    label: "Treehouse",
    items: [
      { label: "The Treehouse", href: "/the-treehouse" },
      { label: "Treehouse Capital", href: "/treehouse-capital" },
    ],
  },
  { label: "Validator", href: "/validator" },
];

const allNavItems: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "The DAO", href: "/the-dao" },
  { label: "NFT Gallery", href: "/nft-gallery" },
  { label: "Our Holders", href: "/our-holders" },
  { label: "Chimp Swap", href: "/chimp-swap" },
  { label: "The Treehouse", href: "/the-treehouse" },
  { label: "Treehouse Capital", href: "/treehouse-capital" },
  { label: "Validator", href: "/validator" },
];

function NavDropdown({
  group,
  currentPath,
}: {
  group: NavGroup;
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = group.items.some((item) => currentPath === item.href);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`cursor-pointer text-lg font-sans transition-colors hover:text-gold-500 flex items-center gap-1 whitespace-nowrap ${
          isActive ? "text-gold-500 font-bold" : "text-gray-modern-400"
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
        {group.label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-2 min-w-44 z-50">
        <div className="bg-gray-modern-900 border border-gray-modern-800 rounded-md py-1 shadow-xl">
          {group.items.map((item) => {
            const isItemActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-lg font-sans transition-colors hover:text-gold-500 whitespace-nowrap ${
                  isItemActive
                    ? "text-gold-500 font-bold"
                    : "text-gray-modern-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}

function WalletButton({ onMyListings }: { onMyListings: () => void }) {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="h-10 px-4 flex items-center gap-2 border border-gray-modern-700 text-gray-modern-500 text-lg font-sans font-bold opacity-50 cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    const short = `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer h-10 px-4 flex items-center gap-2 border border-aqua-marine-500 text-white text-lg font-sans font-bold hover:bg-gray-modern-800 transition-colors"
        >
          <Wallet className="w-4 h-4 shrink-0 text-aqua-marine-400" />
          <span className="whitespace-nowrap">{short}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-modern-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute top-full right-0 pt-2 z-50 min-w-full">
            <div className="bg-gray-modern-900 border border-gray-modern-800 rounded-md py-1 shadow-xl min-w-44">
              <button
                onClick={() => {
                  setOpen(false);
                  onMyListings();
                }}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-base font-sans text-gray-modern-300 hover:text-white hover:bg-gray-modern-800 transition-colors text-left"
              >
                <LayoutList className="w-4 h-4 shrink-0" />
                My Listings
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  disconnect();
                }}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-base font-sans text-red-400 hover:text-red-300 hover:bg-gray-modern-800 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                Disconnect wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      disabled={connecting}
      className="cursor-pointer h-10 px-4 flex items-center gap-2 border border-aqua-marine-500 text-aqua-marine-500 text-lg font-sans font-bold hover:bg-aqua-marine-500 hover:text-gray-modern-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="w-4 h-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-modern-900 border-b border-gray-modern-800">
        <div className="w-full min-[1400px]:py-2">
          <div className="max-w-480 mx-auto h-20 flex items-center justify-between relative z-10 px-4 3xl:px-20">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="min-[1400px]:hidden flex flex-col gap-1 w-7 h-6 justify-center"
              aria-label="Open menu"
            >
              <Image src="/assets/menu.svg" alt="Menu" width={24} height={18} />
            </button>

            <Link
              href="/"
              className="min-[1400px]:hidden absolute left-1/2 -translate-x-1/2 shrink-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
            >
              <Image
                src="/logo/logo-header.png"
                alt="The Chimpions"
                width={76}
                height={45}
                className="xs:h-11.25 xs:w-19 w-13.5 h-7.75"
                priority
              />
            </Link>

            <div className="hidden min-[1400px]:flex items-center gap-10">
              <Link
                href="/"
                className="shrink-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <Image
                  src="/logo/logo-header.png"
                  alt="The Chimpions"
                  width={76}
                  height={45}
                  priority
                />
              </Link>
              <nav className="flex items-center gap-8">
              {navigation.map((entry) => {
                if (isGroup(entry)) {
                  return (
                    <NavDropdown
                      key={entry.label}
                      group={entry}
                      currentPath={pathname}
                    />
                  );
                }
                const isActive = pathname === entry.href;
                return (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className={`text-lg font-sans transition-colors hover:text-gold-500 whitespace-nowrap flex items-center gap-1 ${
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
                    {entry.label}
                  </Link>
                );
              })}
            </nav>
            </div>

            <div className="hidden min-[1400px]:flex items-center gap-2 shrink-0">
              <a
                href="https://tensor.trade"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-lg font-bold px-3 flex flex-row gap-2 lg:px-4 h-10 items-center border border-gray-modern-700 text-white font-sans hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
              >
                <span>Tensor</span>
                <Image
                  src="/logo/tensor.svg"
                  alt="Tensor"
                  width={22}
                  height={17}
                  className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                />
              </a>
              <a
                href="https://magiceden.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group text-lg font-bold px-3 flex flex-row gap-2 lg:px-4 h-10 items-center border border-gray-modern-700 text-white font-sans hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950 transition-colors"
              >
                <span>Magic Eden</span>
                <Image
                  src="/logo/magic-eden.svg"
                  alt="Magic Eden"
                  width={18}
                  height={12}
                  className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
                />
              </a>
              <WalletButton onMyListings={() => setShowMyListings(true)} />
            </div>

            <div className="md:hidden w-7"></div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={allNavItems}
        currentPath={pathname}
      />

      {showMyListings && (
        <MyListingsPanel onClose={() => setShowMyListings(false)} />
      )}
    </>
  );
}
