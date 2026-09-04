import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://valdagroup.com/sitemap.xml",
    host: "https://valdagroup.com",
  };
}
