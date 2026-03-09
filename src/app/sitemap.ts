import { MetadataRoute } from "next";

const siteUrl = "https://the-chimpions-two.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/the-treehouse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/the-dao`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/validator`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/chimp-swap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/nft-gallery`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
    { url: `${siteUrl}/our-holders`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${siteUrl}/treehouse-capital`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
