// Geometry kernel for the system models: sweeps 2D profile sections into mitred
// frame members, plus boxes for glass and hardware. Everything is built in mm in
// a window-local frame: x across, y up, z through the depth (0 = exterior face,
// +z toward the interior). Triangles are bucketed per material for the GLB writer.
import { Matrix4, ShapeUtils, Vector2, Vector3 } from "three";

export type Pt = [number, number];
export type Mat =
  | "ext" // exterior shell (aluminium) or the whole PVC body
  | "int" // interior shell (aluminium) — same as ext for PVC
  | "polyamide"
  | "foam"
  | "steel"
  | "gasket"
  | "spacer"
  | "glass"
  | "hardware";

/** One closed region of a profile section: u = inward from the outer edge, v = depth. */
export interface Part {
  mat: Mat;
  outer: Pt[];
  holes: Pt[][];
}

export const rect = (u0: number, v0: number, u1: number, v1: number): Pt[] => [
  [u0, v0],
  [u1, v0],
  [u1, v1],
  [u0, v1],
];
export const part = (mat: Mat, outer: Pt[], holes: Pt[][] = []): Part => ({ mat, outer, holes });

const area = (p: Pt[]) => p.reduce((s, [x, y], i) => s + x * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * y, 0) / 2;
const orient = (p: Pt[], ccw: boolean) => ((area(p) > 0) === ccw ? p : [...p].reverse());

export class Model {
  readonly tris = new Map<Mat, number[]>();
  private stack: Matrix4[] = [new Matrix4()];

  get m() {
    return this.stack[this.stack.length - 1];
  }
  /** Run `fn` with an extra local transform applied. */
  with(local: Matrix4, fn: () => void) {
    this.stack.push(this.m.clone().multiply(local));
    fn();
    this.stack.pop();
  }

  private push(mat: Mat, a: number[], b: number[], c: number[]) {
    const list = this.tris.get(mat) ?? [];
    for (const p of [a, b, c]) {
      const v = new Vector3(p[0], p[1], p[2]).applyMatrix4(this.m);
      list.push(v.x, v.y, v.z);
    }
    this.tris.set(mat, list);
  }

  /**
   * Sweep a section along local +x for length L. Mitred ends are cut at 45°
   * (a point at depth u into the section is shortened by u at that end), so
   * four members meet cleanly at the corners of a rectangle.
   */
  sweep(p: Part, L: number, mitreStart = true, mitreEnd = true) {
    const xs = (u: number) => (mitreStart ? u : 0);
    const xe = (u: number) => (mitreEnd ? L - u : L);
    const outer = orient(p.outer, true);
    const holes = p.holes.map((h) => orient(h, false));
    for (const loop of [outer, ...holes]) {
      for (let i = 0; i < loop.length; i++) {
        const [u0, v0] = loop[i];
        const [u1, v1] = loop[(i + 1) % loop.length];
        const a = [xs(u0), u0, v0], b = [xs(u1), u1, v1], c = [xe(u1), u1, v1], d = [xe(u0), u0, v0];
        this.push(p.mat, a, b, c);
        this.push(p.mat, a, c, d);
      }
    }
    const all = [...outer, ...holes.flat()];
    const faces = ShapeUtils.triangulateShape(
      outer.map(([u, v]) => new Vector2(u, v)),
      holes.map((h) => h.map(([u, v]) => new Vector2(u, v))),
    );
    for (const [i, j, k] of faces) {
      const s = (n: number) => [xs(all[n][0]), all[n][0], all[n][1]];
      const e = (n: number) => [xe(all[n][0]), all[n][0], all[n][1]];
      // caps face -x at the start and +x at the end
      const ccw = (all[j][0] - all[i][0]) * (all[k][1] - all[i][1]) - (all[j][1] - all[i][1]) * (all[k][0] - all[i][0]) > 0;
      if (ccw) {
        this.push(p.mat, s(i), s(k), s(j));
        this.push(p.mat, e(i), e(j), e(k));
      } else {
        this.push(p.mat, s(i), s(j), s(k));
        this.push(p.mat, e(i), e(k), e(j));
      }
    }
  }

  /**
   * Members around a W×H rectangle whose outer bottom-left corner is the local
   * origin. `sides` picks bottom/right/top/left (0..3); the section's u axis
   * points into the rectangle.
   */
  ring(parts: Part[], W: number, H: number, sides = [0, 1, 2, 3]) {
    for (const i of sides) {
      const [L, m] = ringSide(i, W, H);
      this.with(m, () => parts.forEach((p) => this.sweep(p, L)));
    }
  }

  /** A straight member with square ends: runs along `dir` ("x" or "y") from the local origin. */
  bar(parts: Part[], L: number, dir: "x" | "y") {
    const m = dir === "x" ? new Matrix4() : basis([0, 1, 0], [-1, 0, 0], [0, 0, 0]);
    this.with(m, () => parts.forEach((p) => this.sweep(p, L, false, false)));
  }

  box(mat: Mat, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
    const v = (x: number, y: number, z: number) => [x, y, z];
    const P = [v(x0, y0, z0), v(x1, y0, z0), v(x1, y1, z0), v(x0, y1, z0), v(x0, y0, z1), v(x1, y0, z1), v(x1, y1, z1), v(x0, y1, z1)];
    const quads = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]];
    for (const [a, b, c, d] of quads) {
      this.push(mat, P[a], P[b], P[c]);
      this.push(mat, P[a], P[c], P[d]);
    }
  }

  /** Glass panes of an insulating unit spanning x0..x1, y0..y1. */
  panes(panes: [number, number][], x0: number, y0: number, x1: number, y1: number) {
    for (const [z0, z1] of panes) this.box("glass", x0, y0, z0, x1, y1, z1);
  }

  /** Lever handle on the interior face at z, pointing down. */
  handle(x: number, y: number, z: number, scale = 1) {
    this.box("hardware", x - 16 * scale, y - 40 * scale, z, x + 16 * scale, y + 40 * scale, z + 10);
    this.box("hardware", x - 11 * scale, y - 150 * scale, z + 8, x + 11 * scale, y + 10, z + 24);
  }

  hinge(x: number, y: number, z: number, h = 70) {
    this.box("hardware", x - 8, y - h / 2, z, x + 8, y + h / 2, z + 14);
  }
}

export function basis(x: number[], u: number[], pos: number[]) {
  return new Matrix4()
    .makeBasis(new Vector3(...x), new Vector3(...u), new Vector3(0, 0, 1))
    .setPosition(new Vector3(...pos));
}

function ringSide(i: number, W: number, H: number): [number, Matrix4] {
  switch (i) {
    case 0:
      return [W, basis([1, 0, 0], [0, 1, 0], [0, 0, 0])];
    case 1:
      return [H, basis([0, 1, 0], [-1, 0, 0], [W, 0, 0])];
    case 2:
      return [W, basis([-1, 0, 0], [0, -1, 0], [W, H, 0])];
    default:
      return [H, basis([0, -1, 0], [1, 0, 0], [0, H, 0])];
  }
}

export const translate = (x: number, y: number, z = 0) => new Matrix4().makeTranslation(x, y, z);
export const rotY = (a: number, px: number, pz: number) =>
  translate(px, 0, pz).multiply(new Matrix4().makeRotationY(a)).multiply(translate(-px, 0, -pz));
