// Per-system technical downloads. Files are staged in /public/downloads/<slug>/
// with fixed names — drop a file in and it goes live automatically (the page
// checks the filesystem at build time; missing files show "available on request").
//
// Naming convention, per system slug:
//   <slug>-datasheet.pdf       Technical datasheet
//   <slug>-sections.dwg        CAD section detail (AutoCAD)
//   <slug>-sections.dxf        CAD section detail (neutral)
//   <slug>-fl-approval.pdf     Florida Product Approval (systems with FL numbers)
//   <slug>-spec.docx           CSI 3-part specification (editable)
//   <slug>-installation.pdf    Installation guide / sealed drawings
//
// Site-wide files live directly in /public/downloads/:
//   valda-catalogue-2026.pdf · valda-colour-chart.pdf · valda-warranty.pdf

import type { ProductSystem } from "@/lib/products";

export interface DocSpec {
  key: string;
  label: string;
  kind: string; // badge: PDF, DWG, DXF, DOCX
  file: string; // filename within the system folder
  desc: string;
  flOnly?: boolean; // only offered when the system has FL numbers
}

// The document set every system can carry, in the order they should appear.
export const DOC_TYPES: DocSpec[] = [
  { key: "datasheet", label: "Technical datasheet", kind: "PDF", file: "datasheet.pdf", desc: "Performance, certified sizes and profile sections." },
  { key: "fl", label: "Florida Product Approval", kind: "PDF", file: "fl-approval.pdf", desc: "The sealed FL approval documents for this system.", flOnly: true },
  { key: "spec", label: "CSI 3-part specification", kind: "DOCX", file: "spec.docx", desc: "Editable specification to drop into your project manual." },
  { key: "dwg", label: "CAD section detail", kind: "DWG", file: "sections.dwg", desc: "Profile sections for AutoCAD." },
  { key: "dxf", label: "CAD section detail", kind: "DXF", file: "sections.dxf", desc: "Profile sections in neutral CAD format." },
  { key: "install", label: "Installation guide", kind: "PDF", file: "installation.pdf", desc: "Sealed installation drawings and instructions." },
];

export interface SiteDoc {
  label: string;
  kind: string;
  file: string; // filename within /public/downloads/
  desc: string;
}

// Site-wide documents shown on the downloads index (not per system). Only files
// that actually exist are rendered — a listed doc with no file simply stays
// hidden until the file is added (the colour chart is a to-do, not yet produced).
export const SITE_DOCS: SiteDoc[] = [
  { label: "Catalogue 2026", kind: "PDF", file: "valda-catalogue-2026.pdf", desc: "The company, the range and the work." },
  { label: "Technical catalogue 2026", kind: "PDF", file: "valda-technical-catalogue-2026.pdf", desc: "Systems, certifications and performance data." },
  { label: "Colour & finish chart", kind: "PDF", file: "valda-colour-chart.pdf", desc: "Full RAL, anodised and wood-effect options." },
];

// Which site docs can also be read online as a flip book, keyed by filename.
export const CATALOGUE_READERS: Record<string, string> = {
  "valda-catalogue-2026.pdf": "/catalogue",
  "valda-technical-catalogue-2026.pdf": "/catalogue/technical",
};

export interface PackItem extends DocSpec {
  href: string; // public path
}

/** The document set a system should offer, with public hrefs. Existence is
 *  resolved by the page (server-side fs check); absent files fall back to
 *  "available on request". */
export function systemPack(s: ProductSystem): PackItem[] {
  const hasFl = s.flNumbers.length > 0;
  return DOC_TYPES.filter((d) => !d.flOnly || hasFl).map((d) => ({
    ...d,
    href: `/downloads/${s.slug}/${s.slug}-${d.file}`,
  }));
}
