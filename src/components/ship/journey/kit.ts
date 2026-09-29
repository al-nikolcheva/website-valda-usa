import * as THREE from "three";

/* ── Palette (matches src/components/iso) ── */
export const EDGE = 0x3a3a3d;
export const BLUE = 0x1f4e8c;

/* ── Kit: shared materials + cached geometry, disposed together ── */
export type Fill = "white" | "light" | "grey" | "dark" | "blue" | "glass" | "blueGlass" | "ground";

const lambert = (color: number, extra: THREE.MeshLambertMaterialParameters = {}) =>
  new THREE.MeshLambertMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...extra });

export class Kit {
  private geos = new Map<string, { box: THREE.BoxGeometry; edges: THREE.EdgesGeometry }>();
  private extra: { dispose: () => void }[] = [];

  readonly fills: Record<Fill, THREE.Material> = {
    white: lambert(0xffffff),
    light: lambert(0xededee),
    grey: lambert(0xc9c9cc),
    dark: lambert(0x4a4a4e),
    blue: lambert(BLUE),
    glass: lambert(0xeef1f4, { transparent: true, opacity: 0.55, depthWrite: false }),
    blueGlass: lambert(0xdbe4f0, { transparent: true, opacity: 0.8, depthWrite: false }),
    ground: lambert(0xf1f1f2),
  };
  readonly edge = new THREE.LineBasicMaterial({ color: EDGE });
  readonly edgeBlue = new THREE.LineBasicMaterial({ color: BLUE });
  readonly edgeSoft = new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.35 });

  private geo(w: number, h: number, d: number) {
    const key = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
    let g = this.geos.get(key);
    if (!g) {
      const box = new THREE.BoxGeometry(w, h, d);
      g = { box, edges: new THREE.EdgesGeometry(box) };
      this.geos.set(key, g);
    }
    return g;
  }

  /** Box whose min corner is (x, y, z). */
  box(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, fill: Fill = "white", line: THREE.LineBasicMaterial | null = this.edge) {
    const g = this.geo(w, h, d);
    const mesh = new THREE.Mesh(g.box, this.fills[fill]);
    if (line) mesh.add(new THREE.LineSegments(g.edges, line));
    mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
    parent.add(mesh);
    return mesh;
  }

  /** Any custom geometry with outline edges. */
  solid(parent: THREE.Object3D, geo: THREE.BufferGeometry, fill: Fill, line: THREE.LineBasicMaterial | null = this.edge) {
    const mesh = new THREE.Mesh(geo, this.fills[fill]);
    this.track(geo);
    if (line) {
      const e = new THREE.EdgesGeometry(geo, 20);
      this.track(e);
      mesh.add(new THREE.LineSegments(e, line));
    }
    parent.add(mesh);
    return mesh;
  }

  /** Window unit (frame + glass) in the XY plane, min corner (x, y), front face at z + depth. */
  window(parent: THREE.Object3D, W: number, H: number, x: number, y: number, z: number, accent = false) {
    const f = 0.12;
    const d = 0.18;
    const fill: Fill = "white";
    const line = accent ? this.edgeBlue : this.edge;
    this.box(parent, W, f, d, x, y, z, fill, line);
    this.box(parent, W, f, d, x, y + H - f, z, fill, line);
    this.box(parent, f, H - 2 * f, d, x, y + f, z, fill, line);
    this.box(parent, f, H - 2 * f, d, x + W - f, y + f, z, fill, line);
    this.box(parent, f * 0.8, H - 2 * f, d * 0.8, x + W / 2 - f * 0.4, y + f, z + d * 0.1, fill, line); // mullion
    this.box(parent, W - 2 * f, H - 2 * f, 0.03, x + f, y + f, z + d / 2, accent ? "blueGlass" : "glass", accent ? this.edgeBlue : this.edgeSoft);
  }

  track<T extends { dispose: () => void }>(d: T): T {
    this.extra.push(d);
    return d;
  }

  private shadowParts?: { geo: THREE.PlaneGeometry; mat: THREE.MeshBasicMaterial };
  /** Soft contact shadow blob on the ground (centre cx, cz; size sx × sz). */
  shadow(parent: THREE.Object3D, cx: number, cz: number, sx: number, sz: number, y = 0.01) {
    if (!this.shadowParts) {
      const tex = this.track(shadowTexture());
      this.shadowParts = {
        geo: this.track(new THREE.PlaneGeometry(1, 1)),
        mat: this.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })),
      };
    }
    const m = new THREE.Mesh(this.shadowParts.geo, this.shadowParts.mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(cx, y, cz);
    m.scale.set(sx, sz, 1);
    parent.add(m);
    return m;
  }

  dispose() {
    for (const g of this.geos.values()) {
      g.box.dispose();
      g.edges.dispose();
    }
    this.geos.clear();
    Object.values(this.fills).forEach((m) => m.dispose());
    [this.edge, this.edgeBlue, this.edgeSoft].forEach((m) => m.dispose());
    this.extra.forEach((d) => d.dispose());
  }
}

/* ── Soft contact shadows ───────────────────────────────────── */
export function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(34,34,36,0.16)");
    grd.addColorStop(0.55, "rgba(34,34,36,0.06)");
    grd.addColorStop(1, "rgba(34,34,36,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── Builders ───────────────────────────────────────────────── */
/** Deterministic pseudo-random for stable layouts. */
export function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Wall in the XY plane (min corner x, y; depth from z) with rectangular openings. */
export function wallWithOpenings(kit: Kit, parent: THREE.Object3D, W: number, H: number, t: number, x: number, y: number, z: number, openings: { x: number; w: number; y: number; h: number }[]) {
  const cuts = [...openings].sort((a, b) => a.x - b.x);
  let cx = 0;
  for (const o of cuts) {
    if (o.x > cx) kit.box(parent, o.x - cx, H, t, x + cx, y, z, "white");
    if (o.y > 0) kit.box(parent, o.w, o.y, t, x + o.x, y, z, "white");
    if (o.y + o.h < H) kit.box(parent, o.w, H - o.y - o.h, t, x + o.x, y + o.y + o.h, z, "white");
    cx = o.x + o.w;
  }
  if (cx < W) kit.box(parent, W - cx, H, t, x + cx, y, z, "white");
}

export function wheels(kit: Kit, parent: THREE.Object3D, xs: number[], zNear: number, zFar: number, r = 0.7) {
  for (const x of xs) {
    kit.box(parent, r, r, 0.3, x, 0, zNear, "dark");
    kit.box(parent, r, r, 0.3, x, 0, zFar, "dark");
  }
}
