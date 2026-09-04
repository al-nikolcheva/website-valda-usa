import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { POSTS } from "@/lib/insights";

const BASE = "https://valdagroup.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/products",
    "/products/finder",
    "/products/windows",
    "/products/doors",
    "/products/sliding",
    "/products/facades",
    "/projects",
    "/about",
    "/insights",
    "/catalogue",
    "/faq",
    "/contact",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date("2026-08-26"),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const systemPages = PRODUCTS.map((s) => ({
    url: `${BASE}/products/system/${s.slug}`,
    lastModified: new Date("2026-08-26"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const postPages = POSTS.map((p) => ({
    url: `${BASE}/insights/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...systemPages, ...postPages];
}
