"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLASS, type BuildingType, type OpeningKind, type OpeningSpec, type Swatch } from "@/lib/build-project";

export type TimeOfDay = "morning" | "noon" | "sunset" | "night";
export type CameraView = "front" | "back" | "left" | "right" | "aerial";

type Props = {
  type: BuildingType;
  specs: OpeningSpec[];
  swatches: Swatch[];
  focusId: string | null;
  onFocus: (id: string | null) => void;
  time: TimeOfDay;
  open: boolean;
  /** camera preset; `viewKey` changes re-trigger the same preset */
  view: CameraView;
  viewKey: number;
  /** how many of `specs` the model could place (the rest are listed, not drawn) */
  onPlaced?: (n: number) => void;
};

/* ───────────────────────── layout ───────────────────────── */

type Wall = { origin: THREE.Vector3; along: THREE.Vector3; normal: THREE.Vector3 };
type Row = { wall: Wall; y: number; length: number; used: number; items: Placed[] };
type Placed = { spec: OpeningSpec; w: number; h: number; sill: number; pos?: THREE.Vector3; normal?: THREE.Vector3 };

const GAP = 0.75;

function size(spec: OpeningSpec, storey: number): { w: number; h: number; sill: number } {
  switch (spec.kind) {
    case "window":
      return spec.style === "Fixed" ? { w: 1.7, h: 1.6, sill: 0.9 } : spec.style === "Awning" ? { w: 1.2, h: 0.9, sill: 1.5 } : { w: 1.2, h: 1.55, sill: 0.9 };
    case "door":
      return spec.style === "Double entry" ? { w: 1.9, h: 2.3, sill: 0 } : { w: 1.1, h: 2.3, sill: 0 };
    case "sliding":
      return spec.style === "4-panel OXXO" ? { w: 4.2, h: 2.4, sill: 0 } : spec.style === "Lift & slide" ? { w: 3.4, h: 2.5, sill: 0 } : { w: 2.6, h: 2.3, sill: 0 };
    case "facade":
      return { w: 1.6, h: storey, sill: 0 };
  }
}

type Massing = { W: number; D: number; storeys: number; storey: number };

function massing(type: BuildingType, specs: OpeningSpec[]): Massing {
  if (type === "house") return { W: 12, D: 9, storeys: 2, storey: 3 };
  const n = (k: OpeningKind) => specs.filter((s) => s.kind === k).length;
  const W = 16, D = 12;
  const perFloor = (W + 2 * D - 2) / 1.95 + 1; // windows the side and back walls hold per floor
  const need = Math.max(n("window") / perFloor, n("facade") / ((W - 1) / 1.6), n("sliding") / 4);
  return { W, D, storeys: Math.min(10, Math.max(3, Math.ceil(need) + 1)), storey: 3.2 };
}

function walls(m: Massing): Record<"front" | "back" | "left" | "right", Wall> {
  const { W, D } = m;
  return {
    front: { origin: new THREE.Vector3(-W / 2, 0, D / 2), along: new THREE.Vector3(1, 0, 0), normal: new THREE.Vector3(0, 0, 1) },
    back: { origin: new THREE.Vector3(W / 2, 0, -D / 2), along: new THREE.Vector3(-1, 0, 0), normal: new THREE.Vector3(0, 0, -1) },
    left: { origin: new THREE.Vector3(-W / 2, 0, -D / 2), along: new THREE.Vector3(0, 0, 1), normal: new THREE.Vector3(-1, 0, 0) },
    right: { origin: new THREE.Vector3(W / 2, 0, D / 2), along: new THREE.Vector3(0, 0, -1), normal: new THREE.Vector3(1, 0, 0) },
  };
}

/** Distribute every opening across the facades, in the order a designer would. */
function layout(type: BuildingType, specs: OpeningSpec[], m: Massing): Placed[] {
  const wl = walls(m);
  const len = (k: keyof typeof wl) => (k === "front" || k === "back" ? m.W : m.D);
  const rows = new Map<string, Row>();
  const row = (k: keyof typeof wl, floor: number) => {
    const key = `${k}${floor}`;
    if (!rows.has(key)) rows.set(key, { wall: wl[k], y: floor * m.storey, length: len(k) - 1, used: 0, items: [] });
    return rows.get(key)!;
  };
  const upper = Array.from({ length: m.storeys - 1 }, (_, i) => i + 1);
  const order: Record<OpeningKind, Row[]> =
    type === "house"
      ? {
          door: [row("front", 0), row("left", 0), row("right", 0)],
          sliding: [row("back", 0), row("right", 0), row("left", 0)],
          facade: [],
          window: [row("front", 1), row("front", 0), row("back", 1), row("left", 1), row("right", 1), row("back", 0), row("left", 0), row("right", 0)],
        }
      : {
          door: [row("front", 0), row("left", 0)],
          facade: upper.map((f) => row("front", f)),
          sliding: upper.map((f) => row("back", f)),
          window: [...upper.flatMap((f) => [row("left", f), row("right", f), row("back", f)]), row("left", 0), row("right", 0), row("back", 0), row("front", 0)],
        };

  // big openings first so they claim their walls, windows fill what is left
  const rank: Record<OpeningKind, number> = { facade: 0, door: 1, sliding: 2, window: 3 };
  for (const spec of [...specs].sort((a, b) => rank[a.kind] - rank[b.kind])) {
    const s = size(spec, m.storey);
    const gap = spec.kind === "facade" ? 0 : GAP;
    const r = order[spec.kind].find(
      (x) => x.used + s.w + (x.items.length ? gap : 0) <= x.length && !(spec.kind === "window" && x.items.some((i) => i.spec.kind === "facade")),
    );
    if (!r) continue;
    r.used += s.w + (r.items.length ? gap : 0);
    r.items.push({ spec, ...s });
  }

  const placed: Placed[] = [];
  for (const r of rows.values()) {
    if (!r.items.length) continue;
    const facade = r.items.every((i) => i.spec.kind === "facade");
    // keep the entrance in the middle of its wall
    const doors = r.items.filter((i) => i.spec.kind === "door");
    const rest = r.items.filter((i) => i.spec.kind !== "door");
    const items = [...rest.slice(0, Math.ceil(rest.length / 2)), ...doors, ...rest.slice(Math.ceil(rest.length / 2))];
    const total = items.reduce((a, i) => a + i.w, 0);
    const gap = facade ? 0 : (r.length + 1 - total) / (items.length + 1);
    let x = facade ? (r.length + 1 - total) / 2 : gap;
    for (const it of items) {
      it.pos = r.wall.origin.clone().addScaledVector(r.wall.along, x + it.w / 2).add(new THREE.Vector3(0, r.y + it.sill + it.h / 2, 0));
      it.normal = r.wall.normal.clone();
      x += it.w + gap;
      placed.push(it);
    }
  }
  return placed;
}

/* ───────────────────────── geometry ───────────────────────── */

const box = new THREE.BoxGeometry(1, 1, 1);

function bar(mat: THREE.Material, w: number, h: number, d: number, x: number, y: number, z: number) {
  const m = new THREE.Mesh(box, mat);
  m.scale.set(w, h, d);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

function rect(g: THREE.Object3D, mat: THREE.Material, w: number, h: number, t: number, d: number, z: number) {
  g.add(bar(mat, w, t, d, 0, h / 2 - t / 2, z), bar(mat, w, t, d, 0, -h / 2 + t / 2, z));
  g.add(bar(mat, t, h - 2 * t, d, -w / 2 + t / 2, 0, z), bar(mat, t, h - 2 * t, d, w / 2 - t / 2, 0, z));
}

/** Something that moves when the visitor presses Open. */
type Mover = { obj: THREE.Object3D; mode: "swing" | "tilt" | "slide"; amount: number; t: number };

type Built = { group: THREE.Group; frame: THREE.MeshStandardMaterial; glass: THREE.MeshPhysicalMaterial; placed: Placed; movers: Mover[] };

type Shared = { handle: THREE.Material; recess: THREE.MeshStandardMaterial };

function buildOpening(p: Placed, sh: Shared): Built {
  const { spec, w, h } = p;
  const g = new THREE.Group();
  const frame = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.45, metalness: 0.15 });
  const glass = new THREE.MeshPhysicalMaterial({ color: "#cfe3ee", roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.35, envMapIntensity: 1.6, clearcoat: 1 });
  const movers: Mover[] = [];
  const T = 0.085, D = 0.16, Z = 0.06;

  // dark reveal behind the glass so it reads as an opening (and glows at night)
  const recess = new THREE.Mesh(new THREE.PlaneGeometry(w, h), sh.recess);
  recess.position.z = 0.012;
  g.add(recess);
  g.add(bar(frame, w + 0.16, 0.05, 0.26, 0, -h / 2 - 0.02, Z + 0.04)); // sill / threshold
  rect(g, frame, w, h, T, D, Z);

  const pane = (parent: THREE.Object3D, pw: number, ph: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), glass);
    m.position.set(x, y, z);
    parent.add(m);
  };
  const handle = (parent: THREE.Object3D, x: number, y: number, z: number) => {
    parent.add(bar(sh.handle, 0.03, 0.16, 0.03, x, y, z), bar(sh.handle, 0.05, 0.05, 0.06, x, y + 0.08, z - 0.02));
  };
  /** A sash hinged on one edge: a pivot at the hinge holding the sash offset from it. */
  const hinged = (sw: number, shh: number, cx: number, hinge: "left" | "right" | "top", z: number, mode: Mover["mode"], amount: number) => {
    const pivot = new THREE.Group();
    const sash = new THREE.Group();
    if (hinge === "top") {
      pivot.position.set(cx, shh / 2, z);
      sash.position.set(0, -shh / 2, 0);
    } else {
      const s = hinge === "left" ? -1 : 1;
      pivot.position.set(cx + (s * sw) / 2, 0, z);
      sash.position.set((-s * sw) / 2, 0, 0);
    }
    pivot.add(sash);
    g.add(pivot);
    movers.push({ obj: pivot, mode, amount, t: 0 });
    return sash;
  };

  const iw = w - 2 * T, ih = h - 2 * T;
  if (spec.kind === "window") {
    if (spec.style === "Fixed") pane(g, iw, ih, 0, 0, Z - 0.01);
    else {
      const top = spec.style === "Awning";
      const sash = hinged(iw, ih, 0, top ? "top" : "left", Z + 0.035, top ? "tilt" : "swing", top ? 0.45 : spec.style === "Casement" ? -1.0 : 0.9);
      rect(sash, frame, iw, ih, 0.065, 0.08, 0);
      pane(sash, iw - 0.1, ih - 0.1, 0, 0, -0.01);
      if (top) handle(sash, 0, -ih / 2 + 0.12, 0.06);
      else handle(sash, iw / 2 - 0.12, 0, 0.06);
    }
  } else if (spec.kind === "door") {
    const leaves = spec.style === "Double entry" ? 2 : 1;
    const lw = iw / leaves;
    for (let i = 0; i < leaves; i++) {
      const cx = -iw / 2 + lw * (i + 0.5);
      const leaf = hinged(lw - 0.02, ih, cx, i === 0 ? "left" : "right", Z + 0.01, "swing", i === 0 ? -1.3 : 1.3);
      leaf.add(bar(frame, lw - 0.02, ih, 0.07, 0, 0, 0));
      pane(leaf, lw * 0.36, ih * 0.7, 0, ih * 0.05, 0.04);
      handle(leaf, (i === 0 ? 1 : -1) * (lw / 2 - 0.12), -0.05, 0.08);
    }
  } else if (spec.kind === "sliding") {
    const n = spec.style === "4-panel OXXO" ? 4 : 2;
    const pw = iw / n;
    for (let i = 0; i < n; i++) {
      const x = -iw / 2 + pw * (i + 0.5);
      const front = n === 4 ? i === 1 || i === 2 : i === 0;
      const panel = new THREE.Group();
      panel.position.set(x, 0, Z + (front ? 0.06 : 0));
      rect(panel, frame, pw + 0.04, ih, 0.065, 0.08, 0);
      pane(panel, pw - 0.08, ih - 0.1, 0, 0, -0.01);
      g.add(panel);
      if (front) {
        handle(panel, (i < n / 2 ? 1 : -1) * (pw / 2 - 0.1), 0, 0.06);
        movers.push({ obj: panel, mode: "slide", amount: (i < n / 2 ? 1 : -1) * pw * 0.88, t: 0 });
      }
    }
  } else {
    // curtain wall bay: vision glass above, spandrel at the slab, pressure-plate caps
    const spandrel = 0.7;
    pane(g, w, h - spandrel, 0, spandrel / 2, Z - 0.01);
    pane(g, w, spandrel, 0, -h / 2 + spandrel / 2, Z - 0.005);
    g.add(bar(frame, w, 0.08, 0.2, 0, -h / 2 + spandrel, Z + 0.02));
    g.add(bar(frame, w, 0.06, 0.2, 0, h * 0.18, Z + 0.02));
  }

  g.position.copy(p.pos!);
  g.lookAt(p.pos!.clone().add(p.normal!));
  g.traverse((o) => { o.userData.openingId = spec.id; });
  return { group: g, frame, glass, placed: p, movers };
}

function tree(x: number, z: number, s: number) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.14 * s, 1.1 * s, 8), new THREE.MeshStandardMaterial({ color: "#7a6a58", roughness: 1 }));
  trunk.position.y = 0.55 * s;
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.9 * s, 18, 14), new THREE.MeshStandardMaterial({ color: "#8fae86", roughness: 0.95 }));
  crown.position.y = 1.7 * s;
  crown.scale.y = 1.15;
  trunk.castShadow = crown.castShadow = true;
  g.add(trunk, crown);
  g.position.set(x, 0, z);
  return g;
}

/* ───────────────────────── sky & time of day ───────────────────────── */

type Light = { sky: string; horizon: string; ground: string; sun: string; sunI: number; hemi: number; az: number; el: number; glow: number; exposure: number };

const TIMES: Record<TimeOfDay, Light> = {
  morning: { sky: "#86aedb", horizon: "#f7e2cb", ground: "#e9ebe4", sun: "#ffe0bd", sunI: 2.1, hemi: 0.85, az: 2.3, el: 0.32, glow: 0, exposure: 1.0 },
  noon: { sky: "#5f98d6", horizon: "#e4eef7", ground: "#eceee8", sun: "#fff7ec", sunI: 2.7, hemi: 1.0, az: 0.6, el: 1.05, glow: 0, exposure: 1.05 },
  sunset: { sky: "#4c5f92", horizon: "#f6a978", ground: "#d9cfc4", sun: "#ff9f63", sunI: 2.0, hemi: 0.55, az: -1.1, el: 0.16, glow: 0.35, exposure: 1.0 },
  night: { sky: "#050a1c", horizon: "#1b2747", ground: "#2e3446", sun: "#9db2ff", sunI: 0.3, hemi: 0.12, az: -0.5, el: 0.9, glow: 1.8, exposure: 0.95 },
};

const SKY_VERT = `varying vec3 vP; void main(){ vP = (modelMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vP,1.0); }`;
const SKY_FRAG = `uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
void main(){ float h = normalize(vP).y; float t = pow(clamp(h*1.4+0.05,0.0,1.0),0.7); gl_FragColor = vec4(mix(bottom, top, t),1.0); }`;

/* ───────────────────────── component ───────────────────────── */

type Api = {
  rebuild: (type: BuildingType, specs: OpeningSpec[]) => void;
  paint: (specs: OpeningSpec[], swatches: Swatch[]) => void;
  focus: (id: string | null) => void;
  setTime: (t: TimeOfDay) => void;
  setOpen: (o: boolean) => void;
  view: (v: CameraView) => void;
};

export default function HouseCanvas({ type, specs, swatches, focusId, onFocus, time, open, view, viewKey, onPlaced }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const cb = useRef({ onFocus, onPlaced });
  const latest = useRef({ type, specs, swatches, focusId, time, open });
  useEffect(() => {
    cb.current = { onFocus, onPlaced };
    latest.current = { type, specs, swatches, focusId, time, open };
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", touchAction: "none" });
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.fog = new THREE.Fog("#e4eef7", 70, 190);

    const skyU = { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(220, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false }));
    scene.add(sky);

    // a few stars for the night view
    const starPos: number[] = [];
    for (let i = 0; i < 500; i++) {
      const a = Math.random() * Math.PI * 2, e = 0.12 + Math.random() * 1.3;
      starPos.push(Math.cos(a) * Math.cos(e) * 200, Math.sin(e) * 200, Math.sin(a) * Math.cos(e) * 200);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: "#ffffff", size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0, fog: false });
    scene.add(new THREE.Points(starGeo, starMat));

    const hemi = new THREE.HemisphereLight(0xffffff, 0xd9d4c8, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.radius = 6;
    scene.add(sun, sun.target);

    const groundMat = new THREE.MeshStandardMaterial({ color: "#eceee8", roughness: 1 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(200, 64), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 1.2;
    controls.maxDistance = 110;
    controls.enablePan = false;
    let fly: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
    controls.addEventListener("start", () => { fly = null; });

    const shared: Shared = {
      handle: new THREE.MeshStandardMaterial({ color: "#c9cbcc", metalness: 0.9, roughness: 0.25 }),
      recess: new THREE.MeshStandardMaterial({ color: "#2b3036", roughness: 0.6, emissive: "#ffc77a", emissiveIntensity: 0 }),
    };

    let model = new THREE.Group();
    let built: Built[] = [];
    let mass: Massing = { W: 12, D: 9, storeys: 2, storey: 3 };
    let home = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
    let hover: string | null = null;
    let focused: string | null = null;
    let opening = false;

    // lighting state eases toward the chosen time of day
    const cur = { ...TIMES.noon, skyC: new THREE.Color(TIMES.noon.sky), horC: new THREE.Color(TIMES.noon.horizon), gC: new THREE.Color(TIMES.noon.ground), sunC: new THREE.Color(TIMES.noon.sun) };
    let goal = TIMES.noon;

    const dispose = (g: THREE.Object3D) =>
      g.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          if (o.geometry !== box) o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m !== shared.handle && m !== shared.recess) m.dispose(); });
        }
      });

    const rebuild = (t: BuildingType, list: OpeningSpec[]) => {
      scene.remove(model);
      dispose(model);
      model = new THREE.Group();
      const m = (mass = massing(t, list));
      const H = m.storeys * m.storey;
      const wallMat = new THREE.MeshStandardMaterial({ color: t === "house" ? "#f4f1ea" : "#e7e6e2", roughness: 0.92 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(m.W, H, m.D), wallMat);
      body.position.y = H / 2;
      body.castShadow = body.receiveShadow = true;
      model.add(body);
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(m.W + 0.3, 0.25, m.D + 0.3), new THREE.MeshStandardMaterial({ color: "#c9c6bf", roughness: 1 }));
      plinth.position.y = 0.125;
      plinth.receiveShadow = true;
      model.add(plinth);

      if (t === "house") {
        const roofH = 2.6, eave = 0.5;
        const tri = new THREE.Shape([new THREE.Vector2(-m.D / 2 - eave, 0), new THREE.Vector2(m.D / 2 + eave, 0), new THREE.Vector2(0, roofH)]);
        const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: m.W + eave * 2, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: "#3d4247", roughness: 0.8 }));
        roof.rotation.y = Math.PI / 2;
        roof.position.set(-m.W / 2 - eave, H - 0.02, 0);
        roof.castShadow = true;
        model.add(roof);
        const gable = new THREE.Shape([new THREE.Vector2(-m.D / 2, 0), new THREE.Vector2(m.D / 2, 0), new THREE.Vector2(0, roofH - 0.35)]);
        const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: m.W - 0.02, bevelEnabled: false }), wallMat);
        gm.rotation.y = Math.PI / 2;
        gm.position.set(-m.W / 2 + 0.01, H, 0);
        model.add(gm);
        const path = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 7), new THREE.MeshStandardMaterial({ color: "#d8d4cc", roughness: 1 }));
        path.rotation.x = -Math.PI / 2;
        path.position.set(0, 0.01, m.D / 2 + 3.5);
        path.receiveShadow = true;
        model.add(path);
        model.add(tree(-m.W / 2 - 2.5, m.D / 2 + 2, 1.2), tree(m.W / 2 + 2.8, m.D / 2 + 0.5, 1), tree(m.W / 2 + 2.2, -m.D / 2 - 1.5, 1.3), tree(-m.W / 2 - 2, -m.D / 2 - 2.5, 0.9));
      } else {
        const slab = new THREE.MeshStandardMaterial({ color: "#d3d2ce", roughness: 0.9 });
        for (let f = 1; f <= m.storeys; f++) {
          const s = new THREE.Mesh(new THREE.BoxGeometry(m.W + 0.12, 0.18, m.D + 0.12), slab);
          s.position.y = f * m.storey;
          s.castShadow = true;
          model.add(s);
        }
        const parapet = new THREE.Mesh(new THREE.BoxGeometry(m.W + 0.12, 0.6, m.D + 0.12), wallMat);
        parapet.position.y = H + 0.3;
        model.add(parapet);
        model.add(tree(-m.W / 2 - 3, m.D / 2 + 3, 1.4), tree(m.W / 2 + 3, m.D / 2 + 3, 1.2), tree(m.W / 2 + 3.5, -m.D / 2 - 2, 1.5));
      }

      const placed = layout(t, list, m);
      built = placed.map((p) => buildOpening(p, shared));
      built.forEach((b) => model.add(b.group));
      scene.add(model);
      cb.current.onPlaced?.(placed.length);

      const R = Math.max(m.W, m.D, H) * 1.6;
      const sc = sun.shadow.camera;
      sc.left = sc.bottom = -R;
      sc.right = sc.top = R;
      sc.far = R * 5;
      sc.updateProjectionMatrix();
      home = presetPose("front");
      if (!focused) {
        camera.position.copy(home.pos);
        controls.target.copy(home.target);
      }
    };

    const presetPose = (v: CameraView | "home") => {
      const H = mass.storeys * mass.storey;
      // narrow (phone) viewports need to stand further back to fit the width
      const d = (Math.max(mass.W, H) * 2.1 + 6) * Math.max(1, 1.25 / camera.aspect);
      const target = new THREE.Vector3(0, H * 0.42, 0);
      const dir: Record<CameraView | "home", THREE.Vector3> = {
        home: new THREE.Vector3(0.62, 0.38, 0.78),
        front: new THREE.Vector3(0.35, 0.22, 1),
        back: new THREE.Vector3(-0.35, 0.22, -1),
        left: new THREE.Vector3(-1, 0.22, 0.3),
        right: new THREE.Vector3(1, 0.22, -0.3),
        aerial: new THREE.Vector3(0.5, 1.4, 0.7),
      };
      const pos = target.clone().addScaledVector(dir[v].normalize(), d);
      return { pos, target };
    };

    const paint = (list: OpeningSpec[], sw: Swatch[]) => {
      const byId = new Map(list.map((s) => [s.id, s]));
      for (const b of built) {
        const s = byId.get(b.placed.spec.id);
        if (!s) continue;
        const swc = sw.find((x) => x.name === s.color);
        b.frame.color.set(swc?.hex ?? "#ffffff");
        b.frame.roughness = swc?.wood ? 0.75 : 0.45;
        const g = GLASS.find((x) => x.name === s.glass) ?? GLASS[0];
        b.glass.color.set(g.hex);
        b.glass.opacity = g.opacity;
      }
    };

    const focus = (id: string | null) => {
      focused = id;
      const b = id ? built.find((x) => x.placed.spec.id === id) : null;
      if (!b) {
        fly = { pos: home.pos.clone(), target: home.target.clone() };
        return;
      }
      const { pos, normal, w, h } = b.placed;
      const d = Math.max(w * 1.15, h * 1.3) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) + 0.8;
      const side = new THREE.Vector3().crossVectors(normal!, new THREE.Vector3(0, 1, 0)).multiplyScalar(d * 0.28);
      const drop = new THREE.Vector3(0, -d * 0.22, 0); // aim below the opening so it sits above the dock
      fly = { target: pos!.clone().add(drop), pos: pos!.clone().addScaledVector(normal!, d * 1.15).add(side).add(new THREE.Vector3(0, d * 0.12, 0)).add(drop) };
    };

    api.current = {
      rebuild,
      paint,
      focus,
      setTime: (t) => { goal = TIMES[t]; },
      setOpen: (o) => { opening = o; },
      view: (v) => {
        focused = null;
        const p = presetPose(v);
        fly = p;
        home = p;
      },
    };

    /* picking */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (e: PointerEvent): string | null => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(model, true)[0];
      return (hit?.object.userData.openingId as string | undefined) ?? null;
    };
    let down: { x: number; y: number } | null = null;
    const el = renderer.domElement;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onMove = (e: PointerEvent) => {
      hover = pick(e);
      el.style.cursor = hover ? "pointer" : "grab";
    };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      down = null;
      cb.current.onFocus(pick(e));
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);

    const fit = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = Math.max(1, width) / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    // initial state from the first render's props
    const l = latest.current;
    rebuild(l.type, l.specs);
    paint(l.specs, l.swatches);
    goal = TIMES[l.time];
    Object.assign(cur, goal);
    opening = l.open;

    const hi = new THREE.Color("#3a6dba");
    const tmp = new THREE.Color();
    let raf = 0;
    let clock = 0;
    let last = performance.now();
    // frame-rate independent easing: `rate` is how quickly a value closes the gap per second
    const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock += dt;
      if (fly) {
        const f = ease(4.5, dt);
        camera.position.lerp(fly.pos, f);
        controls.target.lerp(fly.target, f);
        if (camera.position.distanceTo(fly.pos) < 0.01) fly = null;
      }

      // time of day
      const k = ease(2.5, dt);
      cur.skyC.lerp(tmp.set(goal.sky), k);
      cur.horC.lerp(tmp.set(goal.horizon), k);
      cur.gC.lerp(tmp.set(goal.ground), k);
      cur.sunC.lerp(tmp.set(goal.sun), k);
      for (const key of ["sunI", "hemi", "az", "el", "glow", "exposure"] as const) cur[key] += (goal[key] - cur[key]) * k;
      skyU.top.value.copy(cur.skyC);
      skyU.bottom.value.copy(cur.horC);
      (scene.fog as THREE.Fog).color.copy(cur.horC);
      groundMat.color.copy(cur.gC);
      hemi.intensity = cur.hemi;
      hemi.color.copy(cur.skyC).lerp(tmp.set("#ffffff"), 0.6);
      sun.color.copy(cur.sunC);
      sun.intensity = cur.sunI;
      const R = Math.max(mass.W, mass.D, mass.storeys * mass.storey) * 1.6;
      sun.position.set(Math.sin(cur.az) * Math.cos(cur.el) * R * 2, Math.sin(cur.el) * R * 2 + 2, Math.cos(cur.az) * Math.cos(cur.el) * R * 2);
      renderer.toneMappingExposure = cur.exposure;
      scene.environmentIntensity = 0.08 + cur.hemi * 0.9;
      shared.recess.emissiveIntensity = cur.glow;
      starMat.opacity = Math.max(0, cur.glow - 0.6);

      for (const b of built) {
        const id = b.placed.spec.id;
        b.frame.emissive.copy(hi);
        b.frame.emissiveIntensity = id === focused ? 0.16 + Math.sin(clock * 3) * 0.08 : id === hover ? 0.22 : 0;
        for (const m of b.movers) {
          m.t += ((opening ? 1 : 0) - m.t) * ease(3, dt);
          const e = m.t * m.t * (3 - 2 * m.t);
          if (m.mode === "swing") m.obj.rotation.y = e * m.amount;
          else if (m.mode === "tilt") m.obj.rotation.x = e * m.amount;
          else m.obj.position.x = (m.obj.userData.x0 ??= m.obj.position.x) + e * m.amount;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      dispose(scene);
      starGeo.dispose();
      starMat.dispose();
      shared.handle.dispose();
      shared.recess.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      el.remove();
      api.current = null;
    };
  }, []);

  // rebuild only when the layout changes; colour and glass repaint in place
  const layoutKey = type + "|" + specs.map((s) => `${s.id}:${s.kind}:${s.style}`).join(",");
  useEffect(() => {
    const l = latest.current;
    api.current?.rebuild(l.type, l.specs);
    api.current?.paint(l.specs, l.swatches);
    api.current?.focus(l.focusId);
  }, [layoutKey]);
  useEffect(() => { api.current?.paint(specs, swatches); }, [specs, swatches]);
  useEffect(() => { api.current?.focus(focusId); }, [focusId]);
  useEffect(() => { api.current?.setTime(time); }, [time]);
  useEffect(() => { api.current?.setOpen(open); }, [open]);
  useEffect(() => { if (viewKey) api.current?.view(view); }, [view, viewKey]);

  return <div ref={hostRef} className="h-full w-full" />;
}
