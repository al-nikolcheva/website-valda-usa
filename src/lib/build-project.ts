// "Build your project": location → wind/climate zone → recommended systems, the opening
// kinds a visitor can configure, and the colour ranges they can pick from.
//
// Zones are indicative, read from the state and county only. The governing requirement
// is set by the local building department and the site address (exposure category,
// ultimate wind speed, distance to the coast), so every result says we confirm it.

import { PRODUCTS, navGroups, type NavGroup, type ProductSystem } from "@/lib/products";
import { SYSTEM_FINISHES } from "@/lib/finishes";

/* ───────────────────────── location & zones ───────────────────────── */

export type ZoneKey = "hvhz" | "impact" | "tdi" | "coastal" | "cold" | "standard";

export type Zone = {
  key: ZoneKey;
  label: string;
  headline: string;
  detail: string;
  /** what the openings must carry, in plain words */
  requirement: string;
};

export const ZONES: Record<ZoneKey, Zone> = {
  hvhz: {
    key: "hvhz",
    label: "High-Velocity Hurricane Zone",
    headline: "HVHZ. Large-missile impact required.",
    detail:
      "Miami-Dade and Broward sit in the High-Velocity Hurricane Zone, the strictest wind code in the US. Every window and door needs a Florida Product Approval for the HVHZ, tested to large-missile impact and cyclic pressure.",
    requirement: "Florida Product Approval, HVHZ, large-missile impact",
  },
  impact: {
    key: "impact",
    label: "Florida wind-borne debris region",
    headline: "Florida. Impact-rated openings.",
    detail:
      "Most of Florida falls in the wind-borne debris region. Openings need a Florida Product Approval and impact-rated glazing (or separate shutters). We pick systems approved for your design pressure.",
    requirement: "Florida Product Approval, impact rated",
  },
  tdi: {
    key: "tdi",
    label: "Texas windstorm area (TDI)",
    headline: "Texas coast. Windstorm-certified openings.",
    detail:
      "This is one of the 14 coastal counties (plus part of Harris) the Texas Department of Insurance treats as a designated catastrophe area. Windows and doors must meet the windstorm code and be certified for the site, which usually means impact-rated glazing.",
    requirement: "TDI windstorm certification, impact rated",
  },
  coastal: {
    key: "coastal",
    label: "Hurricane coast",
    headline: "Hurricane coast. Impact recommended.",
    detail:
      "Coastal counties in hurricane-prone states usually fall inside a wind-borne debris region. Impact-rated windows and doors protect the envelope without shutters. Inland sites may only need standard ratings, so we confirm against your address.",
    requirement: "Impact rated near the coast, design pressure to your site",
  },
  cold: {
    key: "cold",
    label: "Cold climate",
    headline: "Cold climate. Insulation first.",
    detail:
      "Long heating seasons make thermal performance the priority. Multi-chamber PVC and thermally broken aluminum with triple glazing keep U-values low and stop condensation on the frame.",
    requirement: "Low U-value, triple glazing, tight air seal",
  },
  standard: {
    key: "standard",
    label: "Standard",
    headline: "No impact requirement.",
    detail:
      "Your area has no wind-borne debris requirement, so you can choose on look, performance and budget. Every system still ships with tested air, water and structural ratings.",
    requirement: "Tested air, water and structural ratings",
  },
};

/** State FIPS codes on the Gulf and Atlantic hurricane coast (plus Hawaii). */
const HURRICANE_STATES = new Set(["48", "22", "28", "01", "13", "45", "37", "51", "24", "10", "34", "36", "09", "44", "25", "15"]);
/** States where heating dominates. */
const COLD_STATES = new Set(["27", "38", "46", "55", "26", "23", "50", "33", "30", "56", "02", "16", "19", "31", "08", "17", "18", "39", "42", "53", "41"]);
/** Florida counties in the High-Velocity Hurricane Zone: Miami-Dade and Broward. */
const HVHZ_COUNTIES = new Set(["12086", "12011"]);
/** Texas Department of Insurance designated catastrophe area: 14 coastal counties, plus part of Harris. */
const TDI_COUNTIES = new Set(["48007", "48039", "48057", "48061", "48071", "48167", "48245", "48261", "48273", "48321", "48355", "48391", "48409", "48489", "48201"]);
const FLORIDA = "12";

/** Per-county data from scripts/build-county-codes.py (public/geo/codes.json). */
export type CountyCode = { cz?: string; ba?: string; coast?: 1 };

let codes: Promise<Record<string, CountyCode>> | null = null;
export function loadCountyCodes() {
  codes ??= fetch("/geo/codes.json").then((r) => r.json()).catch(() => ({}));
  return codes;
}

export function zoneFor(stateId: string, countyId?: string | null, code?: CountyCode): Zone {
  if (countyId && HVHZ_COUNTIES.has(countyId)) return ZONES.hvhz;
  if (stateId === FLORIDA) return ZONES.impact;
  if (countyId && TDI_COUNTIES.has(countyId)) return ZONES.tdi;
  if (countyId && code) {
    if (code.coast) return ZONES.coastal;
    const cz = parseInt(code.cz ?? "", 10);
    return cz >= 5 ? ZONES.cold : ZONES.standard;
  }
  if (HURRICANE_STATES.has(stateId)) return ZONES.coastal;
  if (COLD_STATES.has(stateId)) return ZONES.cold;
  return ZONES.standard;
}

/** Zone of one county for the map tint. */
export function countyZone(countyId: string, code?: CountyCode): ZoneKey {
  return zoneFor(countyId.slice(0, 2), countyId, code).key;
}

/** 2021 IECC residential prescriptive limits for windows and glazed doors (Table R402.1.3). */
export function energyFor(cz?: string): { zone: string; u: string; shgc: string } | null {
  if (!cz) return null;
  const n = parseInt(cz, 10);
  const marine = cz.endsWith("C");
  const u = n <= 1 ? "0.50" : n === 2 ? "0.40" : "0.30";
  const shgc = n <= 3 ? "0.25" : n === 4 && !marine ? "0.40" : "no limit";
  return { zone: cz, u, shgc };
}

/** Zone of a state as a whole, used to tint the national map. */
export function stateZone(stateId: string): ZoneKey {
  if (stateId === FLORIDA) return "impact";
  return zoneFor(stateId).key;
}

export function isTdiCounty(countyId: string) {
  return TDI_COUNTIES.has(countyId);
}

export function isHvhzCounty(countyId: string) {
  return HVHZ_COUNTIES.has(countyId);
}

/* ───────────────────────── recommendations ───────────────────────── */

export type Material = "Aluminum" | "PVC";
export type MaterialPref = Material | "any";

export const materialOf = (s: ProductSystem): Material =>
  /pvc|vinyl/i.test(s.category) || s.brand === "Kömmerling" ? "PVC" : "Aluminum";

const THERMAL = new Set(["series-88", "vision", "vision-guard", "series-76-md", "series-76-md-hadk-hadkz", "masterline-10", "masterline-8", "conceptsystem-77"]);

export type Pick = { system: ProductSystem; reason: string };

/** Up to `n` systems for one product group in one zone, best first. Empty means no
 *  certified system covers it off the shelf (e.g. a curtain wall in the HVHZ). */
export function recommend(zone: ZoneKey, group: NavGroup, pref: MaterialPref, n = 2): Pick[] {
  const pool = PRODUCTS.filter((s) => navGroups(s).includes(group)).filter((s) => {
    if (zone === "hvhz") return s.hvhz;
    if (zone === "impact" || zone === "coastal" || zone === "tdi") return !!s.impact;
    return true;
  });
  return pool
    .map((s) => {
      let score = 0;
      const m = materialOf(s);
      if (pref !== "any") score += m === pref ? 3 : -2;
      if (zone === "hvhz" && s.brand === "Valda") score += 1.5; // approvals in VALDA's own name
      if (zone === "cold") score += (THERMAL.has(s.slug) ? 2 : 0) + (m === "PVC" ? 1 : 0);
      if (zone === "standard") score += s.impact ? -1 : 1; // no need to pay for impact glass
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ s }) => ({ system: s, reason: reasonFor(zone, s) }));
}

function reasonFor(zone: ZoneKey, s: ProductSystem): string {
  if (zone === "hvhz") return "Approved for the HVHZ";
  if (zone === "impact") return s.hvhz ? "Impact rated, HVHZ approved" : "Impact rated, Florida approved";
  if (zone === "coastal") return "Impact rated for the coast";
  if (zone === "tdi") return "Impact rated for the Texas coast";
  if (zone === "cold") return THERMAL.has(s.slug) ? "High insulation" : "Thermally broken";
  return s.impact ? "Impact rated" : "Great value, fully tested";
}

/* ───────────────────────── openings ───────────────────────── */

export type OpeningKind = "window" | "door" | "sliding" | "facade";

export const KIND_GROUP: Record<OpeningKind, NavGroup> = {
  window: "Windows",
  door: "Doors",
  sliding: "Sliding & Folding",
  facade: "Facades",
};

export const KIND_LABEL: Record<OpeningKind, string> = {
  window: "Windows",
  door: "Entry doors",
  sliding: "Sliding doors",
  facade: "Curtain wall bays",
};

export const STYLES: Record<OpeningKind, string[]> = {
  window: ["Tilt & turn", "Casement", "Fixed", "Awning"],
  door: ["Single entry", "Double entry"],
  sliding: ["2-panel XO", "4-panel OXXO", "Lift & slide"],
  facade: ["Curtain wall"],
};

export type BuildingType = "house" | "building";

export type Counts = Record<OpeningKind, number>;

export const DEFAULT_COUNTS: Record<BuildingType, Counts> = {
  house: { window: 12, door: 1, sliding: 1, facade: 0 },
  building: { window: 40, door: 2, sliding: 0, facade: 12 },
};

export const MAX_COUNTS: Record<BuildingType, Counts> = {
  house: { window: 60, door: 6, sliding: 6, facade: 0 },
  building: { window: 400, door: 12, sliding: 60, facade: 200 },
};

/* ───────────────────────── finishes ───────────────────────── */

export type Swatch = { name: string; hex: string; ral?: string; wood?: boolean };

const ALUMINUM: Swatch[] = [
  { name: "Traffic White", ral: "RAL 9016", hex: "#F1F0EA" },
  { name: "Anthracite Grey", ral: "RAL 7016", hex: "#31373B" },
  { name: "Jet Black", ral: "RAL 9005", hex: "#121212" },
  { name: "Black Grey", ral: "RAL 7021", hex: "#2B2E30" },
  { name: "Window Grey", ral: "RAL 7040", hex: "#9EA3A5" },
  { name: "White Aluminium", ral: "RAL 9006", hex: "#A5A8A6" },
  { name: "Champagne", hex: "#A6A182" },
  { name: "Bronze", hex: "#5B4636" },
  { name: "Golden Oak", hex: "#8A5A2B", wood: true },
  { name: "Walnut", hex: "#4A3222", wood: true },
];

const PVC: Swatch[] = SYSTEM_FINISHES["76md"].groups.flatMap((g) =>
  g.finishes.map((f) => ({ name: f.name, hex: f.hex, ral: f.ral, wood: f.kind === "Woodgrain" })),
);

export function swatchesFor(material: Material): Swatch[] {
  return material === "PVC" ? PVC : ALUMINUM;
}

export const GLASS: { name: string; hex: string; opacity: number }[] = [
  { name: "Clear low-E", hex: "#cfe3ee", opacity: 0.32 },
  { name: "Grey tint", hex: "#5d6468", opacity: 0.55 },
  { name: "Bronze tint", hex: "#7a6250", opacity: 0.5 },
  { name: "Blue reflective", hex: "#3d6b8f", opacity: 0.6 },
];

/* ───────────────────────── the configured opening ───────────────────────── */

export type OpeningSpec = {
  id: string;
  kind: OpeningKind;
  style: string;
  color: string; // exterior swatch name
  interior: string; // interior swatch name
  glass: string;
};
