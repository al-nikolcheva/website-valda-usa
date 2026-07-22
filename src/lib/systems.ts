export type Category = "Windows" | "Doors" | "Sliding & Folding" | "Facades";

export type Approval = {
  config: string;
  fl: string;
  hvhz: boolean;
  impact: string;
  dp?: string;
  max?: string;
};

export type System = {
  slug: string;
  family: FamilySlug;
  name: string;
  material: "Aluminium" | "PVC";
  profile: string;
  categories: Category[];
  hvhz: "Yes" | "No" | "Both";
  impact: string;
  summary: string;
  approvals: Approval[];
};

export type FamilySlug = "valda" | "reynaers" | "koemmerling";

export const FAMILIES: {
  slug: FamilySlug;
  brand: string;
  label: string;
  kind: string;
  material: string;
  holder: string;
  blurb: string;
}[] = [
  {
    slug: "valda",
    brand: "VALDA",
    label: "VALDA Proprietary",
    kind: "Proprietary",
    material: "Aluminium + PVC",
    holder: "VALDA 90 OOD",
    blurb:
      "Systems designed and manufactured by VALDA for the US market, with Florida Product Approvals (FL39801, FL39802) held in VALDA's own name. Impact-rated HVHZ and non-impact configurations on Etem aluminium and Deceuninck PVC profiles.",
  },
  {
    slug: "reynaers",
    brand: "Reynaers",
    label: "Reynaers Systems",
    kind: "Partner system",
    material: "Aluminium",
    holder: "Reynaers",
    blurb:
      "Aluminium windows, doors, sliding glass, curtain wall and lift & slide. Florida Product Approvals held by Reynaers; supplied and installed by VALDA. Impact-rated WZ3 and HVHZ, plus NAMI-tested non-impact configurations.",
  },
  {
    slug: "koemmerling",
    brand: "Kömmerling",
    label: "Kömmerling Systems",
    kind: "Partner system",
    material: "PVC",
    holder: "Kömmerling USA Inc.",
    blurb:
      "German PVC profile systems. Florida Product Approvals held by Kömmerling USA Inc.; supplied and installed by VALDA. HVHZ impact-rated and non-impact windows, doors and sliding systems.",
  },
];

export const SYSTEMS: System[] = [
  {
    slug: "vista-guard",
    family: "valda",
    name: "Vista / Vista Guard",
    material: "Aluminium",
    profile: "Etem E75",
    categories: ["Windows"],
    hvhz: "Yes",
    impact: "Large Missile",
    summary:
      "Proprietary aluminium window system. Vista Guard is large-missile impact certified for HVHZ coastal projects; Vista covers non-impact regions.",
    approvals: [
      { config: "Fixed / Picture", fl: "FL39802-R2", hvhz: true, impact: "Large Missile", dp: "±65 psf", max: "59 × 98.38 in" },
      { config: "Tilt & Turn", fl: "FL39801-R2", hvhz: true, impact: "Large Missile", dp: "±65 psf", max: "48 × 78 in" },
    ],
  },
  {
    slug: "vision-guard",
    family: "valda",
    name: "Vision / Vision Guard",
    material: "PVC",
    profile: "Deceuninck Legend",
    categories: ["Windows"],
    hvhz: "Both",
    impact: "Large Missile",
    summary:
      "Proprietary PVC window system on Deceuninck Legend. SentryGlas laminated impact glazing for HVHZ, with non-impact single and double tilt & turn variants.",
    approvals: [
      { config: "Vision Guard — Fixed / Picture", fl: "FL39802-R2", hvhz: true, impact: "Large Missile", dp: "±65 psf", max: "59 × 98 in" },
      { config: "Vision Guard — Tilt & Turn", fl: "FL39801-R2", hvhz: true, impact: "Large Missile", dp: "±65 psf", max: "48 × 78 in" },
      { config: "Vision — Fixed / Picture", fl: "FL39802-R2", hvhz: false, impact: "Non-Impact", dp: "±65 psf", max: "59 × 98 in" },
      { config: "Vision — Tilt & Turn (Single)", fl: "FL39801-R2", hvhz: false, impact: "Non-Impact", dp: "±65 psf", max: "48 × 78 in" },
      { config: "Vision — Tilt & Turn (Double)", fl: "FL39801-R2", hvhz: false, impact: "Non-Impact", dp: "±50 psf", max: "96 × 78 in" },
    ],
  },
  {
    slug: "masterline-8",
    family: "reynaers",
    name: "MasterLine 8",
    material: "Aluminium",
    profile: "Aluminium 6060-T66",
    categories: ["Windows", "Doors"],
    hvhz: "No",
    impact: "WZ3 Impact",
    summary:
      "Aluminium window and door platform, impact-rated for Wind Zone 3 outside HVHZ. Fixed, tilt & turn, casement, awning, plus entrance and terrace doors.",
    approvals: [
      { config: "Fixed Window", fl: "FL47832", hvhz: false, impact: "WZ3 Impact" },
      { config: "Tilt & Turn / Turn & Tilt", fl: "FL47833", hvhz: false, impact: "WZ3 Impact" },
      { config: "Casement", fl: "FL47834", hvhz: false, impact: "WZ3 Impact" },
      { config: "Awning", fl: "FL47835", hvhz: false, impact: "WZ3 Impact" },
      { config: "Entrance Door (Side Hinged)", fl: "FL47836", hvhz: false, impact: "WZ3 Impact" },
      { config: "Terrace Door (Side Hinged)", fl: "FL47836", hvhz: false, impact: "WZ3 Impact" },
    ],
  },
  {
    slug: "cs-77",
    family: "reynaers",
    name: "CS 77",
    material: "Aluminium",
    profile: "Aluminium",
    categories: ["Windows"],
    hvhz: "Both",
    impact: "Large & Small Missile",
    summary:
      "Impact-rated aluminium window system approved inside and outside HVHZ. Fixed, casement, and tilt & turn configurations to ±65 psf.",
    approvals: [
      { config: "Fixed (Standard)", fl: "FL28671-R3", hvhz: false, impact: "L&S Missile", dp: "±65 psf", max: "94.5 × 141.75 in" },
      { config: "Fixed (HVHZ)", fl: "FL28671-R3", hvhz: true, impact: "L&S Missile", dp: "±65 psf", max: "94.5 × 141.75 in" },
      { config: "Casement (Standard)", fl: "FL28672-R3", hvhz: false, impact: "L&S Missile", dp: "±65 psf", max: "48 × 96.44 in" },
      { config: "Casement (HVHZ)", fl: "FL28672-R3", hvhz: true, impact: "L&S Missile", dp: "±65 psf", max: "48 × 96.44 in" },
      { config: "Tilt & Turn (Standard)", fl: "FL38158-R1", hvhz: false, impact: "L&S Missile", dp: "±65 psf", max: "48 × 96.44 in" },
      { config: "Tilt & Turn (HVHZ)", fl: "FL38158-R1", hvhz: true, impact: "L&S Missile", dp: "±65 psf", max: "48 × 96.44 in" },
    ],
  },
  {
    slug: "cp-155",
    family: "reynaers",
    name: "CP 155 Lift & Slide",
    material: "Aluminium",
    profile: "Aluminium",
    categories: ["Sliding & Folding"],
    hvhz: "Yes",
    impact: "Large Missile",
    summary:
      "Large-missile impact-rated aluminium lift & slide door, HVHZ approved to ±65 psf. Multi-track configurations for wide openings.",
    approvals: [
      { config: "Lift & Slide (XO / multi-track)", fl: "FL39164-R1", hvhz: true, impact: "Large Missile", dp: "+65 / -65 psf" },
    ],
  },
  {
    slug: "masterpatio",
    family: "reynaers",
    name: "MasterPatio",
    material: "Aluminium",
    profile: "Aluminium 6060-T66",
    categories: ["Sliding & Folding"],
    hvhz: "No",
    impact: "WZ3 Impact",
    summary:
      "Aluminium sliding glass door assembly, Wind Zone 3 impact-rated. No additional impact covering required in WZ3 or less.",
    approvals: [
      { config: "Sliding Glass Door", fl: "FL47837", hvhz: false, impact: "WZ3 Impact" },
    ],
  },
  {
    slug: "conceptwall-50",
    family: "reynaers",
    name: "ConceptWall 50",
    material: "Aluminium",
    profile: "Aluminium 6060-T66",
    categories: ["Facades"],
    hvhz: "No",
    impact: "WZ3 Impact",
    summary:
      "Curtain wall / panel wall system, wind-borne debris compliant per Chapter 16 FBC. Impact-rated for Wind Zone 3 outside HVHZ.",
    approvals: [
      { config: "Curtain Wall (Panel Wall)", fl: "FL47838", hvhz: false, impact: "WZ3 Impact" },
    ],
  },
  {
    slug: "76md",
    family: "koemmerling",
    name: "76MD Windows & Doors",
    material: "PVC",
    profile: "Kömmerling 76MD / 76AD",
    categories: ["Windows", "Doors"],
    hvhz: "Both",
    impact: "Large Missile",
    summary:
      "PVC dual-action and fixed windows plus balcony and entry doors. Impact configurations are HVHZ approved; non-impact variants for use outside HVHZ.",
    approvals: [
      { config: "Dual Action Window (impact)", fl: "FL26935-R6", hvhz: true, impact: "Large Missile" },
      { config: "Dual Action Window (non-impact)", fl: "FL26935-R6", hvhz: false, impact: "Non-Impact" },
      { config: "Fixed / Picture Window (impact)", fl: "FL26936-R5", hvhz: true, impact: "Large Missile" },
      { config: "76MD Balcony Door (impact)", fl: "FL26937-R5", hvhz: true, impact: "Large Missile" },
      { config: "76AD Inswing Entry (non-impact)", fl: "FL26937-R5", hvhz: false, impact: "Non-Impact" },
    ],
  },
  {
    slug: "pd88",
    family: "koemmerling",
    name: "PD88 Lift & Slide (Premidoor 88)",
    material: "PVC",
    profile: "Kömmerling Premidoor 88",
    categories: ["Sliding & Folding"],
    hvhz: "Yes",
    impact: "Large Missile",
    summary:
      "PVC lift & slide door system. Both XO (2-panel) and OXXO (4-panel) configurations are HVHZ certified under Large Missile Impact.",
    approvals: [
      { config: "Lift & Slide — XO (2-panel)", fl: "FL26934-R4", hvhz: true, impact: "Large Missile", dp: "+55 / -55 psf" },
      { config: "Lift & Slide — OXXO (4-panel)", fl: "FL26934-R4", hvhz: true, impact: "Large Missile", dp: "+55 / -55 psf" },
    ],
  },
  {
    slug: "88md",
    family: "koemmerling",
    name: "88MD Windows (Series 88)",
    material: "PVC",
    profile: "Kömmerling 88",
    categories: ["Windows"],
    hvhz: "No",
    impact: "Non-Impact",
    summary:
      "88 mm PVC profile system. Fixed and dual-action window configurations for use outside HVHZ.",
    approvals: [
      { config: "Fixed Window", fl: "FL26936-R5", hvhz: false, impact: "Non-Impact" },
      { config: "Dual Action Window", fl: "FL31360-R3", hvhz: false, impact: "Non-Impact" },
    ],
  },
];

const SYSTEM_IMAGES: Record<string, string> = {
  "vista-guard": "/images/profile-etem75.jpg",
  "vision-guard": "/images/profile-koem76.jpg",
  "masterline-8": "/images/profile-masterline8.jpg",
  "cs-77": "/images/profile-cs77.jpg",
  "cp-155": "/images/profile-cp130.jpg",
  masterpatio: "/images/profile-cp130.jpg",
  "conceptwall-50": "/images/profile-cw50.jpg",
  "76md": "/images/profile-koem76.jpg",
  pd88: "/images/profile-koem88.jpg",
  "88md": "/images/profile-koem88.jpg",
};

export function systemImage(slug: string) {
  return SYSTEM_IMAGES[slug] ?? "/images/arch-1.jpg";
}

// Real manufacturer product renders (per family), used on the system detail overview.
const SYSTEM_RENDERS: Partial<Record<FamilySlug, string>> = {
  valda: "/images/sys-vista.jpg", // overridden per-slug below
  reynaers: "/images/sys-reynaers.png",
  koemmerling: "/images/sys-koemmerling.jpg",
};

export function systemRender(s: System) {
  if (s.slug === "vision-guard") return "/images/sys-vision.jpg";
  if (s.slug === "vista-guard") return "/images/sys-vista.jpg";
  return SYSTEM_RENDERS[s.family] ?? systemImage(s.slug);
}

// Interactive 3D models (GLB), converted from manufacturer IFC/BIM.
const SYSTEM_MODELS: Record<string, string> = {
  "76md": "/models/76md.glb",
};

export function systemModel(slug: string): string | null {
  return SYSTEM_MODELS[slug] ?? null;
}

// Real profile-section renders with hotspots placed on the actual parts.
// Kept here (not in the "use client" component) so Server Components can read it.
export type ProfileHotspot = { n: number; x: number; y: number; t: string; b: string };
export const SYSTEM_PROFILES: Record<string, { image: string; hotspots: ProfileHotspot[] }> = {
  "76md": {
    image: "/images/sys-76md-cut.png",
    hotspots: [
      { n: 1, x: 63, y: 39, t: "Warm-edge glazing", b: "Sealed insulating glass unit with a low-conductivity warm-edge spacer at the glass edge." },
      { n: 2, x: 61, y: 66, t: "Co-extruded gaskets", b: "Continuous seals on both the glass and the frame keep out air and water." },
      { n: 3, x: 65, y: 79, t: "Steel reinforcement core", b: "Galvanised steel inside the chambers gives the PVC frame its structural rigidity." },
      { n: 4, x: 32, y: 52, t: "Multi-chamber profile", b: "76 mm PVC chambers for warmth, drainage and strength." },
    ],
  },
};

export function systemProfile(slug: string) {
  return SYSTEM_PROFILES[slug] ?? null;
}

export const CATEGORIES: { name: Category; blurb: string }[] = [
  { name: "Windows", blurb: "Tilt & turn, fixed, casement, awning, dual action." },
  { name: "Doors", blurb: "Entrance, terrace, inswing and outswing with sidelights." },
  { name: "Sliding & Folding", blurb: "Sliding glass, lift & slide, multi-track systems." },
  { name: "Facades", blurb: "Curtain wall and window wall systems." },
];

export function systemsByFamily(family: FamilySlug) {
  return SYSTEMS.filter((s) => s.family === family);
}

/* ── Technical spec generators (manufacturer-style datasheet) ──────── */
const DEPTH: Record<string, string> = {
  "vista-guard": "75 mm",
  "vision-guard": "76 mm",
  "masterline-8": "77 mm",
  "cs-77": "77 mm",
  "cp-155": "155 mm",
  masterpatio: "159 mm",
  "conceptwall-50": "50 mm",
  "76md": "76 mm",
  pd88: "88 mm",
  "88md": "88 mm",
};

export function systemDepth(s: System) {
  return DEPTH[s.slug] ?? (s.material === "PVC" ? "76 mm" : "77 mm");
}

export function systemTech(s: System): { label: string; value: string }[] {
  const alu = s.material === "Aluminium";
  const isSlide = s.categories.includes("Sliding & Folding");
  const isFacade = s.categories.includes("Facades");
  const isDoor = s.categories.includes("Doors");
  const dp = s.approvals.find((a) => a.dp)?.dp;
  const max = s.approvals.find((a) => a.max)?.max;
  const rows: { label: string; value: string }[] = [
    { label: "Profile", value: s.profile },
    { label: "Frame depth", value: systemDepth(s) },
    { label: "Thermal performance", value: isFacade ? "Ucw from 1.5 W/m²K" : alu ? "Uf from 1.4 W/m²K" : "Uf from 1.0 W/m²K" },
    { label: "Glazing thickness", value: isSlide ? "Up to 60 mm" : alu ? "Up to 52 mm" : "Up to 50 mm" },
    { label: "Acoustic reduction", value: alu ? "Rw up to 45 dB" : "Rw up to 47 dB" },
    { label: "Colours & finishes", value: "Any RAL · anodised · wood-effect" },
    { label: "Max sash weight", value: isSlide ? "Up to 400 kg / leaf" : isDoor ? "Up to 160 kg / leaf" : "Up to 130 kg / vent" },
    { label: "Impact rating", value: s.impact },
    { label: "HVHZ approved", value: s.hvhz },
  ];
  if (dp) rows.push({ label: "Design pressure", value: dp });
  rows.push({ label: "Max tested size", value: max ?? "Project-specific" });
  return rows;
}

export function systemKeyStats(s: System): { label: string; value: string }[] {
  const alu = s.material === "Aluminium";
  const isFacade = s.categories.includes("Facades");
  return [
    { label: "Thermal performance", value: isFacade ? "Ucw from 1.5 W/m²K" : alu ? "Uf from 1.4 W/m²K" : "Uf from 1.0 W/m²K" },
    { label: "Frame depth", value: systemDepth(s) },
    { label: "Acoustic", value: alu ? "Rw up to 45 dB" : "Rw up to 47 dB" },
    { label: "Impact rating", value: s.impact },
  ];
}

export function systemHolder(s: System) {
  return FAMILIES.find((f) => f.slug === s.family)?.holder ?? "VALDA 90 OOD";
}

export function systemFeatures(s: System): string[] {
  const alu = s.material === "Aluminium";
  return [
    alu ? "Slim aluminium sightlines for maximum daylight" : "Multi-chamber PVC profile for high thermal comfort",
    alu ? "Polyamide thermal break for low U-values" : "Galvanised steel reinforcement for structural rigidity",
    s.impact === "Non-Impact"
      ? "Engineered and tested for Wind Zone 3"
      : `${s.impact} impact rated${s.hvhz !== "No" ? " for HVHZ coastal projects" : ""}`,
    `Florida Product Approved — held by ${systemHolder(s)}`,
  ];
}

const OPENINGS: Record<Category, string[]> = {
  Windows: ["Fixed / Picture", "Tilt & turn", "Casement", "Awning", "Dual action"],
  Doors: ["Entrance door", "Terrace door", "Inswing", "Outswing"],
  "Sliding & Folding": ["Lift & slide", "Sliding XO / OXXO", "Multi-track"],
  Facades: ["Curtain wall", "Window wall", "Panel wall"],
};

export function systemOpenings(s: System): string[] {
  return Array.from(new Set(s.categories.flatMap((c) => OPENINGS[c])));
}

export type DownloadItem = { label: string; kind: string; href: string; file?: boolean };

// Real per-system files (staged in /public/downloads).
const SYSTEM_FILES: Record<string, DownloadItem[]> = {
  "76md": [
    { label: "CAD section detail", kind: "DWG", href: "/downloads/76md/kommerling-76md-section.dwg", file: true },
    { label: "CAD section detail", kind: "DXF", href: "/downloads/76md/kommerling-76md-section.dxf", file: true },
    { label: "BIM object", kind: "IFC", href: "/downloads/76md/kommerling-76md-bim.ifc", file: true },
  ],
};

export function systemDownloads(slug?: string): DownloadItem[] {
  const real = slug ? SYSTEM_FILES[slug] ?? [] : [];
  const generic: DownloadItem[] = real.length
    ? [
        { label: "Technical datasheet", kind: "PDF", href: "/downloads" },
        { label: "FL Product Approval", kind: "PDF", href: "/downloads" },
      ]
    : [
        { label: "Technical datasheet", kind: "PDF", href: "/downloads" },
        { label: "CAD section details", kind: "DWG", href: "/downloads" },
        { label: "BIM object", kind: "IFC", href: "/downloads" },
        { label: "FL Product Approval", kind: "PDF", href: "/downloads" },
      ];
  return [...real, ...generic];
}

export function allApprovals() {
  return SYSTEMS.flatMap((s) =>
    s.approvals.map((a) => ({ ...a, system: s.name, family: s.family, material: s.material })),
  );
}

export const CERTIFICATIONS = [
  { code: "FL Product Approval", scope: "Florida Building Code — Large Missile Impact, Wind Zone 3 & 4" },
  { code: "NAMI", scope: "Structural, air, water, and impact performance certification" },
  { code: "NFRC", scope: "U-value, SHGC, VLT — energy performance" },
  { code: "AAMA / FGIA", scope: "Fenestration performance standards (AAMA/NAFS A440)" },
  { code: "HVHZ", scope: "High Velocity Hurricane Zone compliance" },
  { code: "ISO 9001", scope: "Quality management system" },
  { code: "CE Marking", scope: "European Conformity" },
  { code: "ASTM / TAS", scope: "E283, E330, E331, TAS 201, TAS 203 — full test battery" },
];
