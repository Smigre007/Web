import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/env";

const APP_URL = getPublicAppUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/projects", "/settings", "/api/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
