export type Category = "Windows" | "Doors" | "Sliding & Folding" | "Facades";

// One certified configuration, exactly as carried on the Florida Product Approval.
export type Approval = {
  config: string;
  fl: string; // individual product number, e.g. FL39802.3
  hvhz: boolean;
  impact: string;
  perfClass?: string; // e.g. CW-PG65
  dp?: string; // design pressure, e.g. ±65 psf
  water?: string; // water penetration, psf
  max?: string; // max certified size (inches)
  install?: string; // governing installation drawing
  evalReport?: string; // evaluation report reference
  nami?: string; // NAMI certificate number
};

export type System = {
  slug: string;
  family: FamilySlug;
  name: string;
  material: "Aluminum" | "PVC";
  profile: string;
  categories: Category[];
  hvhz: "Yes" | "No" | "Both";
  impact: string;
  summary: string;
  application?: string; // governing FL application(s)
  perfClass?: string; // headline performance class where carried
  approvals: Approval[];
};

// System-level technical specifications (not per-configuration — those live on
// the Approval rows). Verified against the Florida Product Approval records.
export type SystemSpec = {
  glazing?: string; // glazing thickness range
  uf?: string; // frame / profile U-value (W/m²K)
  uw?: string; // whole-window U-value (W/m²K)
  ucw?: string; // curtain-wall U-value (W/m²K)
  rw?: string; // acoustic reduction (Rw)
  water?: string; // water resistance
  weight?: string; // max sash / leaf / infill weight
  capability?: string; // manufacturer max size — NOT the certified US limit
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
    material: "Aluminum + PVC",
    holder: "Valda 90 OOD",
    blurb:
      "Systems designed, tested and certified by VALDA for the US market, with Florida Product Approvals (FL39801, FL39802) held in VALDA's own name. CW-PG65 performance class, in large-missile impact HVHZ and non-impact configurations.",
  },
  {
    slug: "reynaers",
    brand: "Reynaers",
    label: "Reynaers Systems",
    kind: "Partner system",
    material: "Aluminum",
    holder: "Reynaers",
    blurb:
      "Aluminum windows, doors, sliding glass, curtain wall and lift & slide. Florida Product Approvals held by Reynaers; supplied and installed by VALDA. Impact rated for Wind Zone 3 and for the HVHZ.",
  },
  {
    slug: "koemmerling",
    brand: "Kömmerling",
    label: "Kömmerling Systems",
    kind: "Partner system",
    material: "PVC",
    holder: "Kömmerling USA Inc.",
    blurb:
      "German PVC profile systems, fabricated by VALDA. Florida Product Approvals held by Kömmerling USA Inc. Large-missile impact configurations approved for the HVHZ, alongside a non-impact range for the rest of the country.",
  },
];

export const SYSTEMS: System[] = [
  {
    slug: "vista-guard",
    family: "valda",
    name: "Vista Guard",
    material: "Aluminum",
    profile: "Aluminum",
    categories: ["Windows"],
    hvhz: "Yes",
    impact: "Large Missile",
    perfClass: "CW-PG65",
    application: "FL39802-R2 · FL39801-R2",
    summary:
      "Proprietary aluminum window system. Large-missile impact, approved for and outside the HVHZ. No external impact protection required.",
    approvals: [
      { config: "Picture / fixed window", fl: "FL39802.3", hvhz: true, impact: "Large Missile", perfClass: "CW-PG65", dp: "±65 psf", water: "15.0 psf", max: "59 × 98.4 in", install: "NL-0145 Rev0", evalReport: "ACE-1070 Rev1", nami: "NI015425" },
      { config: "Tilt & turn window", fl: "FL39801.4", hvhz: true, impact: "Large Missile", perfClass: "CW-PG65", dp: "±65 psf", water: "9.75 psf", max: "48 × 78 in", install: "NL-0144 Rev0", evalReport: "ACE-1069 Rev1", nami: "NI015433" },
    ],
  },
  {
    slug: "vision-guard",
    family: "valda",
    name: "Vision Guard",
    material: "PVC",
    profile: "PVC",
    categories: ["Windows"],
    hvhz: "Yes",
    impact: "Large Missile",
    perfClass: "CW-PG65",
    application: "FL39802-R2 · FL39801-R2",
    summary:
      "Proprietary PVC window system with laminated impact glazing. Large-missile impact, approved for and outside the HVHZ.",
    approvals: [
      { config: "Picture / fixed window", fl: "FL39802.1", hvhz: true, impact: "Large Missile", perfClass: "CW-PG65", dp: "±65 psf", water: "15.0 psf", max: "59.1 × 98.4 in", install: "NL-0143 Rev0", evalReport: "ACE-1068 Rev2", nami: "NI015426" },
      { config: "Tilt & turn window", fl: "FL39801.1", hvhz: true, impact: "Large Missile", perfClass: "CW-PG65", dp: "±65 psf", water: "9.75 psf", max: "48 × 78 in", install: "NL-0142 Rev0", evalReport: "ACE-1067 Rev2", nami: "NI015434" },
    ],
  },
  {
    slug: "vision",
    family: "valda",
    name: "Vision",
    material: "PVC",
    profile: "PVC",
    categories: ["Windows"],
    hvhz: "No",
    impact: "Non-Impact",
    application: "FL39802-R2 · FL39801-R2",
    summary:
      "Non-impact PVC windows for projects outside wind-borne debris regions. An approved external covering is required where debris protection applies.",
    approvals: [
      { config: "Picture / fixed", fl: "FL39802.2", hvhz: false, impact: "Non-Impact", perfClass: "CW-PG65", dp: "±65 psf", max: "59.1 × 98.4 in", install: "NL-0151 Rev0", evalReport: "ACE-1071 Rev1", nami: "NI015427" },
      { config: "Tilt & turn, single sash", fl: "FL39801.2", hvhz: false, impact: "Non-Impact", perfClass: "CW-PG65", dp: "±65 psf", max: "48 × 78 in", install: "NL-0152 Rev0", evalReport: "ACE-1073 Rev1", nami: "NI015428" },
      { config: "Tilt & turn, double sash", fl: "FL39801.3", hvhz: false, impact: "Non-Impact", perfClass: "CW-PG50", dp: "±50 psf", max: "96 × 78 in", install: "NL-0152 Rev0", evalReport: "ACE-1073 Rev1", nami: "NI015428.01" },
    ],
  },
  {
    slug: "masterline-8",
    family: "reynaers",
    name: "MasterLine 8",
    material: "Aluminum",
    profile: "Aluminum 6060-T66",
    categories: ["Windows", "Doors"],
    hvhz: "No",
    impact: "WZ3 Impact",
    application: "FL47832 – FL47836",
    summary:
      "Aluminum window and door platform, impact rated for Wind Zone 3 outside the HVHZ. No design pressure is carried on the approval; allowable sizes and pressures are defined in the sealed installation drawings.",
    approvals: [
      { config: "Fixed window", fl: "FL47832.1", hvhz: false, impact: "WZ3 Impact", dp: "Up to ±65 psf", install: "REY001", evalReport: "PER10055" },
      { config: "Tilt & turn / turn & tilt", fl: "FL47833.1", hvhz: false, impact: "WZ3 Impact", dp: "Wind Zone 3", install: "REY002", evalReport: "PER10056" },
      { config: "Casement", fl: "FL47834.1", hvhz: false, impact: "WZ3 Impact", dp: "Wind Zone 3", install: "REY003", evalReport: "PER10057" },
      { config: "Awning", fl: "FL47835.1", hvhz: false, impact: "WZ3 Impact", dp: "Wind Zone 3", install: "REY004", evalReport: "PER10058" },
      { config: "Entrance side-hinged door", fl: "FL47836.1", hvhz: false, impact: "WZ3 Impact", dp: "Wind Zone 3", install: "REY006", evalReport: "PER10060" },
      { config: "Terrace side-hinged door", fl: "FL47836.2", hvhz: false, impact: "WZ3 Impact", dp: "Wind Zone 3", install: "REY005", evalReport: "PER10059" },
    ],
  },
  {
    slug: "masterpatio",
    family: "reynaers",
    name: "MasterPatio",
    material: "Aluminum",
    profile: "Aluminum 6060-T66",
    categories: ["Sliding & Folding"],
    hvhz: "No",
    impact: "WZ3 Impact",
    application: "FL47837",
    summary:
      "Aluminum sliding glass door assembly, impact rated for Wind Zone 3 outside the HVHZ. No additional impact covering required in Wind Zone 3 or less.",
    approvals: [
      { config: "Sliding glass door", fl: "FL47837.1", hvhz: false, impact: "WZ3 Impact", dp: "Wind Zone 3", install: "REY007", evalReport: "PER10061" },
    ],
  },
  {
    slug: "conceptwall-50",
    family: "reynaers",
    name: "ConceptWall 50",
    material: "Aluminum",
    profile: "Aluminum 6060-T66",
    categories: ["Facades"],
    hvhz: "No",
    impact: "WZ3 Impact",
    application: "FL47838",
    summary:
      "Curtain wall / panel wall system, wind-borne debris compliant per Chapter 16 of the FBC. Impact rated for Wind Zone 3 outside the HVHZ.",
    approvals: [
      { config: "Curtain wall (panel wall)", fl: "FL47838.1", hvhz: false, impact: "WZ3 Impact", dp: "Wind Zone 3", install: "REY008, signed and sealed", evalReport: "PER10062" },
    ],
  },
  {
    slug: "cp-155",
    family: "reynaers",
    name: "CP 155 Lift & Slide",
    material: "Aluminum",
    profile: "Aluminum",
    categories: ["Sliding & Folding"],
    hvhz: "Yes",
    impact: "Large Missile",
    application: "FL39164-R1",
    summary:
      "Aluminum lift & slide door, the one Reynaers system here approved for the HVHZ. Large-missile impact under TAS 201 and TAS 203, to the 2023 Florida Building Code.",
    approvals: [
      { config: "Lift and slide door (OXXO)", fl: "FL39164.1", hvhz: true, impact: "Large Missile", dp: "±65 psf", max: "7350 × 3050 mm (289-3/8 × 120 in)", install: "DWG 21-31F 2023", evalReport: "CP155 Lift and Slide LMI PAE 2023" },
    ],
  },
  {
    slug: "cs-77",
    family: "reynaers",
    name: "CS 77",
    material: "Aluminum",
    profile: "Aluminum",
    categories: ["Windows"],
    hvhz: "Both",
    impact: "Impact rated",
    application: "FL28671 · FL28672 · FL38158",
    summary:
      "Impact-rated aluminum windows with a standard and an HVHZ variant under each application. All configurations carry ±65 psf design pressure. Shutters are required above 30 ft within the HVHZ.",
    approvals: [
      { config: "Fixed window", fl: "FL28671.1", hvhz: false, impact: "Impact rated", dp: "±65 psf", water: "12 psf", max: "2400 × 3600 mm (94-1/2 × 141-3/4 in)", install: "CS77 Fix Dwg3" },
      { config: "Fixed window, HVHZ", fl: "FL28671.2", hvhz: true, impact: "Impact rated", dp: "±65 psf", water: "12 psf", max: "2400 × 3600 mm (94-1/2 × 141-3/4 in)", install: "CS77 FixHZ Dwg3" },
      { config: "Casement", fl: "FL28672.1", hvhz: false, impact: "Impact rated", dp: "±65 psf", water: "12 psf", max: "1219 × 2450 mm (48 × 96-7/16 in)", install: "CS77 Case Dwg3" },
      { config: "Casement, HVHZ", fl: "FL28672.2", hvhz: true, impact: "Impact rated", dp: "±65 psf", water: "12 psf", max: "1219 × 2450 mm (48 × 96-7/16 in)", install: "CS77 CaseHZ Dwg3" },
      { config: "Tilt & turn inswing", fl: "FL38158.1", hvhz: false, impact: "Impact rated", dp: "±65 psf", water: "9.75 psf", max: "1219 × 2450 mm (48 × 96-7/16 in)", install: "CS77 TT Dwg3" },
      { config: "Tilt & turn inswing, HVHZ", fl: "FL38158.2", hvhz: true, impact: "Impact rated", dp: "±65 psf", water: "9.75 psf", max: "1219 × 2450 mm (48 × 96-7/16 in)", install: "CS77 TTHZ Dwg3" },
    ],
  },
  {
    slug: "76md",
    family: "koemmerling",
    name: "76 MD Windows & Doors",
    material: "PVC",
    profile: "PVC · 76 mm",
    categories: ["Windows", "Doors"],
    hvhz: "Both",
    impact: "Large Missile",
    application: "FL26935-R6 · FL26936-R5 · FL26937-R5",
    summary:
      "PVC tilt & turn and fixed windows plus balcony and entry doors. Two impact window configurations and the balcony door are HVHZ approved; the HADK / HADKZ windows and entry doors are non-impact for use outside the HVHZ.",
    approvals: [
      { config: "Tilt & turn, single sash", fl: "FL26935.1", hvhz: true, impact: "Large Missile", dp: "±65 psf", install: "NL-0098", evalReport: "ACE-1003 Rev2" },
      { config: "Tilt & turn, double sash", fl: "FL26935.2", hvhz: true, impact: "Large Missile", dp: "±65 psf", install: "NL-0099", evalReport: "ACE-1004 Rev2" },
      { config: "Picture / fixed", fl: "FL26936.1", hvhz: true, impact: "Large Missile", dp: "+75 / −75 psf", install: "NL-0100", evalReport: "ACE-1005 Rev2" },
      { config: "Balcony door", fl: "FL26937.1", hvhz: true, impact: "Large Missile", dp: "±65 psf", install: "NL-0101 Rev0", evalReport: "ACE-1006 Rev2" },
      { config: "HADK 76 MD — tilt & turn, single", fl: "FL26935.3", hvhz: false, impact: "Non-Impact", install: "NL-0137", evalReport: "ACE-1024 Rev2" },
      { config: "HADKZ 76 MD — double, false mull", fl: "FL26935.4", hvhz: false, impact: "Non-Impact", install: "NL-0137", evalReport: "ACE-1024 Rev2" },
      { config: "HADKZ 76 MD — double, fixed mull", fl: "FL26935.5", hvhz: false, impact: "Non-Impact", install: "NL-0137", evalReport: "ACE-1024 Rev2" },
      { config: "HADKZ 76 MD — transom, fixed mull", fl: "FL26935.6", hvhz: false, impact: "Non-Impact", install: "NL-0138", evalReport: "ACE-1025 Rev2" },
      { config: "HADKZ 76 MD — transom, field mull", fl: "FL26935.7", hvhz: false, impact: "Non-Impact", install: "NL-0138", evalReport: "ACE-1025 Rev2" },
      { config: "76 AD inswing entry door", fl: "FL26937.2", hvhz: false, impact: "Non-Impact", dp: "±50 psf", install: "SCS-0047", evalReport: "ACE-1162" },
      { config: "76 AD outswing entry door", fl: "FL26937.3", hvhz: false, impact: "Non-Impact", dp: "±50 psf", install: "SCS-0049", evalReport: "ACE-1164" },
      { config: "76 MD inswing entry door", fl: "FL26937.4", hvhz: false, impact: "Non-Impact", dp: "±50 psf", install: "See approval record" },
    ],
  },
  {
    slug: "pd88",
    family: "koemmerling",
    name: "Premidoor 88 Lift & Slide",
    material: "PVC",
    profile: "PVC · 88 mm",
    categories: ["Sliding & Folding"],
    hvhz: "Yes",
    impact: "Large Missile",
    application: "FL26934-R4",
    summary:
      "88 mm PVC lift & slide. Both the two-panel and four-panel configurations are large-missile impact rated and approved for the HVHZ, under TAS 201/202/203. Design pressure ±55 psf, lower than the 76 MD window range.",
    approvals: [
      { config: "Lift & slide, XO / OX (two panel)", fl: "FL26934.1", hvhz: true, impact: "Large Missile", dp: "±55 psf", max: "4572 × 2438 mm (180 × 96 in)", install: "NL-0090", evalReport: "ACE-1001 Rev2" },
      { config: "Lift & slide, OXXO (four panel)", fl: "FL26934.2", hvhz: true, impact: "Large Missile", dp: "±55 psf", install: "NL-0097", evalReport: "ACE-1002 Rev2" },
    ],
  },
  {
    slug: "88md",
    family: "koemmerling",
    name: "Series 88 Windows",
    material: "PVC",
    profile: "PVC · 88 mm",
    categories: ["Windows"],
    hvhz: "No",
    impact: "Non-Impact",
    application: "FL26936-R5 · FL31360-R3",
    summary:
      "88 mm PVC profile. Non-impact fixed and dual-action window configurations for use outside the HVHZ. An approved external covering is required in wind-borne debris regions.",
    approvals: [
      { config: "Fixed window", fl: "FL26936.2", hvhz: false, impact: "Non-Impact", dp: "+40 / −40 psf", install: "SCS-0021 Rev0", evalReport: "ACE-1086 Rev0" },
      { config: "Dual action window", fl: "FL31360.1", hvhz: false, impact: "Non-Impact", dp: "+60 / −60 psf", install: "SCS-0022 Rev0" },
    ],
  },
];

const SYSTEM_IMAGES: Record<string, string> = {
  "vista-guard": "/images/profile-etem75.jpg",
  "vision-guard": "/images/profile-koem76.jpg",
  vision: "/images/profile-koem76.jpg",
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
  valda: "/images/sys-vista.jpg",
  reynaers: "/images/sys-reynaers.png",
  koemmerling: "/images/sys-koemmerling.jpg",
};

export function systemRender(s: System) {
  if (s.slug === "vision-guard" || s.slug === "vision") return "/images/sys-vision.jpg";
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
    image: "/images/sys-76md-cut.webp",
    hotspots: [
      { n: 1, x: 63, y: 39, t: "Insulating glass unit", b: "Sealed insulating glass unit with a warm-edge spacer at the glass edge." },
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
  { name: "Doors", blurb: "Entrance, terrace, inswing and outswing." },
  { name: "Sliding & Folding", blurb: "Sliding glass, lift & slide, multi-track systems." },
  { name: "Facades", blurb: "Curtain wall and panel wall systems." },
];

export function systemsByFamily(family: FamilySlug) {
  return SYSTEMS.filter((s) => s.family === family);
}

export function systemHolder(s: System) {
  return FAMILIES.find((f) => f.slug === s.family)?.holder ?? "Valda 90 OOD";
}

/* ── Specifications, from the certification catalogue only ─────────── */
export function systemTech(s: System): { label: string; value: string }[] {
  const dp = s.approvals.find((a) => a.dp)?.dp;
  const max = s.approvals.find((a) => a.max)?.max;
  const hvhz = s.hvhz === "No" ? "Outside HVHZ" : s.hvhz === "Both" ? "Approved (impact configs)" : "Approved";
  const rows: { label: string; value: string }[] = [
    { label: "Profile", value: s.profile },
    { label: "Material", value: s.material },
  ];
  if (s.perfClass) rows.push({ label: "Performance class", value: s.perfClass });
  rows.push({ label: "Impact rating", value: s.impact });
  rows.push({ label: "HVHZ", value: hvhz });
  if (dp) rows.push({ label: "Design pressure", value: dp });
  if (max) rows.push({ label: "Max certified size", value: max });
  rows.push({ label: "Approval holder", value: systemHolder(s) });
  if (s.application) rows.push({ label: "FL application", value: s.application });
  rows.push({ label: "Code edition", value: "2023 Florida Building Code" });
  return rows;
}

/* ── System-level specifications, from the manufacturer + FL records ── */
export const SYSTEM_SPECS: Record<string, SystemSpec> = {
  "cs-77": {
    glazing: "4–63 mm",
    uf: "1.8 W/m²K",
    uw: "1.3 W/m²K",
    rw: "up to 42 dB",
    water: "12 psf (tilt & turn 9.75 psf)",
  },
  "cp-155": {
    glazing: "4–52 mm",
    uw: "0.99 W/m²K",
    rw: "up to 42 dB",
  },
  "masterline-8": {
    glazing: "13–72 mm",
    uf: "1.0 W/m²K",
    uw: "0.88 W/m²K",
    rw: "up to 46 dB",
    weight: "Vent up to 300 kg",
    capability: "Vent up to 2800 mm high",
  },
  masterpatio: {
    glazing: "16–62 mm",
    uw: "0.8 W/m²K",
    rw: "up to 44 dB",
    weight: "Up to 600 kg per leaf",
    capability: "3600 × 3600 mm",
  },
  "conceptwall-50": {
    glazing: "Dry / pressure / structural",
    ucw: "0.56 W/m²K",
    rw: "up to 47 dB",
    weight: "Glass infill up to 700 kg",
  },
  "76md": {
    glazing: "up to 50 mm",
    uf: "1.0 W/m²K",
  },
  pd88: {
    glazing: "up to 56 mm",
    uf: "1.3 W/m²K",
  },
  "88md": {
    glazing: "up to 58 mm",
    uf: "0.95 W/m²K",
  },
};

export function systemSpecs(slug?: string): { label: string; value: string }[] {
  const sp = slug ? SYSTEM_SPECS[slug] : undefined;
  if (!sp) return [];
  const rows: { label: string; value: string }[] = [];
  if (sp.glazing) rows.push({ label: "Glazing", value: sp.glazing });
  if (sp.uf) rows.push({ label: "Frame U-value (Uf)", value: sp.uf });
  if (sp.uw) rows.push({ label: "Window U-value (Uw)", value: sp.uw });
  if (sp.ucw) rows.push({ label: "Curtain-wall U-value (Ucw)", value: sp.ucw });
  if (sp.rw) rows.push({ label: "Acoustic (Rw)", value: sp.rw });
  if (sp.water) rows.push({ label: "Water resistance", value: sp.water });
  if (sp.weight) rows.push({ label: "Max weight", value: sp.weight });
  if (sp.capability) rows.push({ label: "Manufacturer max size", value: sp.capability });
  return rows;
}

export function systemKeyStats(s: System): { label: string; value: string }[] {
  const dp = s.approvals.find((a) => a.dp)?.dp ?? "Per drawing";
  return [
    { label: "Impact rating", value: s.impact },
    { label: "HVHZ", value: s.hvhz === "No" ? "Outside HVHZ" : "Approved" },
    { label: "Design pressure", value: dp },
    { label: "Approval holder", value: systemHolder(s) },
  ];
}

export function systemFeatures(s: System): string[] {
  const dp = s.approvals.find((a) => a.dp)?.dp;
  const scope = s.hvhz !== "No" ? ", approved for and outside the HVHZ" : ", for Wind Zone 3 outside the HVHZ";
  const impactLabel =
    s.impact === "Non-Impact"
      ? "Non-impact, approved for use outside the HVHZ"
      : s.impact === "Large Missile"
        ? `Large-missile impact rated${scope}`
        : s.impact === "WZ3 Impact"
          ? "Impact rated for Wind Zone 3, outside the HVHZ"
          : `${s.impact}${scope}`;
  const out: string[] = [impactLabel];
  if (s.perfClass) out.push(`Performance class ${s.perfClass}`);
  if (dp) out.push(`Design pressure ${dp}`);
  out.push(`Florida Product Approved, held by ${systemHolder(s)}`);
  return out;
}

const OPENINGS: Record<Category, string[]> = {
  Windows: ["Fixed / Picture", "Tilt & turn", "Casement", "Awning", "Dual action"],
  Doors: ["Entrance door", "Terrace door", "Inswing", "Outswing"],
  "Sliding & Folding": ["Lift & slide", "Sliding XO / OXXO", "Multi-track"],
  Facades: ["Curtain wall", "Panel wall"],
};

export function systemOpenings(s: System): string[] {
  return Array.from(new Set(s.categories.flatMap((c) => OPENINGS[c])));
}

// Animated opening types shown on each product page, per the actual approved
// configurations. The seven types map to the Openings component figures.
// Vista / Vision (FL39801 / FL39802) are intentionally omitted — QA hold, not public.
export type OpeningType = "fixed" | "casement" | "awning" | "tt" | "sliding" | "liftslide" | "door";

const SYSTEM_OPENING_TYPES: Record<string, OpeningType[]> = {
  "masterline-8": ["fixed", "casement", "awning", "tt", "door"],
  "cs-77": ["fixed", "casement", "tt"],
  masterpatio: ["sliding"],
  "cp-155": ["liftslide"],
  "conceptwall-50": ["fixed"],
  // 76 MD tilt-turn + picture, plus the 76 MD balcony door and the 76 AD entry doors.
  "76md": ["tt", "fixed", "door"],
  pd88: ["liftslide"],
  "88md": ["fixed", "tt"], // Series 88: fixed + dual-action (tilt & turn)
};

export function systemOpeningTypes(slug: string): OpeningType[] {
  return SYSTEM_OPENING_TYPES[slug] ?? [];
}

export type DownloadItem = { label: string; kind: string; href: string; file?: boolean };

// Real per-system files (staged in /public/downloads).
const SYSTEM_FILES: Record<string, DownloadItem[]> = {
  "76md": [
    { label: "Technical spec sheet", kind: "PDF", href: "/downloads/76md/valda-76md-spec.pdf", file: true },
    { label: "CAD section detail", kind: "DWG", href: "/downloads/76md/kommerling-76md-section.dwg", file: true },
    { label: "CAD section detail", kind: "DXF", href: "/downloads/76md/kommerling-76md-section.dxf", file: true },
  ],
};

export function systemDownloads(slug?: string): DownloadItem[] {
  const real = slug ? SYSTEM_FILES[slug] ?? [] : [];
  const generic: DownloadItem[] = real.length
    ? [{ label: "FL Product Approval", kind: "PDF", href: "/downloads" }]
    : [
        { label: "Technical datasheet", kind: "PDF", href: "/downloads" },
        { label: "CAD section details", kind: "DWG", href: "/downloads" },
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
  { code: "FL Product Approval", scope: "Florida Building Code — the most demanding fenestration approval in the country" },
  { code: "HVHZ", scope: "High Velocity Hurricane Zone — Miami-Dade and Broward counties" },
  { code: "NAMI", scope: "Structural, air, water and impact performance certification" },
  { code: "AAMA / WDMA / CSA", scope: "101 / I.S.2 / A440 — North American fenestration standard" },
  { code: "ASTM", scope: "E283 air · E330 structural · E331 water · E1886 / E1996 impact" },
  { code: "TAS", scope: "201, 202, 203 — large-missile impact and cyclic wind pressure (HVHZ)" },
];
