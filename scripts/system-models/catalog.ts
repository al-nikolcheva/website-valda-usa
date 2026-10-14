// One entry per system in valda-products.json. Depths (mm) are the published
// build depths where known; profile internals are the shared templates in
// sections.ts, except Kömmerling 76 MD which uses the real DXF section.
// `confirm` marks dimensions still to be checked against manufacturer drawings.
import type { Model } from "./geometry";
import { casementUnit, curtainWall, doubleCasement, foldingUnit, slidingUnit, windowWall } from "./assemblies";
import { casement, curtainWall as cwSection, folding, koemmerling76md, sliding, type Material } from "./sections";

export interface SystemModelSpec {
  slug: string;
  name: string;
  material: Material;
  basis: string;
  confirm?: string;
  build: (m: Model) => void;
}

const cas = (mat: Material, D: number, V: number, G: number, n: 2 | 3, W: number, H: number, s?: number, door?: boolean) => (m: Model) =>
  casementUnit(m, casement({ mat, D, V, G, n, s }), W, H, { door });
const slide = (mat: Material, D: number, P: number, G: number, n: 2 | 3, face: number, W: number, H: number, lift = false) => (m: Model) =>
  slidingUnit(m, sliding({ mat, D, P, G, n, face }), W, H, { lift });

export const SYSTEMS: SystemModelSpec[] = [
  // ── Reynaers (aluminium) ──────────────────────────────────────────
  { slug: "conceptsystem-77", name: "ConceptSystem 77", material: "alu", basis: "Frame 77 / vent 86 mm, triple glazing 52 mm", build: cas("alu", 77, 86, 52, 3, 1000, 1500) },
  { slug: "masterline-8", name: "MasterLine 8", material: "alu", basis: "Frame 77 / vent 87 mm, glazing 13–72 mm (60 mm triple shown)", build: cas("alu", 77, 87, 60, 3, 1000, 1500) },
  { slug: "masterline-10", name: "MasterLine 10", material: "alu", basis: "Frame 107 / vent 117 mm, triple glazing", confirm: "build depth", build: cas("alu", 107, 117, 64, 3, 1000, 1500) },
  { slug: "conceptsystem-68", name: "ConceptSystem 68", material: "alu", basis: "Frame 68 / vent 77 mm", build: cas("alu", 68, 77, 40, 3, 1000, 1500) },
  { slug: "slimline-38", name: "SlimLine 38", material: "alu", basis: "38 mm slim steel-look profile", confirm: "sightlines", build: cas("alu", 38, 47, 24, 2, 900, 1500, 0.72) },
  { slug: "masterpatio", name: "MasterPatio", material: "alu", basis: "Two-rail sliding, glazing 16–62 mm", confirm: "frame and leaf depth", build: slide("alu", 160, 64, 40, 3, 70, 3000, 2400) },
  { slug: "conceptpatio-155", name: "ConceptPatio 155", material: "alu", basis: "Lift & slide, 155 mm frame, glazing 4–52 mm", build: slide("alu", 155, 64, 44, 3, 80, 3600, 2500, true) },
  { slug: "hi-finity", name: "Hi-Finity", material: "alu", basis: "Minimal-sightline sliding, 35 mm interlock", confirm: "frame and leaf depth", build: slide("alu", 147, 56, 32, 2, 36, 3600, 2700) },
  { slug: "slimpatio-68", name: "SlimPatio 68", material: "alu", basis: "Slim sliding, 68 mm leaf", confirm: "frame depth", build: slide("alu", 164, 68, 36, 3, 48, 3000, 2400) },
  { slug: "conceptpatio-68", name: "ConceptPatio 68", material: "alu", basis: "XO sliding, 68 mm leaf", confirm: "frame depth", build: slide("alu", 164, 68, 32, 2, 70, 2800, 2300) },
  {
    slug: "conceptfolding-77", name: "ConceptFolding 77", material: "alu", basis: "77 mm folding leaves, four shown",
    build: (m) => foldingUnit(m, folding({ D: 77, G: 44, n: 3, face: 80 }), 3200, 2400),
  },
  {
    slug: "conceptwall-50", name: "ConceptWall 50", material: "alu", basis: "50 mm stick curtain wall, 150 mm mullion",
    build: (m) => void curtainWall(m, cwSection({ w: 50, Dm: 150, G: 44, n: 3 }), 3, 2, 1200, 1700),
  },
  {
    slug: "masterwall", name: "MasterWall", material: "alu", basis: "Unitised window wall", confirm: "unit frame section",
    build: (m) => windowWall(m, sliding({ mat: "alu", D: 300, P: 120, G: 44, n: 3, face: 45 }), 3, 2, 1200, 1600),
  },

  // ── Valda (own brand) ─────────────────────────────────────────────
  { slug: "vision-guard", name: "Vision Guard", material: "pvc", basis: "Deceuninck Legend PVC, impact glazing", confirm: "Legend build depth (76 mm assumed)", build: cas("pvc", 76, 84, 44, 3, 1000, 1500) },
  { slug: "vista-guard", name: "Vista Guard", material: "alu", basis: "ETEM E75 aluminium, 75 mm, glazing up to 55 mm", build: cas("alu", 75, 84, 44, 3, 1000, 1500) },
  { slug: "vision", name: "Vision", material: "pvc", basis: "Deceuninck Legend PVC", confirm: "Legend build depth (76 mm assumed)", build: cas("pvc", 76, 84, 44, 3, 1000, 1500) },

  // ── Kömmerling (PVC) ──────────────────────────────────────────────
  {
    slug: "series-76-md", name: "Series 76 MD", material: "pvc", basis: "Real Kömmerling section from DXF: frame 76171, sash 76271, bead 76507, steel V306/V309",
    build: (m) => {
      const s = koemmerling76md();
      casementUnit(m, s, s.size[0], s.size[1]);
    },
  },
  {
    slug: "series-76-md-hadk-hadkz", name: "Series 76 MD — HADK / HADKZ", material: "pvc", basis: "Real 76 MD section, double tilt & turn",
    build: (m) => doubleCasement(m, koemmerling76md(), 1800, 1480),
  },
  { slug: "series-76-ad", name: "Series 76 AD", material: "pvc", basis: "76 mm double-seal entry door", confirm: "door sash section", build: cas("pvc", 76, 84, 44, 3, 1000, 2200, 1.25, true) },
  { slug: "premidoor-88", name: "Premidoor 88", material: "pvc", basis: "Lift & slide, 88 mm leaf, glazing up to 56 mm", build: slide("pvc", 202, 88, 52, 3, 110, 3600, 2400, true) },
  { slug: "series-88", name: "Series 88", material: "pvc", basis: "88 mm PVC, glazing up to 58 mm", build: cas("pvc", 88, 96, 52, 3, 1000, 1500) },
  { slug: "premislide-76", name: "PremiSlide 76", material: "pvc", basis: "PVC sliding, 76 mm leaf", confirm: "frame depth", build: slide("pvc", 176, 76, 44, 3, 90, 3000, 2300) },
];
