import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/sepet", "/teklif-iste", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL || undefined,
  };
}
