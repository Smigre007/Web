import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://neurocode.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: APP_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${APP_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
