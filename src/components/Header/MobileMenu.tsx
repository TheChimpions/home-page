"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutList } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

interface NavigationItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  currentPath: string;
  onMyListings: () => void;
}

function MobileWalletButton() {
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted || (!connected && !connecting)) {
    return (
      <button
        onClick={mounted ? () => setVisible(true) : undefined}
        disabled={!mounted || connecting}
        className="group flex w-full items-center justify-center gap-2 h-12 border border-aqua-marine-500 text-aqua-marine-500 font-bold font-sans transition-colors hover:bg-aqua-marine-500 hover:text-gray-modern-950 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    const short = `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    return (
      <button
        onClick={() => disconnect()}
        className="group flex w-full text-base items-center justify-center gap-2 h-12 border border-gray-modern-700 text-white font-bold font-sans transition-colors hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400"
      >
        {short} · Disconnect
      </button>
    );
  }

  return null;
}

function MyListingsButton({ onMyListings, onClose }: { onMyListings: () => void; onClose: () => void }) {
  const { connected } = useWallet();
  if (!connected) return null;
  return (
    <button
      onClick={() => { onClose(); onMyListings(); }}
      className="group flex w-full items-center justify-center gap-2 h-12 border border-gray-modern-700 bg-gray-modern-900/50 px-6 text-base font-bold font-sans text-white transition-colors hover:bg-aqua-marine-500/20 hover:border-aqua-marine-500/50 hover:text-aqua-marine-400"
    >
      <LayoutList className="w-4 h-4 shrink-0" />
      My Listings
    </button>
  );
}

export default function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  currentPath,
  onMyListings,
}: MobileMenuProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setIsVisible(false);
    const timeout = setTimeout(() => setShouldRender(false), 300);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 z-50 4xl:hidden transition-opacity duration-300 ${
          isVisible ? "opacity-100 backdrop-blur-sm" : "opacity-0"
        }`}
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 left-0 w-full max-w-[100vw] bg-gray-modern-900 z-60 4xl:hidden shadow-xl transition-transform duration-300 ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="relative flex items-center justify-center px-4 py-4">
            <button
              onClick={onClose}
              className="absolute left-6 top-6 text-white hover:text-gold-400 transition-colors"
              aria-label="Close menu"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <Image
              src="/logo/logo-header.png"
              alt="The Chimpions"
              width={88}
              height={52}
              className="h-10 w-auto"
              priority
            />
          </div>

          <nav className="flex-1 overflow-y-auto px-6 pt-4">
            <ul className="flex flex-col gap-8">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-1 scale-x-95 origin-left text-[18px] leading-7 font-sans transition-colors ${
                        isActive
                          ? "text-gold-500  font-bold"
                          : "text-gray-modern-400 hover:text-gold-400"
                      }`}
                    >
                      {isActive && (
                        <Image
                          src="/assets/yellow-arrow.svg"
                          alt=""
                          width={23}
                          height={23}
                          className="size-6"
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-6 pb-8 pt-6 space-y-3">
            <MyListingsButton onMyListings={onMyListings} onClose={onClose} />
            <MobileWalletButton />
            <a
              href="https://tensor.trade"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full font-bold lg:w-auto items-center justify-center gap-2 h-12 border border-gray-modern-700 bg-gray-modern-900/50 px-6 py-3 text-base font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
            >
              <span className="font-bold">Tensor</span>
              <Image
                src="/logo/tensor.svg"
                alt="Tensor"
                width={25}
                height={16}
                className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
              />
            </a>
            <a
              href="https://magiceden.io"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full font-bold lg:w-auto items-center justify-center gap-2 h-12 border border-gray-modern-700 bg-gray-modern-900/50 px-6 py-3 text-base font-sans text-white transition-colors hover:bg-gold-500 hover:border-gold-500 hover:text-gray-modern-950"
            >
              <span className="font-bold">Magic Eden</span>
              <Image
                src="/logo/magic-eden.svg"
                alt="Magic Eden"
                width={21}
                height={16}
                className="brightness-0 invert group-hover:brightness-0 group-hover:invert-0 transition-all"
              />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
