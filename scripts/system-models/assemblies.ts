// Opening types: how frames, vents, panels and glass are put together. Each
// takes a section from sections.ts so every system of a type is built alike.
import { Matrix4 } from "three";
import { translate, type Model, type Part } from "./geometry";
import type { CasementSection, SlidingSection } from "./sections";

const rotYAbout = (a: number, x: number, z: number) =>
  translate(x, 0, z).multiply(new Matrix4().makeRotationY(a)).multiply(translate(-x, 0, -z));

/** Tilt & turn, casement or door: frame, one vent, glass, handle and hinges. Hinges on the left. */
export function casementUnit(m: Model, s: CasementSection, W: number, H: number, o: { door?: boolean; hinge?: "left" | "right" } = {}) {
  const right = o.hinge === "right";
  m.ring(s.frame, W, H);
  m.ring(s.vent, W, H);
  const e = s.glassEdge;
  m.panes(s.panes, e, e, W - e, H - e);
  const hx = right ? s.ventMid : W - s.ventMid;
  const kx = right ? W - s.ventMid * 0.8 : s.ventMid * 0.8;
  m.handle(hx, o.door ? 1050 : H * 0.5, s.ventFace, o.door ? 1.15 : 1);
  const hinges = o.door ? [250, H / 2, H - 250] : [140, H - 140];
  for (const y of hinges) m.hinge(kx, y, s.ventFace, o.door ? 110 : 70);
}

/** Two vents side by side (double tilt & turn), hinged on the outer jambs. */
export function doubleCasement(m: Model, s: CasementSection, W: number, H: number) {
  casementUnit(m, s, W / 2, H, { hinge: "left" });
  m.with(translate(W / 2, 0), () => casementUnit(m, s, W / 2, H, { hinge: "right" }));
}

/**
 * Two-panel sliding door (XO): fixed panel on the exterior track, sliding panel
 * on the interior track shown part-open.
 */
export function slidingUnit(m: Model, s: SlidingSection, W: number, H: number, o: { open?: number; lift?: boolean } = {}) {
  m.ring(s.frame, W, H);
  const pw = (W - 2 * s.inset + s.panelFace) / 2;
  const ph = H - 2 * s.inset;
  const e = s.glassEdge;
  const panel = (x: number, track: number, handle: boolean) =>
    m.with(translate(x, s.inset, track - s.P / 2), () => {
      m.ring(s.panel, pw, ph);
      m.panes(s.panes, e, e, pw - e, ph - e);
      if (handle) m.handle(pw - s.panelFace / 2, o.lift ? 1100 : ph * 0.45, s.P, o.lift ? 1.5 : 1.1);
    });
  panel(s.inset, s.tracks[0], false);
  panel(W - s.inset - pw - (o.open ?? 0.35) * pw, s.tracks[1], true);
}

/** Folding door: four leaves, the first pair folded part-way open toward the interior. */
export function foldingUnit(m: Model, f: { frame: Part[]; leaf: Part[]; panes: [number, number][]; glassEdge: number; P: number; frameFace: number }, W: number, H: number, leaves = 4) {
  m.ring(f.frame, W, H);
  const inset = 44;
  const lw = (W - 2 * inset) / leaves;
  const lh = H - 2 * inset;
  const z0 = 10;
  const a = (32 * Math.PI) / 180;
  const leaf = () => {
    m.ring(f.leaf, lw, lh);
    m.panes(f.panes, f.glassEdge, f.glassEdge, lw - f.glassEdge, lh - f.glassEdge);
  };
  const zi = z0 + f.P; // interior face: the folding hinges
  // leaf 1 swings in from the jamb, leaf 2 folds back against it
  m.with(rotYAbout(-a, inset, zi).multiply(translate(inset, inset, z0)), leaf);
  const ex = inset + lw * Math.cos(a), ez = zi + lw * Math.sin(a);
  m.with(translate(ex - inset, 0, ez - zi).multiply(rotYAbout(a, inset, zi)).multiply(translate(inset, inset, z0)), leaf);
  for (let i = 2; i < leaves; i++) m.with(translate(inset + i * lw, inset, z0), leaf);
  for (let i = 3; i < leaves; i += 2) for (const y of [H * 0.2, H * 0.8]) m.hinge(inset + i * lw, y, zi, 90);
  m.handle(W - inset - 30, H * 0.45, zi, 1.1);
}

/** Stick curtain wall: full-height mullions, transoms between them, glass in every bay. */
export function curtainWall(m: Model, c: { member: Part[]; panes: [number, number][]; w: number }, cols: number, rows: number, bw: number, bh: number) {
  const W = cols * bw, H = rows * bh, h = c.w / 2;
  for (let i = 0; i <= cols; i++) m.with(translate(i * bw + h, 0), () => m.bar(c.member, H, "y"));
  for (let i = 0; i < cols; i++)
    for (let j = 0; j <= rows; j++) {
      const y = j === 0 ? h : j === rows ? H - h : j * bh;
      m.with(translate(i * bw + h, y), () => m.bar(c.member, bw, "x"));
    }
  const g = h - 10; // glass edge sits behind the cap
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const y0 = j === 0 ? h : j * bh, y1 = j === rows - 1 ? H - h : (j + 1) * bh;
      m.panes(c.panes, i * bw + h + g, y0 + g, (i + 1) * bw + h - g, y1 - g);
    }
  return { W: W + c.w, H };
}

/** Unitised window wall: every bay is its own framed unit, so mullions read as split pairs. */
export function windowWall(m: Model, p: SlidingSection, cols: number, rows: number, bw: number, bh: number) {
  const gap = 6;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      m.with(translate(i * (bw + gap), j * (bh + gap)), () => {
        m.ring(p.panel, bw, bh);
        m.panes(p.panes, p.glassEdge, p.glassEdge, bw - p.glassEdge, bh - p.glassEdge);
      });
}
