import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import { SolanaProvider } from "@/components/connect/WalletProvider";
import { Toaster as HotToaster } from "react-hot-toast";

const siteUrl = "https://the-chimpions-two.vercel.app";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#121926",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Chimpions",
    template: "%s | The Chimpions",
  },
  description:
    "The Chimpions is a premier NFT collection on Solana — join the DAO, stake your chimp, and be part of the community.",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "The Chimpions",
    title: "The Chimpions",
    description:
      "The Chimpions is a premier NFT collection on Solana — join the DAO, stake your chimp, and be part of the community.",
    images: [
      {
        url: "/assets/preview.png",
        width: 1200,
        height: 630,
        alt: "The Chimpions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Chimpions",
    description:
      "The Chimpions is a premier NFT collection on Solana — join the DAO, stake your chimp, and be part of the community.",
    images: ["/assets/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/PixelOperator.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PixelOperator-Bold.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/alagard.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-[#121926] min-h-screen flex flex-col">
        <QueryProvider>
          <SolanaProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              closeButton
              toastOptions={{
                classNames: {
                  toast:
                    "font-sans bg-gray-modern-900 border border-gray-modern-700 text-gray-modern-25 shadow-[0_0_18px_rgba(0,0,0,0.35)]",
                  title: "text-[1.05rem] leading-5",
                  description: "text-gray-modern-400 text-base",
                  success: "border-aqua-marine-600",
                  error: "border-electric-purple-500",
                  closeButton:
                    "bg-gray-modern-800 text-gray-modern-300 border border-gray-modern-700",
                },
              }}
            />
            <HotToaster position="top-center" />
          </SolanaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
