import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ── Palette (matches src/components/iso) ───────────────────── */
export const EDGE = 0x3a3a3d;
export const ACCENT = 0x1f4e8c;
const GLASS = 0xeef1f4;
const ACCENT_GLASS = 0xc9d7ea;
const STEEL = 0xe6e6e8;

export type Style = "frame" | "steel" | "accent" | "glass" | "accentGlass";

/* ── Timeline helpers ───────────────────────────────────────── */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** eased 0→1 progress of t between a and b */
export const seg = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));
/** linear 0→1 progress of t between a and b */
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, s: number) => a + (b - a) * s;

/** Small deterministic PRNG (mulberry32), so every replay looks identical. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Scene contract ─────────────────────────────────────────── */
export interface StageLabel {
  text: string;
  p: THREE.Vector3;
  show: boolean;
  accent?: boolean;
  /** "top": centred above the point (default). "right": to the right of the point. */
  align?: "top" | "right";
}
export interface StageStep {
  label: string;
  start: number;
  end: number;
}
export interface StageFrame {
  caption: string;
  hud?: string;
}
export interface StageBuild {
  root: THREE.Group;
  bounds: THREE.Box3;
  steps: StageStep[];
  labels: StageLabel[];
  update: (t: number) => StageFrame;
}

/* ── Kit: shared materials, everything disposed together ────── */
const poly = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };

export class Kit {
  private owned: { dispose: () => void }[] = [];
  private cache = new Map<string, { box: THREE.BoxGeometry; edges: THREE.EdgesGeometry }>();
  readonly fill: Record<Style, THREE.Material>;
  readonly line: Record<Style, THREE.LineBasicMaterial>;
  readonly crack: THREE.LineBasicMaterial;
  readonly solid: THREE.MeshBasicMaterial;

  constructor() {
    const frame = new THREE.MeshLambertMaterial({ color: 0xffffff, ...poly });
    const steel = new THREE.MeshLambertMaterial({ color: STEEL, ...poly });
    const glass = new THREE.MeshLambertMaterial({ color: GLASS, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, ...poly });
    const accentGlass = new THREE.MeshLambertMaterial({ color: ACCENT_GLASS, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, ...poly });
    const lf = new THREE.LineBasicMaterial({ color: EDGE });
    const lg = new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.7 });
    const la = new THREE.LineBasicMaterial({ color: ACCENT });
    this.crack = new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.8 });
    this.solid = new THREE.MeshBasicMaterial({ color: ACCENT });
    this.fill = { frame, steel, accent: frame, glass, accentGlass };
    this.line = { frame: lf, steel: lf, accent: la, glass: lg, accentGlass: la };
    this.owned.push(frame, steel, glass, accentGlass, lf, lg, la, this.crack, this.solid);
  }

  own<T extends { dispose: () => void }>(x: T): T {
    this.owned.push(x);
    return x;
  }

  /** Animated box (own mesh). Min corner (x, y), centre depth z. */
  box(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, style: Style) {
    const key = `${w.toFixed(4)}|${h.toFixed(4)}|${d.toFixed(4)}`;
    let g = this.cache.get(key);
    if (!g) {
      const box = new THREE.BoxGeometry(w, h, d);
      g = { box, edges: new THREE.EdgesGeometry(box) };
      this.cache.set(key, g);
    }
    const mesh = new THREE.Mesh(g.box, this.fill[style]);
    mesh.add(new THREE.LineSegments(g.edges, this.line[style]));
    mesh.position.set(x + w / 2, y + h / 2, z);
    parent.add(mesh);
    return mesh;
  }

  dispose() {
    for (const g of this.cache.values()) {
      g.box.dispose();
      g.edges.dispose();
    }
    this.cache.clear();
    this.owned.forEach((d) => d.dispose());
    this.owned = [];
  }
}

/* ── Static: collects parts and merges them into one mesh + one line set per style ── */
const Z_AXIS = new THREE.Vector3(0, 0, 1);

export class Static {
  private parts = new Map<Style, { fills: THREE.BufferGeometry[]; edges: THREE.BufferGeometry[] }>();

  add(geo: THREE.BufferGeometry, m: THREE.Matrix4, style: Style, threshold = 20) {
    geo.applyMatrix4(m);
    const edges = new THREE.EdgesGeometry(geo, threshold);
    const flat = geo.index ? geo.toNonIndexed() : geo;
    if (flat !== geo) geo.dispose();
    let p = this.parts.get(style);
    if (!p) {
      p = { fills: [], edges: [] };
      this.parts.set(style, p);
    }
    p.fills.push(flat);
    p.edges.push(edges);
  }

  /** Box, min corner (x, y), centre depth z. */
  box(w: number, h: number, d: number, x: number, y: number, z: number, style: Style) {
    const m = new THREE.Matrix4().makeTranslation(x + w / 2, y + h / 2, z);
    this.add(new THREE.BoxGeometry(w, h, d), m, style);
  }

  /** Square-section member between two points. */
  beam(a: THREE.Vector3, b: THREE.Vector3, t: number, style: Style) {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(Z_AXIS, dir.normalize());
    const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
    this.add(new THREE.BoxGeometry(t, t, len), m, style);
  }

  /** Cylinder centred at (x, y, z) along an axis. */
  cyl(r: number, len: number, x: number, y: number, z: number, axis: "x" | "y" | "z", style: Style, segs = 12) {
    const m = new THREE.Matrix4();
    if (axis === "z") m.makeRotationX(Math.PI / 2);
    else if (axis === "x") m.makeRotationZ(Math.PI / 2);
    m.setPosition(x, y, z);
    this.add(new THREE.CylinderGeometry(r, r, len, segs), m, style);
  }

  /** Rectangular frame of four members, min corner (x, y), centre depth z. */
  frame(W: number, H: number, f: number, D: number, x: number, y: number, z: number, style: Style) {
    this.box(W, f, D, x, y, z, style);
    this.box(W, f, D, x, y + H - f, z, style);
    this.box(f, H - 2 * f, D, x, y + f, z, style);
    this.box(f, H - 2 * f, D, x + W - f, y + f, z, style);
  }

  build(kit: Kit, parent: THREE.Object3D) {
    const group = new THREE.Group();
    for (const [style, p] of this.parts) {
      const fill = kit.own(mergeGeometries(p.fills));
      const edges = kit.own(mergeGeometries(p.edges));
      p.fills.forEach((g) => g.dispose());
      p.edges.forEach((g) => g.dispose());
      const mesh = new THREE.Mesh(fill, kit.fill[style]);
      mesh.add(new THREE.LineSegments(edges, kit.line[style]));
      group.add(mesh);
    }
    this.parts.clear();
    parent.add(group);
    return group;
  }
}

/* ── Cracks: radial rays + concentric rings, sorted outward so a draw range "grows" them ── */
export function crackSegments(
  cx: number,
  cy: number,
  w: number,
  h: number,
  seed: number,
  rays = 16,
  maxR = 3,
  rings = [0.16, 0.36, 0.66, 1.05, 1.5],
): Float32Array {
  const r = rng(seed);
  const hw = w / 2;
  const hh = h / 2;
  const segs: { d: number; v: number[] }[] = [];
  const rayPts: { x: number; y: number; d: number }[][] = [];

  for (let k = 0; k < rays; k++) {
    let a = (k / rays) * Math.PI * 2 + (r() - 0.5) * 0.35;
    let x = cx;
    let y = cy;
    let d = 0;
    const pts = [{ x, y, d: 0 }];
    const len = maxR * (0.55 + 0.45 * r());
    while (d < len) {
      a += (r() - 0.5) * 0.4;
      const s = 0.1 + r() * 0.16;
      let nx = x + Math.cos(a) * s;
      let ny = y + Math.sin(a) * s;
      let stop = false;
      if (nx < -hw || nx > hw || ny < -hh || ny > hh) {
        nx = Math.min(hw, Math.max(-hw, nx));
        ny = Math.min(hh, Math.max(-hh, ny));
        stop = true;
      }
      d = Math.hypot(nx - cx, ny - cy);
      segs.push({ d, v: [x, y, 0, nx, ny, 0] });
      x = nx;
      y = ny;
      pts.push({ x, y, d });
      if (stop) break;
    }
    rayPts.push(pts);
  }

  const at = (pts: { x: number; y: number; d: number }[], R: number) => pts.find((p) => p.d >= R);
  for (const R of rings) {
    for (let k = 0; k < rays; k++) {
      const A = at(rayPts[k], R);
      const B = at(rayPts[(k + 1) % rays], R);
      if (!A || !B || r() > 0.85 || Math.abs(A.d - B.d) > R * 0.8) continue;
      segs.push({ d: R, v: [A.x, A.y, 0, B.x, B.y, 0] });
    }
  }
  segs.sort((a, b) => a.d - b.d);
  return new Float32Array(segs.flatMap((s) => s.v));
}

/* ── BowPane: a glass lite that can bow in and out (cyclic / structural load) ── */
export class BowPane {
  readonly group = new THREE.Group();
  private geo: THREE.PlaneGeometry;
  private base: Float32Array;
  private lines: { geo: THREE.BufferGeometry; obj: THREE.LineSegments; base: Float32Array; count: number }[] = [];
  private cur = 0;

  constructor(
    kit: Kit,
    private w: number,
    private h: number,
    style: "glass" | "accentGlass",
    cracks: Float32Array[] = [],
  ) {
    this.geo = kit.own(new THREE.PlaneGeometry(w, h, 10, 12));
    this.base = (this.geo.attributes.position.array as Float32Array).slice();
    this.group.add(new THREE.Mesh(this.geo, kit.fill[style]));
    const hw = w / 2;
    const hh = h / 2;
    // outline
    this.addLines(kit, new Float32Array([-hw, -hh, 0, hw, -hh, 0, hw, -hh, 0, hw, hh, 0, hw, hh, 0, -hw, hh, 0, -hw, hh, 0, -hw, -hh, 0]), kit.line[style]);
    for (const c of cracks) {
      const l = this.addLines(kit, c, kit.crack);
      l.obj.visible = false;
    }
  }

  private addLines(kit: Kit, arr: Float32Array, mat: THREE.LineBasicMaterial) {
    const geo = kit.own(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(arr.slice(), 3));
    const obj = new THREE.LineSegments(geo, mat);
    this.group.add(obj);
    const l = { geo, obj, base: arr, count: arr.length / 3 };
    this.lines.push(l);
    return l;
  }

  private shape(x: number, y: number) {
    return Math.cos((Math.PI * x) / this.w) * Math.cos((Math.PI * y) / this.h);
  }

  /** bow at the centre, in world units; + is toward +z */
  set(bow: number) {
    if (Math.abs(bow - this.cur) < 1e-5) return;
    this.cur = bow;
    const pos = this.geo.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) pos[i + 2] = this.base[i + 2] + bow * this.shape(this.base[i], this.base[i + 1]);
    this.geo.attributes.position.needsUpdate = true;
    for (const l of this.lines) {
      const p = l.geo.attributes.position.array as Float32Array;
      for (let i = 0; i < p.length; i += 3) p[i + 2] = 0.004 + bow * this.shape(l.base[i], l.base[i + 1]);
      l.geo.attributes.position.needsUpdate = true;
    }
  }

  /** grow crack set i (0-based) to a fraction */
  reveal(i: number, frac: number) {
    const l = this.lines[i + 1];
    if (!l) return;
    l.obj.visible = frac > 0;
    l.geo.setDrawRange(0, Math.floor((l.count * clamp01(frac)) / 2) * 2);
  }
}

/* ── Shatter: an ordinary lite that breaks into shards which fall out ── */
type Shard = { c: THREE.Vector3; v: THREE.Vector3; w: THREE.Vector3; delay: number; tl: number; local: number[] };
const G = 14; // slowed gravity, reads better on screen

export class Shatter {
  readonly group = new THREE.Group();
  private shards: Shard[] = [];
  private fillGeo: THREE.BufferGeometry;
  private lineGeo: THREE.BufferGeometry;
  private lineObj: THREE.LineSegments;
  private outline: THREE.LineSegments;
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private p = new THREE.Vector3();
  private one = new THREE.Vector3(1, 1, 1);
  private tmp = new THREE.Vector3();
  private last = NaN;

  constructor(kit: Kit, w: number, h: number, ix: number, iy: number, seed: number, private floorY: number, cols = 6, rows = 7) {
    const r = rng(seed);
    const hw = w / 2;
    const hh = h / 2;
    const vx: number[][] = [];
    const vy: number[][] = [];
    for (let i = 0; i <= cols; i++) {
      vx.push([]);
      vy.push([]);
      for (let j = 0; j <= rows; j++) {
        const edgeX = i === 0 || i === cols;
        const edgeY = j === 0 || j === rows;
        vx[i].push(-hw + (i * w) / cols + (edgeX ? 0 : (r() - 0.5) * (w / cols) * 0.7));
        vy[i].push(-hh + (j * h) / rows + (edgeY ? 0 : (r() - 0.5) * (h / rows) * 0.7));
      }
    }
    const tri = (a: [number, number], b: [number, number], c: [number, number]) => {
      const cx = (vx[a[0]][a[1]] + vx[b[0]][b[1]] + vx[c[0]][c[1]]) / 3;
      const cy = (vy[a[0]][a[1]] + vy[b[0]][b[1]] + vy[c[0]][c[1]]) / 3;
      const local = [a, b, c].flatMap(([i, j]) => [vx[i][j] - cx, vy[i][j] - cy, 0]);
      const dx = cx - ix;
      const dy = cy - iy;
      const dd = Math.hypot(dx, dy) || 0.01;
      const push = Math.max(0.25, 1 - dd / 2.6);
      const v = new THREE.Vector3((dx / dd) * push * (0.6 + r()), (dy / dd) * push * 0.6 + r() * 0.8, -(0.6 + 3.2 * push) * (0.7 + 0.5 * r()));
      const wv = new THREE.Vector3((r() - 0.5) * 7, (r() - 0.5) * 7, (r() - 0.5) * 5);
      // time to reach the floor: cy + v.y t − ½G t² = floorY
      const drop = cy - (floorY + 0.03);
      const tl = (v.y + Math.sqrt(v.y * v.y + 2 * G * Math.max(0, drop))) / G;
      this.shards.push({ c: new THREE.Vector3(cx, cy, 0), v, w: wv, delay: dd * 0.06 + r() * 0.05, tl, local });
    };
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (r() < 0.5) {
          tri([i, j], [i + 1, j], [i + 1, j + 1]);
          tri([i, j], [i + 1, j + 1], [i, j + 1]);
        } else {
          tri([i, j], [i + 1, j], [i, j + 1]);
          tri([i + 1, j], [i + 1, j + 1], [i, j + 1]);
        }
      }
    }
    const n = this.shards.length;
    this.fillGeo = kit.own(new THREE.BufferGeometry());
    this.fillGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 9), 3));
    this.lineGeo = kit.own(new THREE.BufferGeometry());
    this.lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 18), 3));
    this.group.add(new THREE.Mesh(this.fillGeo, kit.fill.glass));
    this.lineObj = new THREE.LineSegments(this.lineGeo, kit.line.glass);
    this.group.add(this.lineObj);
    const og = kit.own(new THREE.BufferGeometry());
    og.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-hw, -hh, 0, hw, -hh, 0, hw, -hh, 0, hw, hh, 0, hw, hh, 0, -hw, hh, 0, -hw, hh, 0, -hw, -hh, 0]), 3));
    this.outline = new THREE.LineSegments(og, kit.line.glass);
    this.group.add(this.outline);
    // bounding volume changes as shards fly; skip culling
    this.group.traverse((o) => (o.frustumCulled = false));
    this.set(0);
  }

  /** t = seconds since impact (≤ 0: intact) */
  set(t: number) {
    const tt = Math.max(0, t);
    if (tt === this.last) return;
    this.last = tt;
    const broken = t > 0;
    this.lineObj.visible = broken;
    this.outline.visible = !broken;
    const fp = this.fillGeo.attributes.position.array as Float32Array;
    const lp = this.lineGeo.attributes.position.array as Float32Array;
    const floor = this.floorY + 0.01;
    this.shards.forEach((s, k) => {
      const te = Math.min(Math.max(0, tt - s.delay), s.tl);
      this.p.set(s.c.x + s.v.x * te, s.c.y + s.v.y * te - 0.5 * G * te * te, s.c.z + s.v.z * te);
      this.e.set(s.w.x * te, s.w.y * te, s.w.z * te);
      this.q.setFromEuler(this.e);
      this.m.compose(this.p, this.q, this.one);
      const v: number[] = [];
      for (let j = 0; j < 3; j++) {
        this.tmp.set(s.local[j * 3], s.local[j * 3 + 1], s.local[j * 3 + 2]).applyMatrix4(this.m);
        if (this.tmp.y < floor) this.tmp.y = floor;
        v.push(this.tmp.x, this.tmp.y, this.tmp.z);
      }
      fp.set(v, k * 9);
      lp.set([v[0], v[1], v[2], v[3], v[4], v[5], v[3], v[4], v[5], v[6], v[7], v[8], v[6], v[7], v[8], v[0], v[1], v[2]], k * 18);
    });
    this.fillGeo.attributes.position.needsUpdate = true;
    this.lineGeo.attributes.position.needsUpdate = true;
  }
}

/* ── Arrow (solid accent), tail at origin, pointing +z ── */
export function arrow(kit: Kit, len = 1.1) {
  const g = new THREE.Group();
  const head = 0.3;
  const shaft = new THREE.Mesh(kit.own(new THREE.CylinderGeometry(0.035, 0.035, len - head, 8)), kit.solid);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = (len - head) / 2;
  const cone = new THREE.Mesh(kit.own(new THREE.ConeGeometry(0.12, head, 12)), kit.solid);
  cone.rotation.x = Math.PI / 2;
  cone.position.z = len - head / 2;
  g.add(shaft, cone);
  return g;
}

/* ── Particles (one draw call), positions written each frame ── */
export class Particles {
  readonly points: THREE.Points;
  readonly pos: Float32Array;
  private geo: THREE.BufferGeometry;

  constructor(kit: Kit, readonly n: number, size = 3) {
    this.pos = new Float32Array(n * 3);
    this.geo = kit.own(new THREE.BufferGeometry());
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    const mat = kit.own(new THREE.PointsMaterial({ color: ACCENT, size, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false }));
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
  }

  hide(i: number) {
    this.pos[i * 3] = 0;
    this.pos[i * 3 + 1] = -1000;
    this.pos[i * 3 + 2] = 0;
  }

  set(i: number, x: number, y: number, z: number) {
    this.pos[i * 3] = x;
    this.pos[i * 3 + 1] = y;
    this.pos[i * 3 + 2] = z;
  }

  commit() {
    this.geo.attributes.position.needsUpdate = true;
  }
}
