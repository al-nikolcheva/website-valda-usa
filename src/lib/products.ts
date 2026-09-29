// Single source of truth for product data. Generated from the Valda Product Data
// 2026 workbooks (see 06 Integration Spec). Do NOT hand-edit valda-products.json —
// regenerate it from the workbooks so the site and the source never drift.
//
// The six data rules that travel with the file (meta.rules) are enforced by the
// rendering code, not here:
//   1. Never merge held='florida-approval' with held='aama-tested'.
//   2. Never render an absent uFactor / soundStcOitc — print thermalNote instead.
//   3. waterResistance shows wherever designPressure shows.
//   4. hvhz is per opening.
//   5. system-level designPressure reads "up to …".
//   6. absent field = omit; never render a dash, N/A or 0.

import data from "@/data/valda-products.json";

export type Brand = "Reynaers" | "Valda" | "Kömmerling";
export type Held = "florida-approval" | "aama-tested";
export type NavGroup = "Windows" | "Doors" | "Sliding & Folding" | "Facades";

export interface Opening {
  opening: string;
  held: Held;
  heldLabel: string;
  approval?: string;
  impact?: string; // absent = non-impact
  hvhz?: boolean;
  designPressure?: string;
  structuralTest?: string;
  waterResistance?: string;
  airInfiltration?: string;
  forcedEntry?: string;
  waterLimited?: boolean;
  testedSize?: string;
  sashSize?: string;
  glass?: string;
  profiles?: string;
  testReport?: string;
  certificate?: string;
}

export interface SystemSummary {
  designPressure?: string;
  largestOpening?: string;
  waterResistance?: string;
  waterLimited?: boolean;
  uFactor?: string; // Reynaers manufacturer data only
  soundStcOitc?: string; // Reynaers manufacturer data only
}

export interface ProductSystem {
  slug: string;
  name: string;
  brand: Brand;
  category: string;
  certification: string;
  flNumbers: string[];
  impact?: string; // absent = non-impact
  hvhz: boolean;
  summary: SystemSummary;
  thermalNote?: string; // present only when no thermal test exists
  openingTypes: string[];
  copy: { headline: string; paragraph: string; points: string[] };
  images: { folder: string; hasImages: boolean; cutImage: string | null };
  openingCount: number;
  openings: Opening[];
}

export interface ProductMeta {
  source: string;
  built: string;
  systems: number;
  openings: number;
  rules: string[];
}

const DATA = data as unknown as { meta: ProductMeta; systems: ProductSystem[] };

// Some systems in the source are the same physical product split into a
// Florida-approval block and an AAMA-tested block. Fold the source into the
// target so one page shows both cert blocks (kept separate by the held grouping).
const MERGE_INTO: Record<string, string> = {
  "conceptsystem-68": "conceptsystem-77", // CS 68 is the AAMA block of CS 77
};

function buildProducts(raw: ProductSystem[]): ProductSystem[] {
  const clones = raw.map((s) => ({ ...s, openings: [...s.openings], openingTypes: [...s.openingTypes], flNumbers: [...s.flNumbers] }));
  const bySlug = new Map(clones.map((s) => [s.slug, s]));
  const key = (o: Opening) => `${o.opening}|${o.approval ?? ""}|${o.held}`;
  for (const [src, tgt] of Object.entries(MERGE_INTO)) {
    const s = bySlug.get(src);
    const t = bySlug.get(tgt);
    if (!s || !t) continue;
    const seen = new Set(t.openings.map(key)); // skip identical rows so nothing doubles
    for (const o of s.openings) if (!seen.has(key(o))) { t.openings.push(o); seen.add(key(o)); }
    // NOTE: openingTypes are deliberately NOT merged — they drive nav categorisation,
    // and the target keeps its own identity (a window system stays a window even if the
    // merged cert block happens to include a door test). The openings themselves merge.
    t.flNumbers = [...new Set([...t.flNumbers, ...s.flNumbers])];
    t.openingCount = t.openings.length;
  }
  return clones.filter((s) => !MERGE_INTO[s.slug]);
}

export const PRODUCTS: ProductSystem[] = buildProducts(DATA.systems);
export const PRODUCT_META: ProductMeta = DATA.meta;

/** Slugs merged away — used for redirects. */
export const MERGED_SLUGS: Record<string, string> = MERGE_INTO;

export function getSystem(slug: string): ProductSystem | undefined {
  return PRODUCTS.find((s) => s.slug === slug);
}

// Section-cut renders exported to /public/products. Kept here rather than
// hand-edited into valda-products.json (the JSON regenerates from the workbooks).
// The rest still fall back to a placeholder until their cuts are exported/resized.
const CUT_IMAGES: Record<string, string> = {
  "conceptsystem-77": "/products/conceptsystem-77.png",
  "masterline-8": "/products/masterline-8.png",
  "slimline-38": "/products/slimline-38.png",
  "conceptpatio-155": "/products/conceptpatio-155.png",
  "conceptwall-50": "/products/conceptwall-50.png",
  masterpatio: "/products/masterpatio.webp",
  "masterline-10": "/products/masterline-10.webp",
  "hi-finity": "/products/hi-finity.webp",
  "slimpatio-68": "/products/slimpatio-68.webp",
  "conceptpatio-68": "/products/conceptpatio-68.webp",
  "conceptfolding-77": "/products/conceptfolding-77.webp",
  masterwall: "/products/masterwall.webp",
  "vista-guard": "/products/vista-guard.png",
  "vision-guard": "/products/vision-guard.png",
  vision: "/products/vision.png",
  "series-76-md": "/products/series-76-md.jpg",
  "series-76-md-hadk-hadkz": "/products/series-76-md-hadk-hadkz.jpg",
  "series-76-ad": "/products/series-76-ad.jpg",
  "premidoor-88": "/products/premidoor-88.jpg",
  "series-88": "/products/series-88.jpg",
  "premislide-76": "/products/premislide-76.jpg",
};

export function cutImage(slug: string): string | null {
  return CUT_IMAGES[slug] ?? getSystem(slug)?.images.cutImage ?? null;
}

// Interactive 3D profile models exported to /public/models.
const SYSTEM_MODELS: Record<string, string> = {
  "series-76-md": "/models/76md.glb",
  "vista-guard": "/models/vista-guard.glb",
};

export function systemModel(slug: string): string | null {
  return SYSTEM_MODELS[slug] ?? null;
}

export const allProductSlugs = (): string[] => PRODUCTS.map((s) => s.slug);

export const NAV_GROUPS: NavGroup[] = ["Windows", "Doors", "Sliding & Folding", "Facades"];

// Which bucket a single opening type belongs to (used only for material-named
// categories where the type is the reliable signal — a door is a door whatever
// the profile is made of).
export function groupOfType(t: string): NavGroup {
  const x = t.toLowerCase();
  if (/lift.*slide|slid|fold|bi.?fold/.test(x)) return "Sliding & Folding";
  if (/door|entry|balcony|hinged|terrace|swing|sidelite/.test(x)) return "Doors";
  return "Windows"; // fixed, picture, casement, tilt & turn, awning, hopper, dual action
}

/** Restrict a system to just the openings/types that belong to one nav group —
 *  e.g. a window-and-door system viewed from the Doors category shows only doors. */
export function systemInGroup(s: ProductSystem, group: NavGroup): ProductSystem {
  return {
    ...s,
    openings: s.openings.filter((o) => groupOfType(o.opening) === group),
    openingTypes: s.openingTypes.filter((t) => groupOfType(t) === group),
  };
}

export function isNavGroup(v: string | undefined): v is NavGroup {
  return !!v && (NAV_GROUPS as string[]).includes(v);
}

/** Every category a system genuinely serves. A curtain wall is only a facade and
 *  a slider is only sliding (a generic "fixed" light shouldn't drag them into
 *  Windows); a window-and-door system appears under both Windows and Doors. */
export function navGroups(s: ProductSystem): NavGroup[] {
  const c = s.category.toLowerCase();
  // Explicit type categories are authoritative and single-purpose.
  if (/curtain|window wall/.test(c)) return ["Facades"];
  if (/slid|lift|fold/.test(c)) return ["Sliding & Folding"];
  // Window / door / material categories: read the opening types, and honour an
  // explicit door/window word in the category too.
  const set = new Set<NavGroup>();
  for (const t of s.openingTypes) set.add(groupOfType(t));
  if (c.includes("door")) set.add("Doors");
  if (c.includes("window")) set.add("Windows");
  if (set.size === 0) set.add("Windows");
  return NAV_GROUPS.filter((g) => set.has(g));
}

/** Primary bucket, used where a system needs a single home (e.g. the hero image). */
export function navGroup(s: ProductSystem): NavGroup {
  return navGroups(s)[0] ?? "Windows";
}

export function systemsByGroup(group: NavGroup): ProductSystem[] {
  return PRODUCTS.filter((s) => navGroups(s).includes(group));
}

/** Rule 1: Florida-approval and AAMA-tested openings never share a list. Returns the
 *  system's openings split first by impact (rated vs non-impact), then by held type. */
export function groupedOpenings(s: ProductSystem) {
  const impact = s.openings.filter((o) => o.impact);
  const nonImpact = s.openings.filter((o) => !o.impact);
  const byHeld = (list: Opening[]) => ({
    florida: list.filter((o) => o.held === "florida-approval"),
    aama: list.filter((o) => o.held === "aama-tested"),
  });
  return { impact: byHeld(impact), nonImpact: byHeld(nonImpact), impactCount: impact.length, nonImpactCount: nonImpact.length };
}

/** True if any opening on the system has no water rating (Rule: warning chip + note). */
export function hasWaterLimited(s: ProductSystem): boolean {
  return s.openings.some((o) => o.waterLimited);
}

/** Every distinct opening type across all systems (for /products/openings/[type]). */
export function allOpeningTypes(): string[] {
  const set = new Set<string>();
  PRODUCTS.forEach((s) => s.openingTypes.forEach((t) => set.add(t)));
  return [...set].sort();
}

export const openingTypeSlug = (t: string) =>
  t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function systemsWithOpeningType(typeSlug: string): ProductSystem[] {
  return PRODUCTS.filter((s) => s.openingTypes.some((t) => openingTypeSlug(t) === typeSlug));
}

/** Flatten every FL number → the systems that carry it (for the approvals index). */
export function floridaApprovals(): { fl: string; systems: ProductSystem[] }[] {
  const map = new Map<string, ProductSystem[]>();
  PRODUCTS.forEach((s) => s.flNumbers.forEach((fl) => map.set(fl, [...(map.get(fl) ?? []), s])));
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([fl, systems]) => ({ fl, systems }));
}
