"use client";

import { useEffect } from "react";
import Link from "next/link";

interface NavigationItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  currentPath: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  currentPath,
}: MobileMenuProps) {
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 4xl:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-modern-900 z-50 4xl:hidden shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-modern-800">
            <h2 className="text-white text-lg font-title font-semibold">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gold-400 transition-colors"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6">
            <ul className="space-y-4">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`block py-3 px-4 rounded transition-colors font-sans ${
                        isActive
                          ? "text-gold-400 bg-gold-400/10"
                          : "text-white hover:bg-gray-modern-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="md:hidden p-6 border-t border-gray-modern-800 space-y-3">
            <a
              href="https://tensor.trade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-white text-white text-sm font-sans font-medium rounded hover:bg-gold-400 hover:border-gold-400 hover:text-rich-black-950 transition-colors"
            >
              <span>Tensor</span>
            </a>
            <a
              href="https://magiceden.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-white text-white text-sm font-sans font-medium rounded hover:bg-gold-400 hover:border-gold-400 hover:text-rich-black-950 transition-colors"
            >
              <span>Magic Eden</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
