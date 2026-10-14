// Profile sections. One parametric template per family of profile so every
// system is drawn the same way; dimensions come from catalog.ts. The Kömmerling
// 76 MD section is the real one, extracted from the manufacturer DXF.
import { readFileSync } from "fs";
import { part, rect, type Part, type Pt } from "./geometry";

export type Material = "alu" | "pvc";

/** A frame + opening vent (casement, tilt & turn, door) section. */
export interface CasementSection {
  frame: Part[];
  vent: Part[];
  /** u where the glass starts (measured from the frame's outer edge) */
  glassEdge: number;
  panes: [number, number][];
  /** interior face of the vent (z) — where handles and hinges sit */
  ventFace: number;
  /** u of the middle of the vent's visible face */
  ventMid: number;
}

/** Split a glazing build-up into panes: `n` panes of thickness t across total G starting at z0. */
export function glazing(z0: number, G: number, n: 2 | 3, t = n === 3 ? 4 : 6) {
  const gap = (G - n * t) / (n - 1);
  return Array.from({ length: n }, (_, i) => [z0 + i * (t + gap), z0 + i * (t + gap) + t] as [number, number]);
}

/** Spacers sit in each cavity, just inside the glass edge. */
function spacers(panes: [number, number][], edge: number): Part[] {
  return panes.slice(1).map(([z0], i) => part("spacer", rect(edge, panes[i][1], edge + 12, z0)));
}

/** Steel reinforcement filling a chamber, held 1 mm off its walls. */
function steelIn(c: Pt[]): Part {
  const [[x0, y0], , [x1, y1]] = c;
  return part("steel", rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1), [rect(x0 + 2.5, y0 + 2.5, x1 - 2.5, y1 - 2.5)]);
}

/** Chambers for a PVC wall: n columns across the depth, inside a u band. */
function chambers(u0: number, u1: number, v0: number, v1: number, n: number, wall = 2.5): Pt[][] {
  const w = (v1 - v0 - wall * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => rect(u0, v0 + i * (w + wall), u1, v0 + i * (w + wall) + w));
}

/**
 * Parametric casement section.
 *  D  frame depth, V  vent depth (vent stands proud of the frame by V − D + 12 inside),
 *  G  glazing thickness, n  panes, s  scales the visible face widths (slim systems < 1).
 * Aluminium: two shells joined by polyamide strips with foam between.
 * PVC: one multi-chamber body with steel in the main chamber.
 */
export function casement(o: { mat: Material; D: number; V: number; G: number; n: 2 | 3; s?: number }): CasementSection {
  const { mat, D, V, n } = o;
  const s = o.s ?? 1;
  const u = (x: number) => x * s;
  const vent0 = 12; // vent's exterior face sits behind the frame's exterior stop
  const G = Math.min(o.G, V - vent0 - 22);
  const gz = vent0 + 10; // glass starts behind the vent's exterior glazing lip
  const panes = glazing(gz, G, n);
  const glassEdge = u(82);
  const frame: Part[] = [];
  const vent: Part[] = [];

  if (mat === "alu") {
    const a = 0.39 * D, b = 0.61 * D;
    frame.push(
      part("ext", [[0, 0], [u(52), 0], [u(52), 8], [u(40), 8], [u(40), a], [0, a]], [rect(3, 3, u(40) - 3, a - 3)]),
      part("polyamide", rect(u(6), a, u(12), b)),
      part("polyamide", rect(u(28), a, u(34), b)),
      part("foam", rect(u(12), a + 1, u(28), b - 1)),
      part("int", rect(0, b, u(40), D), [rect(3, b + 3, u(40) - 3, D - 3)]),
    );
    const va = vent0 + 0.33 * (V - vent0), vb = vent0 + 0.54 * (V - vent0);
    vent.push(
      part("ext", [[u(42), vent0], [u(96), vent0], [u(96), gz - 1], [u(80), gz - 1], [u(80), va], [u(42), va]], [rect(u(42) + 3, vent0 + 3, u(80) - 3, va - 3)]),
      part("polyamide", rect(u(48), va, u(54), vb)),
      part("polyamide", rect(u(68), va, u(74), vb)),
      part("foam", rect(u(54), va + 1, u(68), vb - 1)),
      part("int", rect(u(42), vb, u(80), V), [rect(u(42) + 3, vb + 3, u(80) - 3, V - 3)]),
    );
  } else {
    frame.push(
      part("ext", [[0, 0], [u(52), 0], [u(52), 8], [u(40), 8], [u(40), D], [0, D]], chambers(3, u(40) - 3, 3, D - 3, D > 80 ? 5 : 4)),
    );
    frame.push(steelIn(chambers(3, u(40) - 3, 3, D - 3, D > 80 ? 5 : 4)[1]));
    vent.push(
      part("ext", [[u(42), vent0], [u(96), vent0], [u(96), gz - 1], [u(80), gz - 1], [u(80), V], [u(42), V]], chambers(u(42) + 3, u(80) - 3, vent0 + 3, V - 3, 4)),
    );
    vent.push(steelIn(chambers(u(42) + 3, u(80) - 3, vent0 + 3, V - 3, 4)[2]));
  }
  // weather gaskets, glazing bead and gaskets, IGU spacers — shared by both materials
  frame.push(part("gasket", rect(u(45), 8, u(51), vent0)));
  const beadZ = panes[panes.length - 1][1];
  vent.push(
    part("gasket", rect(u(40), 0.45 * D, u(42), 0.45 * D + 8)),
    part("gasket", rect(u(86), gz - 1, u(96), gz)),
    part(mat === "alu" ? "int" : "ext", rect(u(80), beadZ, u(98), V), [rect(u(83), beadZ + 3, u(95), V - 3)]),
    part("gasket", rect(u(98), beadZ - 1, u(100), beadZ + 3)),
    ...spacers(panes, glassEdge),
  );
  return { frame, vent, glassEdge, panes, ventFace: V, ventMid: u(61) };
}

/** The real Kömmerling 76 MD section (frame 76171, sash 76271, bead 76507, steel V306/V309). */
export function koemmerling76md(): CasementSection & { size: [number, number] } {
  const raw = JSON.parse(readFileSync(new URL("sections/76md.json", import.meta.url), "utf8")) as {
    size: [number, number];
    glassEdge: number;
    panes: [number, number][];
    parts: { group: "frame" | "vent"; mat: "body" | "steel" | "gasket" | "spacer"; outer: Pt[]; holes: Pt[][] }[];
  };
  const mat = { body: "ext", steel: "steel", gasket: "gasket", spacer: "spacer" } as const;
  const pick = (g: "frame" | "vent") => raw.parts.filter((p) => p.group === g).map((p) => part(mat[p.mat], p.outer, p.holes));
  return { frame: pick("frame"), vent: pick("vent"), glassEdge: raw.glassEdge, panes: raw.panes, ventFace: 94, ventMid: 77, size: raw.size };
}

/** Sliding / lift & slide: an outer track frame and the panel (leaf) section. */
export interface SlidingSection {
  frame: Part[];
  panel: Part[];
  /** track centre depths (z), exterior first */
  tracks: [number, number];
  /** how far panels run inside the frame channel (u) */
  inset: number;
  panelFace: number;
  glassEdge: number;
  /** panes relative to the panel's exterior face */
  panes: [number, number][];
  P: number;
}

/**
 *  D  frame depth, P  panel depth, G  glazing, n  panes, face  visible panel width,
 *  interlock  overlap where the two panels meet.
 */
export function sliding(o: { mat: Material; D: number; P: number; G: number; n: 2 | 3; face: number; frameFace?: number }): SlidingSection {
  const { mat, D, P, face } = o;
  const fw = o.frameFace ?? 50;
  const gap = Math.max(4, (D - 2 * P - 12) / 3);
  const tracks: [number, number] = [6 + gap + P / 2, D - 6 - gap - P / 2];
  const frame: Part[] = [];
  if (mat === "alu") {
    const m = D / 2;
    frame.push(
      // base + exterior wall + exterior rail
      part("ext", [[0, 0], [fw, 0], [fw, 5], [6, 5], [6, m - 6], [0, m - 6]]),
      part("ext", rect(6, tracks[0] - 2, 18, tracks[0] + 2)),
      part("polyamide", rect(0, m - 6, 6, m + 6)),
      part("int", [[0, m + 6], [6, m + 6], [6, D - 5], [fw, D - 5], [fw, D], [0, D]]),
      part("int", rect(6, tracks[1] - 2, 18, tracks[1] + 2)),
    );
  } else {
    frame.push(part("ext", [[0, 0], [fw, 0], [fw, 5], [8, 5], [8, D - 5], [fw, D - 5], [fw, D], [0, D]], chambers(2, 6, 2, D - 2, Math.max(4, Math.round(D / 30)), 2)));
    frame.push(part("ext", rect(8, tracks[0] - 3, 20, tracks[0] + 3)), part("ext", rect(8, tracks[1] - 3, 20, tracks[1] + 3)));
  }
  const inset = 10;
  const panes = glazing((P - o.G) / 2, o.G, o.n);
  const glassEdge = face - 14;
  const panel: Part[] = [];
  if (mat === "alu") {
    const a = P * 0.4, b = P * 0.6;
    panel.push(
      part("ext", [[0, 0], [face, 0], [face, panes[0][0] - 1], [glassEdge, panes[0][0] - 1], [glassEdge, a], [0, a]], [rect(3, 3, glassEdge - 3, a - 3)]),
      part("polyamide", rect(6, a, 12, b)),
      part("polyamide", rect(glassEdge - 12, a, glassEdge - 6, b)),
      part("foam", rect(12, a + 1, glassEdge - 12, b - 1)),
      part("int", [[0, b], [glassEdge, b], [glassEdge, panes[panes.length - 1][1] + 1], [face, panes[panes.length - 1][1] + 1], [face, P], [0, P]], [rect(3, b + 3, glassEdge - 3, P - 3)]),
    );
  } else {
    panel.push(
      part("ext", [[0, 0], [face, 0], [face, panes[0][0] - 1], [glassEdge, panes[0][0] - 1], [glassEdge, panes[panes.length - 1][1] + 1], [face, panes[panes.length - 1][1] + 1], [face, P], [0, P]], chambers(3, glassEdge - 3, 3, P - 3, 4)),
    );
    panel.push(steelIn(chambers(3, glassEdge - 3, 3, P - 3, 4)[1]));
  }
  panel.push(
    part("gasket", rect(face - 1, panes[0][0] - 1, face + 2, panes[0][0] + 1)),
    part("gasket", rect(face - 1, panes[panes.length - 1][1] - 1, face + 2, panes[panes.length - 1][1] + 1)),
    ...spacers(panes, glassEdge),
  );
  return { frame, panel, tracks, inset, panelFace: face, glassEdge, panes, P };
}

/** Folding leaves: a door frame and a leaf section (same template as a casement vent, flush). */
export function folding(o: { D: number; G: number; n: 2 | 3; face: number }) {
  const { D, face } = o;
  const frame = casement({ mat: "alu", D, V: D + 9, G: o.G, n: o.n }).frame;
  const leafSection = sliding({ mat: "alu", D: 2 * D + 20, P: D, G: o.G, n: o.n, face });
  return { frame, leaf: leafSection.panel, panes: leafSection.panes, glassEdge: leafSection.glassEdge, P: D, frameFace: 52 };
}

/**
 * Stick curtain wall: mullion/transom box behind the glass, pressure plate and
 * cap on the outside. u is centred on the member (−w/2..w/2).
 */
export function curtainWall(o: { w: number; Dm: number; G: number; n: 2 | 3 }) {
  const { w, Dm, G } = o;
  const h = w / 2;
  const glassZ = 22;
  const back = glassZ + G;
  const member: Part[] = [
    part("ext", rect(-h, 0, h, 14), [rect(-h + 3, 3, h - 3, 11)]), // cover cap
    part("ext", rect(-h + 6, 14, h - 6, 18)), // pressure plate
    part("polyamide", rect(-8, 18, 8, back)), // isolator through the glass line
    part("gasket", rect(-h + 2, 18, -12, glassZ)),
    part("gasket", rect(12, 18, h - 2, glassZ)),
    part("gasket", rect(-h + 2, back, -12, back + 4)),
    part("gasket", rect(12, back, h - 2, back + 4)),
    part("int", rect(-h, back + 4, h, back + 4 + Dm), [rect(-h + 3, back + 7, h - 3, back + 1 + Dm)]),
  ];
  return { member, panes: glazing(glassZ, G, o.n), w, depth: back + 4 + Dm, innerFace: back + 4 + Dm };
}
