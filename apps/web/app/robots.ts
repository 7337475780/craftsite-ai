import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/share", "/pricing"],
      disallow: ["/dashboard", "/projects", "/generate", "/settings", "/billing", "/usage"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
