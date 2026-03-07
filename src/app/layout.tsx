import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
import { SolanaProvider } from "@/components/connect/WalletProvider";
import { Toaster as HotToaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "The Chimpions",
  description: "Join The Chimpions, the premier NFT collection on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0f1a] min-h-screen flex flex-col">
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
