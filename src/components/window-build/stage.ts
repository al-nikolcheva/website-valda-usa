import * as THREE from "three";
import {
  NODES,
  ROUTER_PATH,
  ROUTER_STEP,
  ROUTER_T0,
  SAW_LOW,
  SAW_STEP,
  SAW_T0,
  SAW_TOP,
  STEPS,
  sawAt,
  type Geo,
  type Mat,
  type Node,
  type Pose,
  type Section,
  type Vec3,
} from "./plan";

/*
 * A line-art stage for the window build (after Bygga's stage): every part is a white solid with ink edges,
 * the parts of the current step are drawn in VALDA blue, and moving between two steps animates each part
 * from its pose in one to its pose in the other. Orthographic camera, fitted to what is on the bench.
 */

const EDGE = new THREE.Color(0x3a3a3d);
const ACCENT = new THREE.Color(0x1f4e8c);
const TINT = new THREE.Color(0xdde6f3);

const LOOK: Record<Mat, { face: number; opacity?: number; edge?: number; edgeOpacity?: number; tint?: number }> = {
  pvc: { face: 0xffffff },
  steel: { face: 0xc9ced5 },
  gasket: { face: 0x3a3a3d },
  glass: { face: 0xdfe8f2, opacity: 0.42, edgeOpacity: 0.7 },
  spacer: { face: 0xaeb5be },
  hw: { face: 0xd7dade },
  block: { face: 0x5e7192 },
  wrap: { face: 0xffffff, opacity: 0.32, edgeOpacity: 0.35, tint: 0 },
  card: { face: 0xdccaa6 },
  label: { face: 0xffffff },
  tool: { face: 0xe4e7eb, opacity: 0.9 },
};

const PART_DUR = 0.9;
const FADE = 0.35;
const CAM_DUR = 1.1;
const PAD = 1.2;

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeLand = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const v3 = (a: Vec3) => new THREE.Vector3(a[0], a[1], a[2]);
const quat = (r: Vec3 = [0, 0, 0]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2], "XYZ"));

/* ── Geometry ────────────────────────────────────────────── */

/** Extrude a profile section along x; with miter, each point at depth-in a runs from x = a to x = len - a (45° ends). */
function barGeometry(sec: Section, len: number, miter: boolean) {
  const shape = new THREE.Shape(sec.outer.map(([a, z]) => new THREE.Vector2(a, z)));
  for (const h of sec.holes) shape.holes.push(new THREE.Path(h.map(([a, z]) => new THREE.Vector2(a, z))));
  const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false, steps: 1 });
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const a = pos.getX(i);
    const z = pos.getY(i);
    const t = pos.getZ(i);
    const a0 = miter ? a : 0;
    pos.setXYZ(i, a0 + t * (len - 2 * a0), a, z);
  }
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g.computeVertexNormals();
  return g;
}

function makeGeometry(geo: Geo): THREE.BufferGeometry {
  if (geo.kind === "bar") return barGeometry(geo.section, geo.length, geo.miter);
  if (geo.kind === "cyl") return new THREE.CylinderGeometry(geo.r, geo.r, geo.h, 48);
  const [x, y, z] = geo.size;
  const g = new THREE.BoxGeometry(x, y, z);
  if (!geo.centered) g.translate(x / 2, y / 2, z / 2);
  return g;
}

/* ── Poses per step ──────────────────────────────────────── */

interface Resolved {
  shown: boolean;
  p: THREE.Vector3;
  q: THREE.Quaternion;
  ghost: number;
}

function resolve(def: Node, step: number): Resolved {
  const keys = Object.keys(def.poses).map(Number).sort((a, b) => a - b);
  let p: Vec3 | undefined;
  let r: Vec3 | undefined;
  let shown = false;
  let ghost = 0;
  for (const k of keys) {
    if (k > step) {
      // not made yet: keep it where it will first appear
      if (!p) ({ p, r } = def.poses[k]);
      break;
    }
    const pose = def.poses[k];
    if (pose.hidden) shown = false;
    else {
      shown = true;
      p = pose.p ?? p;
      r = pose.r ?? r;
      ghost = pose.ghost ? 1 : 0;
    }
  }
  return { shown, p: v3(p ?? [0, 0, 0]), q: quat(r), ghost };
}

/* ── Stage ───────────────────────────────────────────────── */

interface RNode {
  def: Node;
  obj: THREE.Object3D;
  mesh?: THREE.Mesh;
  fm?: THREE.MeshLambertMaterial;
  lm?: THREE.LineBasicMaterial;
  look?: (typeof LOOK)[Mat];
  ancestors: string[];
  hl: number;
}

export class BuildStage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 80000);
  private nodes: RNode[] = [];
  private byKey = new Map<string, RNode>();
  private disposables: { dispose: () => void }[] = [];
  private shadow: THREE.Mesh;

  private from = 0;
  private to = 0;
  private t = 0;
  private forward = true;
  private boxFrom = new THREE.Box3();
  private boxTo = new THREE.Box3();
  private viewFrom = { az: 0, el: 0 };
  private viewTo = { az: 0, el: 0 };
  private user = { az: 0, el: 0 };

  private raf = 0;
  private last = 0;
  private visible = true;
  private reduced: boolean;
  private w = 1;
  private h = 1;
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private cleanup: (() => void)[] = [];

  constructor(private host: HTMLElement) {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = this.renderer.domElement;
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block", touchAction: "pan-y", cursor: "grab" });
    host.appendChild(canvas);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(-0.35, 1, 0.55);
    this.scene.add(sun);

    this.shadow = this.makeShadow();
    this.scene.add(this.shadow);
    this.build();

    this.boxTo = this.fitBox(0);
    this.boxFrom.copy(this.boxTo);
    this.viewFrom = { ...STEPS[0].view };
    this.viewTo = { ...STEPS[0].view };
    // the first step plays in on load
    this.from = -1;
    this.forward = true;
    this.t = this.reduced ? 1e3 : 0;

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.schedule();
    });
    this.io.observe(host);
    const onVis = () => this.schedule();
    document.addEventListener("visibilitychange", onVis);
    this.cleanup.push(() => document.removeEventListener("visibilitychange", onVis));
    this.bindDrag(canvas);
    this.resize();
  }

  /** Go to a step: the next one animates its parts in; any other jump glides straight there. */
  go(step: number) {
    if (step === this.to && this.t > 0) return;
    this.boxFrom.copy(this.currentBox());
    this.viewFrom = this.currentView();
    this.forward = step === this.to + 1;
    this.from = this.to;
    this.to = step;
    this.t = this.reduced ? 1e3 : 0;
    this.boxTo = this.fitBox(step);
    this.viewTo = { ...STEPS[step].view };
    this.schedule();
  }

  /** Play the current step again from the previous one. */
  replay() {
    if (this.to === 0) return;
    const s = this.to;
    this.to = s - 1;
    this.t = 1e3;
    this.apply(1e3, 0);
    this.go(s);
  }

  resetView() {
    this.user = { az: 0, el: 0 };
    this.schedule();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    this.cleanup.forEach((f) => f());
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  /* ── setup ── */

  private build() {
    const root = new THREE.Group();
    this.scene.add(root);
    for (const def of NODES) {
      const obj = new THREE.Group();
      const rn: RNode = { def, obj, ancestors: [], hl: 0 };
      if (def.geo && def.mat) {
        const look = LOOK[def.mat];
        const g = makeGeometry(def.geo);
        const fm = new THREE.MeshLambertMaterial({
          color: look.face,
          transparent: true,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
        const eg = new THREE.EdgesGeometry(g, 20);
        const lm = new THREE.LineBasicMaterial({ color: EDGE, transparent: true });
        const mesh = new THREE.Mesh(g, fm);
        mesh.add(new THREE.LineSegments(eg, lm));
        obj.add(mesh);
        Object.assign(rn, { mesh, fm, lm, look });
        this.disposables.push(g, eg, fm, lm);
      }
      const parent = def.parent ? this.byKey.get(def.parent) : undefined;
      if (parent) rn.ancestors = [parent.def.key, ...parent.ancestors];
      (parent?.obj ?? root).add(obj);
      this.nodes.push(rn);
      this.byKey.set(def.key, rn);
    }
  }

  private makeShadow() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, "rgba(34,34,36,0.14)");
      grd.addColorStop(0.55, "rgba(34,34,36,0.05)");
      grd.addColorStop(1, "rgba(34,34,36,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    this.disposables.push(tex, geo, mat);
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = -1;
    return m;
  }

  private bindDrag(el: HTMLElement) {
    let id = -1;
    let x = 0;
    let y = 0;
    const down = (e: PointerEvent) => {
      id = e.pointerId;
      x = e.clientX;
      y = e.clientY;
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      if (e.pointerType !== "touch" || Math.abs(e.clientX - x) > Math.abs(e.clientY - y)) {
        this.user.az -= (e.clientX - x) * 0.007;
        if (e.pointerType !== "touch") this.user.el = Math.max(-0.25, Math.min(0.9, this.user.el + (e.clientY - y) * 0.005));
      }
      x = e.clientX;
      y = e.clientY;
      this.schedule();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      el.style.cursor = "grab";
    };
    const dbl = () => this.resetView();
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("dblclick", dbl);
    this.cleanup.push(() => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("dblclick", dbl);
    });
  }

  private resize() {
    const r = this.host.getBoundingClientRect();
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.renderer.setSize(this.w, this.h, false);
    this.render();
  }

  /* ── animation ── */

  private schedule() {
    if (this.raf || !this.visible || document.hidden) return;
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    const dt = this.last && now - this.last < 200 ? (now - this.last) / 1000 : 0;
    this.last = now;
    this.t += dt;
    this.apply(this.t, dt);
    this.render();
    // keep running while a step plays, a live loop runs, or a highlight is still easing
    if (this.busy()) this.schedule();
    else this.last = 0;
  };

  private busy() {
    if (this.t < this.stepLength() + CAM_DUR) return true;
    if (!this.reduced && STEPS[this.to].id === "check") return true;
    return this.nodes.some((n) => Math.abs(n.hl - this.hlTarget(n)) > 0.01);
  }

  private stepLength() {
    let end = 0;
    for (const n of this.nodes) {
      const p = n.def.poses[this.to];
      if (p) end = Math.max(end, (p.delay ?? 0) + (p.dur ?? PART_DUR));
    }
    return Math.max(end, this.to === 1 ? SAW_T0 + 4 * SAW_STEP : 0, this.to === 3 ? ROUTER_T0 + ROUTER_PATH.length * ROUTER_STEP : 0);
  }

  private hlTarget(n: RNode) {
    const s = STEPS[this.to];
    const match = (k: string) => s.focus!.some((f) => (f.endsWith("*") ? k.startsWith(f.slice(0, -1)) : k === f));
    if (s.focus) return match(n.def.key) || n.ancestors.some(match) ? 1 : 0;
    const p = n.def.poses[this.to];
    return p && !p.hidden ? 1 : 0;
  }

  /** Put every part where it is t seconds into the move from `from` to `to`. */
  private apply(t: number, dt = 1, withLive = true) {
    const fwd = this.forward;
    for (const n of this.nodes) {
      const A = resolve(n.def, this.from);
      const B = resolve(n.def, this.to);
      const entry: Pose | undefined = fwd ? n.def.poses[this.to] : undefined;
      const delay = entry?.delay ?? 0;
      const dur = fwd ? (entry?.dur ?? PART_DUR) : 0.7;
      const k = clamp01((t - delay) / dur);
      let op = 1;
      let ghost = B.ghost;
      if (!n.def.geo) {
        // groups simply move
        n.obj.position.lerpVectors(A.p, B.p, easeInOut(k));
        n.obj.quaternion.slerpQuaternions(A.q, B.q, easeInOut(k));
        continue;
      }
      if (A.shown && B.shown) {
        n.obj.position.lerpVectors(A.p, B.p, easeInOut(k));
        n.obj.quaternion.slerpQuaternions(A.q, B.q, easeInOut(k));
        ghost = A.ghost + (B.ghost - A.ghost) * easeInOut(k);
      } else if (B.shown) {
        const start = B.p.clone().add(entry?.from ? v3(entry.from) : new THREE.Vector3());
        n.obj.position.lerpVectors(start, B.p, easeLand(k));
        n.obj.quaternion.copy(B.q);
        op = clamp01((t - delay) / FADE);
      } else if (A.shown) {
        n.obj.position.copy(A.p);
        n.obj.quaternion.copy(A.q);
        op = 1 - clamp01((t - (fwd ? delay : 0)) / FADE);
        ghost = A.ghost;
      } else op = 0;

      n.obj.visible = op > 0.002;
      n.hl += (this.hlTarget(n) - n.hl) * Math.min(1, dt * 7);
      const look = n.look!;
      const base = look.opacity ?? 1;
      const fo = base * op * (1 - 0.84 * ghost);
      n.fm!.opacity = fo;
      n.fm!.depthWrite = fo > 0.99;
      n.fm!.color.set(look.face).lerp(TINT, (look.tint ?? 0.55) * n.hl);
      n.lm!.opacity = (look.edgeOpacity ?? 1) * op * (1 - 0.55 * ghost);
      n.lm!.color.copy(EDGE).lerp(ACCENT, n.hl);
    }
    if (withLive && !this.reduced) this.live(t);
  }

  /** Tools and moving parts that play over a step. */
  private live(t: number) {
    const id = STEPS[this.to].id;
    const get = (k: string) => this.byKey.get(k)!.obj;
    if (id === "cut") {
      const i = Math.min(3, Math.max(0, Math.floor((t - SAW_T0) / SAW_STEP)));
      const u = clamp01((t - SAW_T0 - i * SAW_STEP) / SAW_STEP);
      const y = SAW_TOP - (SAW_TOP - SAW_LOW) * Math.sin(Math.PI * u);
      const { a, b } = sawAt(i);
      get("saw-a").position.set(a[0], y, a[1]);
      get("saw-b").position.set(b[0], y, b[1]);
      const spin = t * 9;
      get("saw-a").rotateY(spin % (Math.PI * 2));
      get("saw-b").rotateY(spin % (Math.PI * 2));
    } else if (id === "machine") {
      const n = ROUTER_PATH.length;
      const j = Math.min(n - 1, Math.max(0, Math.floor((t - ROUTER_T0) / ROUTER_STEP)));
      const u = clamp01((t - ROUTER_T0 - j * ROUTER_STEP) / ROUTER_STEP);
      const prev = ROUTER_PATH[Math.max(0, j - 1)];
      const cur = ROUTER_PATH[j];
      const m = easeInOut(clamp01(u / 0.35));
      const dip = u > 0.35 ? Math.sin((Math.PI * (u - 0.35)) / 0.65) : 0;
      const lift = 90 * (1 - dip);
      const r = get("router");
      r.position.set(prev[0] + (cur[0] - prev[0]) * m, prev[1] + (cur[1] - prev[1]) * m, cur[2] + 70 + lift);
      r.rotateY((t * 14) % (Math.PI * 2));
    } else if (id === "check") {
      this.tiltTurn(t - 1.9);
    }
  }

  /** Handle up → tilt open and shut → handle across → turn open and shut → handle down. */
  private tiltTurn(t: number) {
    const get = (k: string) => this.byKey.get(k)!.obj;
    if (t < 0) return;
    const c = t % 8;
    const seg = (a: number, b: number) => easeInOut(clamp01((c - a) / (b - a)));
    const D = Math.PI / 180;
    const lever = 180 * seg(0, 0.6) * (1 - seg(2.9, 3.4)) - 90 * seg(2.9, 3.4) * (1 - seg(7.2, 7.7));
    const tilt = 9 * seg(0.7, 1.7) * (1 - seg(2.1, 2.9));
    const turn = -42 * seg(3.6, 4.8) * (1 - seg(5.8, 7.0));
    get("lever").rotation.z = lever * D;
    get("tilt").rotation.x = tilt * D;
    get("turn").rotation.y = turn * D;
  }

  /* ── camera ── */

  private fitBox(step: number) {
    const saved = { from: this.from, to: this.to, t: this.t, fwd: this.forward };
    this.from = step;
    this.to = step;
    this.forward = false;
    const box = new THREE.Box3();
    const add = () => {
      this.scene.updateMatrixWorld(true);
      for (const n of this.nodes) if (n.mesh && n.obj.visible && resolve(n.def, step).shown) box.expandByObject(n.mesh);
    };
    this.apply(1e3, 0, false);
    add();
    for (const lt of STEPS[step].fitLive ?? []) {
      this.tiltTurn(lt);
      add();
    }
    Object.assign(this, { from: saved.from, to: saved.to, t: saved.t, forward: saved.fwd });
    this.apply(saved.t, 0);
    return box;
  }

  private camK() {
    return easeInOut(clamp01(this.t / CAM_DUR));
  }

  private currentBox() {
    const k = this.camK();
    return new THREE.Box3(this.boxFrom.min.clone().lerp(this.boxTo.min, k), this.boxFrom.max.clone().lerp(this.boxTo.max, k));
  }

  private currentView() {
    const k = this.camK();
    return { az: this.viewFrom.az + (this.viewTo.az - this.viewFrom.az) * k, el: this.viewFrom.el + (this.viewTo.el - this.viewFrom.el) * k };
  }

  private render() {
    const box = this.currentBox();
    const view = this.currentView();
    const az = view.az + this.user.az;
    const el = Math.max(-0.2, Math.min(1.35, view.el + this.user.el));
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const center = box.getCenter(new THREE.Vector3());
    const cam = this.camera;
    cam.position.copy(center).addScaledVector(dir, 30000);
    cam.up.set(0, 1, 0);
    cam.lookAt(center);
    cam.updateMatrixWorld(true);

    // frame the box's corners in view space
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    const p = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      p.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).applyMatrix4(cam.matrixWorldInverse);
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
      y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    const aspect = this.w / this.h;
    const vh = Math.max((y1 - y0) * PAD, ((x1 - x0) * PAD) / aspect, 400);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    cam.left = cx - (vh * aspect) / 2;
    cam.right = cx + (vh * aspect) / 2;
    cam.top = cy + vh / 2;
    cam.bottom = cy - vh / 2;
    cam.updateProjectionMatrix();

    const size = box.getSize(new THREE.Vector3());
    this.shadow.position.set(center.x, -1, center.z);
    this.shadow.scale.set(Math.max(400, size.x * 1.4), Math.max(500, size.z * 1.8 + size.x * 0.25), 1);
    this.renderer.render(this.scene, cam);
  }
}
