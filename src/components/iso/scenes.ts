import * as THREE from "three";

/* ── Palette ────────────────────────────────────────────────── */
const EDGE = 0x3a3a3d;
const ACCENT = 0x1f4e8c;
const GLASS = 0xeef1f4;
const ACCENT_GLASS = 0xdbe4f0;

export type IsoKind = "windows" | "doors" | "sliding" | "facades";
type Style = "frame" | "accent" | "glass" | "accentGlass";

export interface IsoFrame {
  caption: string;
  /** optional whole-scene opacity (0–1), used to fade out before a loop restart */
  fade?: number;
}

export interface IsoBuild {
  root: THREE.Group;
  /** seconds per loop, including the end pause */
  duration: number;
  /** time used for prefers-reduced-motion (the "open" state) */
  staticT: number;
  /** times whose poses are unioned to fit the camera */
  fitTimes: number[];
  update: (t: number) => IsoFrame;
}

/* ── Easing / timeline helpers ─────────────────────────────── */
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** eased 0→1 progress of t between a and b (clamped) */
const seg = (t: number, a: number, b: number) => easeInOutCubic(Math.min(1, Math.max(0, (t - a) / (b - a))));
const DEG = Math.PI / 180;

/* ── Kit: shared materials + cached geometries, disposed together ── */
export class IsoKit {
  private geos = new Map<string, { box: THREE.BoxGeometry; edges: THREE.EdgesGeometry }>();
  private extra: { dispose: () => void }[] = [];

  readonly mats = {
    frame: new THREE.MeshLambertMaterial({ color: 0xffffff, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    glass: new THREE.MeshLambertMaterial({ color: GLASS, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    accentGlass: new THREE.MeshLambertMaterial({ color: ACCENT_GLASS, transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
  };
  readonly lines = {
    frame: new THREE.LineBasicMaterial({ color: EDGE }),
    glass: new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.75 }),
    accent: new THREE.LineBasicMaterial({ color: ACCENT }),
  };

  private geo(w: number, h: number, d: number) {
    const key = `${w.toFixed(4)}|${h.toFixed(4)}|${d.toFixed(4)}`;
    let g = this.geos.get(key);
    if (!g) {
      const box = new THREE.BoxGeometry(w, h, d);
      g = { box, edges: new THREE.EdgesGeometry(box) };
      this.geos.set(key, g);
    }
    return g;
  }

  /** Box whose min corner (x, y) and centre depth z are given. */
  box(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, style: Style) {
    const g = this.geo(w, h, d);
    const mesh = new THREE.Mesh(g.box, this.mats.frame);
    const line = new THREE.LineSegments(g.edges, this.lines.frame);
    mesh.add(line);
    mesh.userData.line = line;
    mesh.position.set(x + w / 2, y + h / 2, z);
    this.setStyle(mesh, style);
    parent.add(mesh);
    return mesh;
  }

  setStyle(mesh: THREE.Mesh, style: Style) {
    const line = mesh.userData.line as THREE.LineSegments;
    if (style === "frame") { mesh.material = this.mats.frame; line.material = this.lines.frame; }
    else if (style === "accent") { mesh.material = this.mats.frame; line.material = this.lines.accent; }
    else if (style === "glass") { mesh.material = this.mats.glass; line.material = this.lines.glass; }
    else { mesh.material = this.mats.accentGlass; line.material = this.lines.accent; }
    mesh.userData.style = style;
  }

  /** Rectangular profile frame, min corner at (x, y), centre depth z. Returns the 4 members. */
  rect(parent: THREE.Object3D, W: number, H: number, face: number, depth: number, x: number, y: number, z: number, style: Style, bottom = face) {
    return [
      this.box(parent, W, bottom, depth, x, y, z, style),
      this.box(parent, W, face, depth, x, y + H - face, z, style),
      this.box(parent, face, H - face - bottom, depth, x, y + bottom, z, style),
      this.box(parent, face, H - face - bottom, depth, x + W - face, y + bottom, z, style),
    ];
  }

  track(d: { dispose: () => void }) { this.extra.push(d); }

  dispose() {
    for (const g of this.geos.values()) { g.box.dispose(); g.edges.dispose(); }
    this.geos.clear();
    Object.values(this.mats).forEach((m) => m.dispose());
    Object.values(this.lines).forEach((m) => m.dispose());
    this.extra.forEach((d) => d.dispose());
  }
}

/* ── Shared sub-assemblies ──────────────────────────────────── */

/** Lever handle: rose on the face + lever on a pivot. Returns the pivot (rotate .z). */
function lever(kit: IsoKit, parent: THREE.Object3D, x: number, y: number, zFace: number, dir: "down" | "left" | "right", len = 0.36) {
  kit.box(parent, 0.09, 0.22, 0.05, x - 0.045, y - 0.11, zFace + 0.025, "accent");
  const pivot = new THREE.Group();
  pivot.position.set(x, y, zFace + 0.09);
  parent.add(pivot);
  if (dir === "down") kit.box(pivot, 0.06, len, 0.05, -0.03, -len + 0.03, 0, "accent");
  else if (dir === "left") kit.box(pivot, len, 0.06, 0.05, -len + 0.03, -0.03, 0, "accent");
  else kit.box(pivot, len, 0.06, 0.05, -0.03, -0.03, 0, "accent");
  return pivot;
}

/* ── Windows: tilt & turn ───────────────────────────────────── */
function buildWindow(kit: IsoKit): IsoBuild {
  const root = new THREE.Group();
  const W = 4, H = 5, f = 0.24, D = 0.28;
  const x0 = -W / 2;
  kit.rect(root, W, H, f, D, x0, 0, 0, "frame");
  // sill
  kit.box(root, W + 0.2, 0.06, D + 0.3, x0 - 0.1, -0.06, 0.15, "frame");

  const ov = 0.06;
  const SW = W - 2 * f + 2 * ov, SH = H - 2 * f + 2 * ov, sf = 0.26, sd = 0.24;
  const zS = D / 2 + 0.02;

  const tilt = new THREE.Group(); // hinge on the bottom edge
  tilt.position.set(x0 + f - ov, f - ov, zS);
  root.add(tilt);
  const turn = new THREE.Group(); // hinge on the left edge
  tilt.add(turn);

  kit.rect(turn, SW, SH, sf, sd, 0, 0, 0, "accent");
  kit.box(turn, SW - 2 * sf + 0.08, SH - 2 * sf + 0.08, 0.1, sf - 0.04, sf - 0.04, 0, "accentGlass");
  const handle = lever(kit, turn, SW - sf / 2, SH / 2, sd / 2, "down");

  const DOWN = 0, UP = Math.PI, SIDE = -Math.PI / 2;
  return {
    root,
    duration: 8.8,
    staticT: 5.8,
    fitTimes: [0, 2, 5.8],
    update(t) {
      tilt.rotation.x = 10 * DEG * (seg(t, 0.7, 1.7) - seg(t, 2.7, 3.5));
      turn.rotation.y = -80 * DEG * (seg(t, 4.1, 5.5) - seg(t, 6.5, 7.8));
      handle.rotation.z =
        DOWN + (UP - DOWN) * (seg(t, 0.2, 0.6) - seg(t, 3.5, 3.8)) + (SIDE - DOWN) * (seg(t, 3.8, 4.1) - seg(t, 7.8, 8.2));
      return { caption: t < 3.6 ? "Tilt" : "Turn" };
    },
  };
}

/* ── Doors: entrance door with side light ───────────────────── */
function buildDoor(kit: IsoKit): IsoBuild {
  const root = new THREE.Group();
  const W = 4.9, H = 7.2, f = 0.26, D = 0.36, thr = 0.1;
  const x0 = -W / 2;
  const doorW = 3.2;
  kit.rect(root, W, H, f, D, x0, 0, 0, "frame", thr);
  // mullion between door and side light
  const mx = x0 + f + doorW;
  kit.box(root, f * 0.8, H - f - thr, D, mx, thr, 0, "frame");
  // side light (fixed): glass in a slim glazing bead
  const sx = mx + f * 0.8, sw = x0 + W - f - sx;
  kit.box(root, sw, H - f - thr, 0.08, sx, thr, 0, "glass");
  kit.box(root, sw, 0.12, 0.1, sx, 3.2, 0.06, "frame"); // horizontal bar in the side light

  // leaf
  const ov = 0.05;
  const LW = doorW + 2 * ov, LH = H - f - thr + ov, lf = 0.36, ld = 0.3;
  const hinge = new THREE.Group();
  hinge.position.set(x0 + f - ov, thr, D / 2 + 0.02);
  root.add(hinge);
  kit.rect(hinge, LW, LH, lf, ld, 0, 0, 0, "accent", 0.5);
  // infill panel with a vertical glazed slot
  const iw = LW - 2 * lf, ih = LH - lf - 0.5;
  const slotW = 0.42, slotX = lf + iw * 0.62;
  kit.box(hinge, slotX - lf, ih, 0.14, lf, 0.5, 0, "accent");
  kit.box(hinge, slotW, ih, 0.08, slotX, 0.5, 0, "accentGlass");
  kit.box(hinge, lf + iw - slotX - slotW, ih, 0.14, slotX + slotW, 0.5, 0, "accent");
  const handle = lever(kit, hinge, LW - lf / 2, 3.35, ld / 2, "left", 0.5);

  return {
    root,
    duration: 6.6,
    staticT: 3.4,
    fitTimes: [0, 3.4],
    update(t) {
      hinge.rotation.y = -85 * DEG * (seg(t, 1.0, 2.7) - seg(t, 4.1, 5.8));
      handle.rotation.z = 0.5 * (seg(t, 0.5, 0.8) - seg(t, 1.5, 1.8));
      return { caption: t < 4.0 ? "Open" : "Close" };
    },
  };
}

/* ── Sliding: lift & slide, one fixed + one moving panel ────── */
function buildSliding(kit: IsoKit): IsoBuild {
  const root = new THREE.Group();
  const W = 8, H = 7, f = 0.26, D = 0.62;
  const x0 = -W / 2;
  kit.rect(root, W, H, f, D, x0, 0, 0, "frame", 0.14);
  // track rails
  kit.box(root, W - 2 * f, 0.05, 0.05, x0 + f, 0.14, 0.14, "frame");
  kit.box(root, W - 2 * f, 0.05, 0.05, x0 + f, 0.14, -0.14, "frame");

  const inner = W - 2 * f;
  const PW = inner / 2 + 0.12, PH = H - f - 0.14 - 0.08, pf = 0.3, pd = 0.2;
  // fixed panel — front track, right
  const fixed = new THREE.Group();
  fixed.position.set(x0 + f + inner - PW, 0.19, 0.14);
  root.add(fixed);
  kit.rect(fixed, PW, PH, pf, pd, 0, 0, 0, "frame");
  kit.box(fixed, PW - 2 * pf + 0.08, PH - 2 * pf + 0.08, 0.08, pf - 0.04, pf - 0.04, 0, "glass");

  // moving panel — rear track, left; slides behind the fixed one
  const moving = new THREE.Group();
  const mx = x0 + f, my = 0.19;
  moving.position.set(mx, my, -0.14);
  root.add(moving);
  kit.rect(moving, PW, PH, pf, pd, 0, 0, 0, "accent");
  kit.box(moving, PW - 2 * pf + 0.08, PH - 2 * pf + 0.08, 0.08, pf - 0.04, pf - 0.04, 0, "accentGlass");
  // pull handle on the trailing (left) stile, room face — clears the fixed panel at full travel
  const handle = lever(kit, moving, pf / 2, 3.3, pd / 2, "down", 0.5);
  const travel = PW - 0.45;

  return {
    root,
    duration: 8.4,
    staticT: 4.0,
    fitTimes: [0, 4.0],
    update(t) {
      const lift = seg(t, 0.7, 1.3) - seg(t, 6.6, 7.1);
      moving.position.y = my + 0.14 * lift;
      moving.position.x = mx + travel * (seg(t, 1.6, 3.5) - seg(t, 4.6, 6.4));
      handle.rotation.z = Math.PI * (seg(t, 0.4, 0.9) - seg(t, 7.1, 7.6));
      return { caption: t < 1.45 ? "Lift" : t < 4.5 ? "Slide" : "Close" };
    },
  };
}

/* ── Facades: 3 × 3 curtain wall assembling ─────────────────── */
function buildFacade(kit: IsoKit): IsoBuild {
  const root = new THREE.Group();
  const cols = 3, rows = 3, b = 3, r = 3.4;
  const W = cols * b, H = rows * r;
  const x0 = -W / 2;
  const mw = 0.22, md = 0.6, tw = 0.2, td = 0.5;

  type Part = { obj: THREE.Object3D; meshes: THREE.Mesh[]; base: Style };
  const mk = (base: Style, px: number, py: number, pz: number, build: (g: THREE.Group) => THREE.Mesh[]): Part => {
    const g = new THREE.Group();
    g.position.set(px, py, pz);
    root.add(g);
    return { obj: g, meshes: build(g), base };
  };
  const setActive = (p: Part, on: boolean) => {
    const want: Style = on ? (p.base === "glass" ? "accentGlass" : "accent") : p.base;
    for (const m of p.meshes) if (m.userData.style !== want) kit.setStyle(m, want);
  };

  const mullions: Part[] = [];
  for (let i = 0; i <= cols; i++) {
    const mx = x0 + i * b;
    mullions.push(mk("frame", mx, 0, 0, (g) => [kit.box(g, mw, H, md, -mw / 2, 0, 0, "frame")]));
  }
  const transoms: Part[] = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i < cols; i++) {
      const tx = x0 + i * b + mw / 2; // grows from its left end
      const ty = j === 0 ? 0 : j === rows ? H - tw : j * r - tw / 2;
      transoms.push(mk("frame", tx, ty, -0.05, (g) => [kit.box(g, b - mw, tw, td, 0, 0, 0, "frame")]));
    }
  }
  const glass: Part[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const gx = x0 + i * b + mw / 2 + 0.02;
      const gy = j * r + (j === 0 ? tw : tw / 2) + 0.02;
      const gh = r - (j === 0 || j === rows - 1 ? tw * 1.5 : tw) - 0.04;
      glass.push(mk("glass", gx, gy, 0.16, (g) => [kit.box(g, b - mw - 0.04, gh, 0.08, 0, 0, 0, "glass")]));
    }
  }

  const DROP = 3;
  return {
    root,
    duration: 9.6,
    staticT: 8.2,
    fitTimes: [8.2],
    update(t) {
      mullions.forEach((p, i) => {
        const a = 0.2 + 0.28 * i, k = seg(t, a, a + 0.8);
        p.obj.visible = t > a;
        p.obj.position.y = DROP * (1 - k);
        setActive(p, t > a && k < 1);
      });
      transoms.forEach((p, i) => {
        const a = 1.6 + 0.12 * i, k = seg(t, a, a + 0.5);
        p.obj.visible = k > 0;
        p.obj.scale.x = Math.max(k, 0.001);
        setActive(p, k > 0 && k < 1);
      });
      glass.forEach((p, i) => {
        const a = 3.4 + 0.4 * i, k = seg(t, a, a + 0.7);
        p.obj.visible = k > 0;
        p.obj.position.z = 0.16 + 2.4 * (1 - k);
        setActive(p, k > 0 && k < 1);
      });
      return { caption: "Assemble", fade: 1 - seg(t, 8.8, 9.3) };
    },
  };
}

export function buildScene(kind: IsoKind, kit: IsoKit): IsoBuild {
  switch (kind) {
    case "windows": return buildWindow(kit);
    case "doors": return buildDoor(kit);
    case "sliding": return buildSliding(kit);
    case "facades": return buildFacade(kit);
  }
}

export const FIRST_CAPTION: Record<IsoKind, string> = {
  windows: "Tilt",
  doors: "Open",
  sliding: "Lift",
  facades: "Assemble",
};
