import type { MetadataRoute } from "next";
import { PRODUCTS, allOpeningTypes, openingTypeSlug } from "@/lib/products";
import { PROJECTS } from "@/lib/projects";
import { POSTS } from "@/lib/insights";
import { packOnFile } from "@/lib/downloads-server";
import { SITE_URL } from "@/lib/seo";

// Date of the last content pass across the static pages and catalogue data.
const UPDATED = new Date("2026-09-29");

type Entry = MetadataRoute.Sitemap[number];
const entry = (path: string, priority: number, changeFrequency: Entry["changeFrequency"] = "monthly", lastModified = UPDATED): Entry => ({
  url: `${SITE_URL}${path}`,
  lastModified,
  changeFrequency,
  priority,
});

export default function sitemap(): MetadataRoute.Sitemap {
  const core = [
    entry("", 1, "weekly"),
    entry("/products", 0.9, "weekly"),
    ...["windows", "doors", "sliding", "facades"].map((t) => entry(`/products/${t}`, 0.9, "weekly")),
    entry("/certifications", 0.8),
    entry("/projects", 0.8),
    entry("/products/finder", 0.7),
    entry("/testing", 0.7),
    entry("/about", 0.7),
    entry("/faq", 0.7),
    entry("/contact", 0.7),
    entry("/insights", 0.7, "weekly"),
    entry("/downloads", 0.6),
    entry("/catalogue", 0.6),
    entry("/catalogue/technical", 0.6),
  ];

  const systems = PRODUCTS.map((s) => entry(`/products/system/${s.slug}`, 0.8));

  // Same slugs /products/openings/[type] generates.
  const openings = allOpeningTypes().map((t) => entry(`/products/openings/${openingTypeSlug(t)}`, 0.5));

  const projects = PROJECTS.map((p) => entry(`/projects/${p.slug}`, 0.6, "yearly"));

  // Only system packs with at least one document on file; empty packs are noindex.
  const downloads = PRODUCTS.filter((s) => packOnFile(s).length > 0).map((s) => entry(`/downloads/${s.slug}`, 0.5));

  const posts = POSTS.map((p) => entry(`/insights/${p.slug}`, 0.6, "monthly", new Date(p.date)));

  return [...core, ...systems, ...openings, ...projects, ...downloads, ...posts];
}
