import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
    "@tensor-oss/tcomp-sdk",
  ],
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
