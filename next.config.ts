import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
    "@tensor-oss/tcomp-sdk",
  ],
  // The swap card reads its font and background files from disk at runtime,
  // so ship them with the function that renders it.
  outputFileTracingIncludes: {
    "/api/inngest": [
      "./public/fonts/alagard.ttf",
      "./public/fonts/PixelOperator.ttf",
      "./public/fonts/PixelOperator-Bold.ttf",
      "./public/assets/treehouse.png",
    ],
  },
  async redirects() {
    return [
      // Grail Grove launched at /chimp-swap; keep shared links working.
      { source: "/chimp-swap", destination: "/grail-grove", permanent: true },
    ];
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "creator-hub-prod.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.arweave.net",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
      },
      {
        protocol: "https",
        hostname: "nftstorage.link",
      },
      {
        protocol: "https",
        hostname: "**.ipfs.nftstorage.link",
      },
      {
        protocol: "https",
        hostname: "shdw-drive.genesysgo.net",
      },
      {
        protocol: "https",
        hostname: "nft.matrica.io",
      },
    ],
  },
};

export default nextConfig;
