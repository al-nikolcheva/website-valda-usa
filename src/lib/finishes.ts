// Colour and finish ranges per system.
//
// Kömmerling 76 colours are applied as Renolit surface foils over the white PVC
// core, or as solid through-colour where noted. RAL references are given where
// the finish maps to a standard RAL. Hex values are screen approximations for
// layout only. Final colour must be confirmed against a physical foil sample
// before order. The full Renolit foil range is available on request.

export type Finish = {
  name: string;
  ral?: string;
  hex: string;
  kind: "Solid" | "Foil" | "Woodgrain";
  note?: string;
};

export type FinishGroup = {
  group: string;
  blurb: string;
  finishes: Finish[];
};

export type SystemFinishes = {
  slug: string;
  intro: string;
  substrate: string;
  groups: FinishGroup[];
  dualColourNote?: string;
};

export const SYSTEM_FINISHES: Record<string, SystemFinishes> = {
  "76md": {
    slug: "76md",
    substrate: "White PVC core, Renolit surface foil or solid through-colour",
    intro:
      "The 76 MD system takes colour as a Renolit surface foil bonded to the profile, or as a solid through-colour on white. Any RAL is available to order. Woodgrain foils carry a textured surface. Dual-colour is standard: one finish outside, another inside.",
    dualColourNote:
      "Dual-colour configurations pair any exterior finish with any interior finish, including white inside with anthracite or a woodgrain outside.",
    groups: [
      {
        group: "Solid",
        blurb: "Through-colour and plain foils. The default palette for contemporary facades.",
        finishes: [
          { name: "White", ral: "RAL 9016", hex: "#F4F4F0", kind: "Solid", note: "Standard core colour" },
          { name: "Cream", ral: "RAL 9001", hex: "#E8DFCB", kind: "Foil" },
          { name: "Pebble Grey", ral: "RAL 7032", hex: "#C6BFA8", kind: "Foil" },
          { name: "Window Grey", ral: "RAL 7040", hex: "#9EA3A5", kind: "Foil" },
          { name: "Quartz Grey", ral: "RAL 7039", hex: "#6C695E", kind: "Foil" },
        ],
      },
      {
        group: "Anthracite & greys",
        blurb: "The most specified range on US multifamily and coastal projects.",
        finishes: [
          { name: "Silver Grey", ral: "RAL 7001", hex: "#8F979A", kind: "Foil" },
          { name: "Basalt Grey", ral: "RAL 7012", hex: "#4E5451", kind: "Foil" },
          { name: "Slate Grey", ral: "RAL 7015", hex: "#434A4F", kind: "Foil" },
          { name: "Anthracite Grey", ral: "RAL 7016", hex: "#31373B", kind: "Foil", note: "Smooth and fine-texture" },
          { name: "Anthracite Grey (matt)", ral: "RAL 7016", hex: "#2C3134", kind: "Foil" },
        ],
      },
      {
        group: "Dark",
        blurb: "Deep tones for high-contrast and heritage schemes.",
        finishes: [
          { name: "Black Brown", ral: "RAL 8022", hex: "#241E1D", kind: "Foil" },
          { name: "Jet Black", ral: "RAL 9005", hex: "#0E0E0E", kind: "Foil" },
        ],
      },
      {
        group: "Woodgrain",
        blurb: "Textured foils with a woodgrain surface, inside, outside, or both.",
        finishes: [
          { name: "Golden Oak", hex: "#8A5A2B", kind: "Woodgrain" },
          { name: "Winchester Oak", hex: "#9C7A4E", kind: "Woodgrain" },
          { name: "Irish Oak", hex: "#5E4326", kind: "Woodgrain" },
          { name: "Turner Oak", hex: "#6B4A2C", kind: "Woodgrain" },
          { name: "Dark Oak", hex: "#3B2416", kind: "Woodgrain" },
          { name: "Mahogany", hex: "#5A2A20", kind: "Woodgrain" },
          { name: "Walnut", hex: "#4A3222", kind: "Woodgrain" },
        ],
      },
    ],
  },
};

export function systemFinishes(slug: string): SystemFinishes | null {
  return SYSTEM_FINISHES[slug] ?? null;
}
