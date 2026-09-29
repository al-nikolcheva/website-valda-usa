import type { Metadata } from "next";
import type { ProductSystem } from "@/lib/products";
import { navGroup } from "@/lib/products";

export const SITE_URL = "https://valdagroup.com";

// Search indexing is off unless ALLOW_INDEXING=1 is set in the hosting environment.
// Turn it on only once the site is served from its real domain.
export const INDEXABLE = process.env.ALLOW_INDEXING === "1";

/** Default share image: the homepage hero project (Juneau Village, Milwaukee). */
export const DEFAULT_OG = "/images/project-milwaukee-1.jpg";

/** Absolute URL for a site path (JSON-LD needs absolute URLs; metadata resolves via metadataBase). */
export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path === "/" ? "" : path}`);

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
};

/** Per-page metadata: own canonical, own OG url, share image, large Twitter card. */
export function pageMeta({ title, description, path, image, imageAlt, type = "website" }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title,
      description,
      siteName: "VALDA",
      images: [{ url: image ?? DEFAULT_OG, alt: imageAlt ?? title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

/** BreadcrumbList from [name, path] pairs. */
export function breadcrumbLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

/* ── Product system helpers (all built from the catalogue data) ── */

// Catalogue strings may carry em-dashes; never surface them.
export const noDash = (t: string) => t.replace(/\s*—\s*/g, " ").replace(/\s{2,}/g, " ").trim();

export function systemMaterial(s: ProductSystem): "Aluminum" | "PVC" {
  if (s.brand === "Reynaers") return "Aluminum";
  if (s.brand === "Kömmerling") return "PVC";
  return /pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminum";
}

/** What the system is, e.g. "Window", "Lift & slide door", "Curtain wall". */
export function systemKind(s: ProductSystem): string {
  if (!/pvc|vinyl|alumin/i.test(s.category)) return s.category;
  const types = s.openingTypes.join(" ").toLowerCase();
  const group = navGroup(s);
  if (/lift.*slide/.test(types)) return "Lift & slide door";
  if (group === "Sliding & Folding") return "Sliding door";
  if (group === "Doors") return /entry/.test(types) ? "Entry door" : "Door";
  if (group === "Facades") return "Facade";
  return "Window";
}

const titleCase = (t: string) => t.replace(/\b[a-z]/g, (c) => c.toUpperCase());

export const brandLabel = (s: ProductSystem) => (s.brand === "Valda" ? "VALDA" : s.brand);

/** Keyword-led title, e.g. "Vista Guard Aluminum Impact Window". */
export function systemTitle(s: ProductSystem): string {
  return `${noDash(s.name)} ${systemMaterial(s)} ${s.impact ? "Impact " : ""}${titleCase(systemKind(s))}`;
}

/** Rated design pressure from the catalogue summary (e.g. "±65 psf" or "Class AW-PG70"). */
function ratedPressure(s: ProductSystem): string | null {
  const raw = s.summary.designPressure;
  if (!raw) return null;
  const segs = raw.split("·").filter((seg) => /psf/i.test(seg) && !/downsized|overload/i.test(seg));
  const nums = segs.flatMap((seg) => [...seg.matchAll(/[±+](\d+(?:\.\d+)?)/g)].map((m) => parseFloat(m[1])));
  if (nums.length) {
    const upTo = new Set(nums).size > 1 || /^up to/i.test(raw);
    return `${upTo ? "up to " : ""}±${Math.max(...nums)} psf`;
  }
  const cls = raw.match(/\b(?:[A-Z]{1,2}-)?PG\d+/);
  if (!cls) return null;
  return cls[0].includes("-") ? `Class ${cls[0]}` : cls[0];
}

/** ~150 character description built only from the system's catalogue data. */
export function systemDescription(s: ProductSystem): string {
  const material = systemMaterial(s) === "PVC" ? "PVC (vinyl)" : "aluminum";
  const kind = systemKind(s).toLowerCase().replace(/&/g, "and");
  const lead = `${noDash(s.name)} is a ${brandLabel(s)} ${material} ${s.impact ? "hurricane impact " : ""}${kind}`;
  const hasTt = s.openingTypes.some((t) => /tilt/i.test(t));

  const approval = s.flNumbers.length
    ? s.hvhz
      ? "with Florida Product Approval inside and outside the HVHZ"
      : "with Florida Product Approval"
    : /AAMA/.test(s.certification)
      ? "tested to AAMA/WDMA/CSA standards"
      : null;
  const dp = ratedPressure(s);
  const rated = dp ? (/psf/.test(dp) ? `rated ${dp}` : `certified to ${dp}`) : null;
  const tt = hasTt && !/tilt/i.test(kind) ? "in tilt and turn" : null;

  const closings = ["Made in Europe for projects across the USA.", "Made in Europe for the USA.", ""];
  const middles = [
    [tt, approval, rated],
    [approval, rated],
    [tt, approval],
    [approval],
    [rated],
    [],
  ].map((parts) => parts.filter(Boolean) as string[]);

  for (const mid of middles) {
    for (const close of closings) {
      const body = [lead, ...mid].join(", ").replace(/, (with|in) /g, " $1 ");
      const out = `${body}.${close ? ` ${close}` : ""}`;
      if (out.length <= 158) return out;
    }
  }
  return `${lead}.`;
}
