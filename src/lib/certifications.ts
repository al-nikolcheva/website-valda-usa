// Register-verified Florida Product Approval data, per system.
//
// Source of truth: FL Approval Register, verified 30 July 2026 against the
// DBPR product approval portal (2023 Florida Building Code). Where a system has
// no detailed record here, the certifications page falls back to the summary
// approvals in systems.ts.
//
// Do not invent FL numbers, revisions, drawing refs or eval reports. Every value
// below is transcribed from the verified register.

export type CertConfig = {
  fl: string; // individual configuration number, e.g. "FL26935.1"
  config: string; // operation / configuration
  hvhz: boolean;
  impact: "Large Missile" | "Non-Impact";
  dp?: string; // design pressure
  install?: string; // installation drawing ref
  evalReport?: string; // evaluation report ref
  namiCert?: string; // NAMI certificate no. where carried
  qaExpiry?: string; // QA contract expiration on record
};

export type CertSystem = {
  slug: string;
  applications: string[]; // governing FL applications
  holder: string;
  agency: string;
  method: string;
  engineer: string;
  codeEdition: string;
  standardsImpact: string[];
  standardsNonImpact: string[];
  supplyNote?: string; // who holds / who supplies
  configs: CertConfig[];
};

const STD_IMPACT = [
  "AAMA/WDMA/CSA 101/I.S.2/A440",
  "ASTM E1886 — Large missile impact",
  "ASTM E1996 — Wind-borne debris",
  "TAS 201 — Large missile impact",
  "TAS 202 — Uniform static air pressure",
  "TAS 203 — Cyclic wind pressure",
  "ASTM E283 / E330 / E331 — Air · structural · water",
];

const STD_NONIMPACT = [
  "AAMA/WDMA/CSA 101/I.S.2/A440",
  "ASTM E283 — Air infiltration",
  "ASTM E330 — Structural load",
  "ASTM E331 — Water penetration",
];

export const CERT_SYSTEMS: Record<string, CertSystem> = {
  "76md": {
    slug: "76md",
    applications: ["FL26935-R6", "FL26936-R5", "FL26937-R5"],
    holder: "Kömmerling USA Inc., Huntsville AL",
    agency: "Keystone Certifications",
    method: "Certification Method 1, Option A",
    engineer: "Robert J. Amoruso, FL PE 49752",
    codeEdition: "2023 Florida Building Code",
    standardsImpact: STD_IMPACT,
    standardsNonImpact: STD_NONIMPACT,
    supplyNote:
      "Florida Product Approvals for the 76 MD / 76 AD systems are held by Kömmerling USA Inc. VALDA supplies and installs these systems; it does not hold the approvals in its own name.",
    configs: [
      // Impact / HVHZ
      { fl: "FL26935.1", config: "76 MD Tilt & Turn — single", hvhz: true, impact: "Large Missile", dp: "±65 psf", install: "NL-0098", evalReport: "ACE-1003 Rev2", qaExpiry: "10/04/2028" },
      { fl: "FL26935.2", config: "76 MD Tilt & Turn — double", hvhz: true, impact: "Large Missile", dp: "±65 psf", install: "NL-0099", evalReport: "ACE-1004 Rev2", qaExpiry: "10/04/2028" },
      { fl: "FL26936.1", config: "76 MD Picture / Fixed", hvhz: true, impact: "Large Missile", dp: "+75 / −75 psf", install: "NL-0100", evalReport: "ACE-1005 Rev2", qaExpiry: "10/04/2028" },
      { fl: "FL26937.1", config: "76 MD Balcony Door", hvhz: true, impact: "Large Missile", dp: "±65 psf", install: "NL-0101", evalReport: "ACE-1006 Rev2", qaExpiry: "10/04/2028" },
      // Non-impact, outside HVHZ
      { fl: "FL26935.3", config: "HADK 76 MD Tilt & Turn — single", hvhz: false, impact: "Non-Impact", dp: "Per installation drawing", install: "NL-0137", evalReport: "ACE-1024 Rev2", qaExpiry: "28/08/2027" },
      { fl: "FL26935.4", config: "HADKZ 76 MD — double, false mullion", hvhz: false, impact: "Non-Impact", dp: "Per installation drawing", install: "NL-0137", evalReport: "ACE-1024 Rev2", qaExpiry: "28/08/2027" },
      { fl: "FL26935.5", config: "HADKZ 76 MD — double, fixed mullion", hvhz: false, impact: "Non-Impact", dp: "Per installation drawing", install: "NL-0137", evalReport: "ACE-1024 Rev2", qaExpiry: "31/08/2027" },
      { fl: "FL26935.6", config: "HADKZ 76 MD — transom, fixed mullion", hvhz: false, impact: "Non-Impact", dp: "Per installation drawing", install: "NL-0138", evalReport: "ACE-1025 Rev2", qaExpiry: "31/08/2027" },
      { fl: "FL26935.7", config: "HADKZ 76 MD — transom, field mullion", hvhz: false, impact: "Non-Impact", dp: "Per installation drawing", install: "NL-0138", evalReport: "ACE-1025 Rev2", qaExpiry: "31/08/2027" },
      { fl: "FL26937.2", config: "76 AD Inswing Entry Door", hvhz: false, impact: "Non-Impact", dp: "±50 psf", install: "SCS-0047", evalReport: "ACE-1162", qaExpiry: "02/09/2029" },
      { fl: "FL26937.3", config: "76 AD Outswing Entry Door", hvhz: false, impact: "Non-Impact", dp: "±50 psf", install: "SCS-0049", evalReport: "ACE-1164", qaExpiry: "02/09/2029" },
      { fl: "FL26937.4", config: "76 MD Inswing Entry Door", hvhz: false, impact: "Non-Impact", dp: "±50 psf" },
    ],
  },
};

export function certSystem(slug: string): CertSystem | null {
  return CERT_SYSTEMS[slug] ?? null;
}
