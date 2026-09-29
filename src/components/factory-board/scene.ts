import * as THREE from "three";
import { BLUE, EDGE, Kit, wallWithOpenings } from "@/components/ship/journey/kit";
import { makeContainer, makeTruck } from "@/components/ship/journey/models";
import { Batch } from "./batch";
import { MEZZ_Y, OFFICES, ZONES } from "./zones";

/*
 * Modelled on VALDA's Sofia factory (public/models/valda-dolni-bogorov.obj). The OBJ gives the real
 * loading shutters, canopies and west entry volume; the hall is rebuilt here as a clean dollhouse cutaway
 * along the same rotated footprint. Hall-local metres: x 0 → 83.76 west → east, z 0 → 24.18 north → south.
 * The process runs west → east: goods in at the western doors, packing & shipping at the eastern doors.
 */

const NW = { x: -43.81254916, y: 17.69988 }; // footprint NW corner (OBJ x/y, Z-up; three z = −y)
const ROT_Y = -0.06303900774256878;
const L = 83.76;
const W = 24.18;
const H = 7.8;
const CUT = 1.2; // near walls cut to this height
const EX0 = 29.34; // northern extension (offices)
const EX1 = 54.18;
const EZ0 = -10.61;
const EZ1 = -0.12;
const EH = 5.1;
const AISLE_Z = 21.6; // forklift aisle along the south wall
const IN_DOCK = 8.5; // shutter 1 (goods in)
const OUT_DOCK = 70.2; // shutter 12 (shipping)

export const MODEL_URL = "/models/valda-dolni-bogorov.obj";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ping = (t: number, period: number) => {
  const x = (((t / period) % 1) + 1) % 1;
  return ease(x < 0.5 ? x * 2 : 2 - x * 2);
};
const lambert = (color: number, extra: THREE.MeshLambertMaterialParameters = {}) =>
  new THREE.MeshLambertMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...extra });

export interface FactoryZoneHandle {
  /** label anchor */
  anchor: THREE.Object3D;
  floor: THREE.Mesh;
  bounds: THREE.Box3;
}

export interface FactoryState {
  active: number;
  life: boolean;
}

export function buildFactory() {
  const kit = new Kit();
  // edges: crisp on machines, lighter on the building
  kit.edge.transparent = true;
  kit.edge.opacity = 0.8;
  const bEdge = kit.track(new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.5 }));
  const B = new Batch(kit);
  const scene = new THREE.Scene();
  // illustration shading: top ≈ #ffffff, east faces ≈ #eceef1, south faces ≈ #dfe2e7
  scene.add(new THREE.AmbientLight(0xffffff, 1.73));
  const sun = new THREE.DirectionalLight(0xffffff, 1.78);
  sun.position.set(0.51, 0.79, 0.33).multiplyScalar(40);
  scene.add(sun);
  const m4 = new THREE.Matrix4();

  const hall = new THREE.Group();
  hall.position.set(NW.x, 0, -NW.y);
  hall.rotation.y = ROT_Y;
  scene.add(hall);

  const mat = {
    clad: kit.track(lambert(0x2a5da6)),
    yellow: kit.track(lambert(0xe2b54a)),
    green: kit.track(lambert(0x6f9a7a)),
    mark: kit.track(lambert(0xeedc8f)),
    apron: kit.track(lambert(0xeeeeef)),
    shutter: kit.track(lambert(0xd8dbdf)),
    entry: kit.track(lambert(0x234a86)),
    screen: kit.track(lambert(0xe8ecf2)),
  };
  const ribs = kit.track(new THREE.LineBasicMaterial({ color: 0x173f73, transparent: true, opacity: 0.7 }));
  const ribLines: number[] = [];
  /** single mesh with a custom material */
  const mbox = (parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material, line: THREE.LineBasicMaterial | null = kit.edge) => {
    const mesh = kit.box(parent, w, h, d, x, y, z, "white", line);
    mesh.material = m;
    return mesh;
  };

  /* ── Floor, apron, dollhouse shell ── */
  B.box(L + 0.6, 0.3, W + 0.6, -0.3, -0.3, -0.3, "ground", bEdge);
  B.box(EX1 - EX0, 0.3, EZ1 - EZ0, EX0, -0.3, EZ0, "ground", bEdge);
  for (const x of [IN_DOCK, OUT_DOCK + 0.9]) B.box(9, 0.12, 9, x - 4.5, -0.14, W + 0.3, mat.apron, null); // small aprons at the two docks
  const wallX = (x0: number, x1: number, z: number, h: number, out: number) => {
    const w = x1 - x0;
    B.box(w, h, 0.15, x0, 0, out < 0 ? z - 0.3 : z + 0.15, mat.clad, bEdge);
    B.box(w, h, 0.15, x0, 0, out < 0 ? z - 0.15 : z, "white", bEdge);
    B.box(w, 0.16, 0.36, x0, h, z - (out < 0 ? 0.33 : 0.03), "white", bEdge); // white top edge / parapet
  };
  const wallZ = (z0: number, z1: number, x: number, h: number, out: number) => {
    const d = z1 - z0;
    B.box(0.15, h, d, out < 0 ? x - 0.3 : x + 0.15, 0, z0, mat.clad, bEdge);
    B.box(0.15, h, d, out < 0 ? x - 0.15 : x, 0, z0, "white", bEdge);
    B.box(0.36, 0.16, d, x - (out < 0 ? 0.33 : 0.03), h, z0, "white", bEdge);
  };
  // far walls full height (north, west) with a parapet; north drops to a glazed rail by the offices
  wallX(0, EX0, 0, H, -1);
  wallX(EX1, L, 0, H, -1);
  wallX(EX0, EX1, 0, MEZZ_Y + 0.3, -1);
  B.box(EX1 - EX0, 1, 0.05, EX0, MEZZ_Y + 0.46, -0.1, "glass", kit.edgeSoft);
  wallZ(0, W, 0, H, -1);
  B.box(L, 0.5, 0.5, 0, H + 0.16, -0.5, "white", bEdge); // parapet
  B.box(0.5, 0.5, W, -0.5, H + 0.16, 0, "white", bEdge);
  // near walls cut low with a clean white top
  wallX(0, L, W, CUT, 1);
  wallZ(0, W, L, CUT, 1);
  for (let x = 0.45; x < L; x += 0.9) ribLines.push(x, 0.04, W + 0.32, x, CUT - 0.04, W + 0.32);
  for (let z = 0.45; z < W; z += 0.9) ribLines.push(L + 0.32, 0.04, z, L + 0.32, CUT - 0.04, z);
  // soft shadow along the base of the tall walls
  kit.shadow(hall, L / 2, 1.2, L * 1.05, 4.5);
  kit.shadow(hall, 1.2, W / 2, 4.5, W * 1.05);

  /* ── Northern extension: offices upstairs ── */
  wallX(EX0, EX1, EZ0, EH, -1);
  wallZ(EZ0, EZ1, EX0, EH, -1);
  wallZ(EZ0, EZ1, EX1, CUT, 1);
  for (let z = EZ0 + 0.45; z < EZ1; z += 0.9) ribLines.push(EX1 + 0.32, 0.04, z, EX1 + 0.32, CUT - 0.04, z);
  B.box(EX1 - EX0, 0.25, EZ1 - EZ0, EX0, MEZZ_Y, EZ0, "white", bEdge);

  /* ── Station pads, kerbs, floor markings ── */
  ZONES.filter((z) => z.id !== "offices").forEach((z) => {
    const [x0, z0, x1, z1] = z.rect;
    B.box(x1 - x0, 0.03, z1 - z0, x0, 0, z0, kit.track(lambert(z.tint)), null);
    // pale yellow safety line round each pad
    B.box(x1 - x0, 0.012, 0.1, x0, 0.03, z0, mat.mark, null);
    B.box(x1 - x0, 0.012, 0.1, x0, 0.03, z1 - 0.1, mat.mark, null);
    B.box(0.1, 0.012, z1 - z0, x0, 0.03, z0, mat.mark, null);
    B.box(0.1, 0.012, z1 - z0, x1 - 0.1, 0.03, z0, mat.mark, null);
    // low kerbs at the corners
    for (const [cx, cz] of [[x0, z0], [x1 - 0.5, z0], [x0, z1 - 0.5], [x1 - 0.5, z1 - 0.5]] as const) B.box(0.5, 0.15, 0.5, cx, 0, cz, mat.mark, bEdge);
  });
  for (let x = 1; x < L - 2; x += 2.6) B.box(1.3, 0.012, 0.1, x, 0.02, AISLE_Z, mat.mark, null); // aisle centre dashes

  /* ── helpers ── */
  const profileRack = (x0: number, w: number, z0: number) => {
    kit.shadow(hall, x0 + w / 2, z0 + 2.6, w * 1.2, 6.5);
    for (const x of [x0, x0 + w - 0.25]) for (const z of [z0, z0 + 5]) B.box(0.25, 4.2, 0.25, x, 0, z, "grey");
    for (const y of [0.9, 1.95, 3]) {
      for (const z of [z0 + 0.4, z0 + 2.9]) {
        B.box(w, 0.1, 0.1, x0, y - 0.12, z, "grey", null);
        for (let s = 0; s < 6; s++) B.box(w - 0.4, 0.14, 0.14, x0 + 0.2, y + (s % 2) * 0.15, z + 0.1 + Math.floor(s / 2) * 0.55, "white", kit.edgeSoft);
      }
    }
  };
  const aFrame = (x0: number, z0: number, len = 5, panes = true) => {
    kit.shadow(hall, x0 + len / 2, z0 + 1.5, len * 1.3, 4);
    B.box(len, 0.3, 3, x0, 0, z0, "light");
    B.box(len, 3.2, 0.22, x0, 0.3, z0 + 1.4, "white");
    if (!panes) return;
    for (let s = 0; s < 4; s++) {
      for (const side of [-1, 1]) {
        m4.makeRotationX(side * 0.13).setPosition(x0 + len / 2, 1.9, z0 + 1.5 + side * (0.25 + s * 0.09));
        B.geo(new THREE.BoxGeometry(len - 0.4, 3, 0.04), m4, "glass", kit.edgeSoft);
      }
    }
  };
  const frameFlat = (parent: THREE.Object3D | null, x: number, y: number, z: number, w: number, d: number, t = 0.12, line = kit.edge) => {
    const bars: THREE.Mesh[] = [];
    if (parent) {
      bars.push(kit.box(parent, w, t, t, x, y, z, "white", line));
      bars.push(kit.box(parent, w, t, t, x, y, z + d - t, "white", line));
      bars.push(kit.box(parent, t, t, d - 2 * t, x, y, z + t, "white", line));
      bars.push(kit.box(parent, t, t, d - 2 * t, x + w - t, y, z + t, "white", line));
    } else {
      B.box(w, t, t, x, y, z, "white");
      B.box(w, t, t, x, y, z + d - t, "white");
      B.box(t, t, d - 2 * t, x, y, z + t, "white");
      B.box(t, t, d - 2 * t, x + w - t, y, z + t, "white");
    }
    return bars;
  };
  const capsule = kit.track(new THREE.CapsuleGeometry(0.24, 0.95, 4, 10));
  capsule.translate(0, 0.72, 0);
  const capsuleEdges = kit.track(new THREE.EdgesGeometry(capsule, 35));
  const person = (parent: THREE.Object3D, x: number, y: number, z: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    kit.shadow(g, 0, 0, 1, 1);
    const body = new THREE.Mesh(capsule, kit.fills.white);
    body.add(new THREE.LineSegments(capsuleEdges, kit.edge));
    g.add(body);
    kit.box(g, 0.1, 0.34, 0.06, -0.05, 0.62, 0.2, "blue", null); // one blue accent (lanyard)
    return g;
  };
  /** a clickable machine group belonging to a station */
  const roots: THREE.Group[] = [];
  const machine = (station: number) => {
    const g = new THREE.Group();
    g.userData.station = station;
    hall.add(g);
    roots.push(g);
    return g;
  };
  const cyl = (r: number, len: number, seg = 20) => {
    const g = kit.track(new THREE.CylinderGeometry(r, r, len, seg));
    return { g, e: kit.track(new THREE.EdgesGeometry(g, 30)) };
  };
  const cylMesh = (parent: THREE.Object3D, c: { g: THREE.BufferGeometry; e: THREE.BufferGeometry }, m: THREE.Material, line: THREE.LineBasicMaterial = kit.edge) => {
    const mesh = new THREE.Mesh(c.g, m);
    mesh.add(new THREE.LineSegments(c.e, line));
    parent.add(mesh);
    return mesh;
  };
  const anims: ((t: number) => void)[] = ZONES.map(() => () => {});

  const bench = (x: number, z: number, w: number, d: number, h = 0.9) => {
    kit.shadow(hall, x + w / 2, z + d / 2, w * 1.3, d * 1.8);
    B.box(w, 0.1, d, x, h - 0.1, z, "white");
    for (const [lx, lz] of [[0, 0], [w - 0.12, 0], [0, d - 0.12], [w - 0.12, d - 0.12]] as const) B.box(0.12, h - 0.1, 0.12, x + lx, 0, z + lz, "grey");
  };

  /* ── 1. Goods in & storage (x 0.6–11.6) ── */
  {
    profileRack(1.2, 5, 1.8);
    profileRack(6.4, 5, 1.8);
    aFrame(1.4, 11.2, 4.4);
    aFrame(6.6, 11.2, 4.4);
    // yellow overhead vacuum lifter on a gantry
    for (const x of [0.9, 11.1]) for (const z of [9.2, 16.4]) mbox(hall, 0.3, 5.8, 0.3, x, 0, z, mat.yellow, bEdge);
    for (const z of [9.2, 16.4]) mbox(hall, 10.5, 0.4, 0.3, 0.9, 5.8, z, mat.yellow, bEdge);
    const g = machine(0);
    const bridgeG = new THREE.Group();
    g.add(bridgeG);
    mbox(bridgeG, 0.5, 0.45, 7.5, -0.25, 5.4, 9.1, mat.yellow);
    const hoist = new THREE.Group();
    bridgeG.add(hoist);
    kit.box(hoist, 0.04, 1, 0.04, -0.02, 0, -0.02, "dark", null);
    mbox(hoist, 1.8, 0.14, 1.2, -0.9, -0.14, -0.6, mat.yellow); // vacuum frame
    kit.box(hoist, 3, 2.1, 0.04, -1.5, -2.3, -0.02, "blueGlass", kit.edgeSoft); // sheet on the pads
    const cable = hoist.children[0];
    anims[0] = (t) => {
      bridgeG.position.x = 3 + 5 * ping(t, 7);
      const lift = ping(t + 1.2, 3.5);
      hoist.position.set(0, 3.2 + 1.4 * lift, 12.8);
      const len = 5.4 - hoist.position.y;
      cable.scale.y = len;
      cable.position.y = len / 2;
    };
    person(hall, 9.3, 0, 17.8);
    // delivery truck at the western doors, with profiles on the bed
    const rig = new THREE.Group();
    rig.position.set(IN_DOCK, 0, W + 0.6);
    rig.rotation.y = -Math.PI / 2;
    hall.add(rig);
    rig.add(makeTruck(kit));
    for (let k = 0; k < 3; k++) kit.box(rig, 4.2, 0.35, 1.8, 0.1, 1.15 + k * 0.36, -0.9, "white", kit.edgeSoft);
  }

  /* ── 2. PVC production (x 12.2–27.2): foil → double-head saw → 4-head welder (green) → corner cleaning ── */
  {
    profileRack(13, 6, 1.8);
    const g = machine(1);
    // foiling machine: bed + roll of film applied along a profile
    kit.shadow(hall, 15, 10.2, 6, 3);
    B.box(4.6, 1, 1.4, 12.8, 0, 9.5, "light");
    B.box(1.2, 1.6, 1.6, 15.6, 1, 9.4, "white");
    const roll = cyl(0.42, 1.2);
    const rollG = new THREE.Group();
    rollG.position.set(14.2, 1.55, 10.2);
    rollG.rotation.x = Math.PI / 2;
    g.add(rollG);
    const rollMesh = cylMesh(rollG, roll, kit.fills.blue);
    kit.box(g, 3, 0.02, 0.5, 12.9, 1.02, 9.95, "blue", null); // film on the profile
    // double-head saw
    kit.shadow(hall, 20, 10.1, 6, 3);
    B.box(5, 0.95, 1.4, 17.8, 0, 9.4, "light");
    B.box(4.6, 0.14, 0.14, 18, 0.95, 10.1, "white");
    const blade = cyl(0.55, 0.06, 28);
    const saws: THREE.Group[] = [];
    for (const x of [18.4, 22.2]) {
      const head = new THREE.Group();
      head.position.set(x, 0, 10.1);
      g.add(head);
      kit.box(head, 0.9, 1.1, 1.3, -0.45, 1.5, -0.65, "white");
      const b = new THREE.Group();
      b.position.set(0, 1.4, 0.72);
      b.rotation.x = Math.PI / 2;
      head.add(b);
      cylMesh(b, blade, kit.fills.white, kit.edgeBlue);
      saws.push(head);
    }
    // the big green 4-head welder
    kit.shadow(hall, 25, 10.6, 7, 6);
    mbox(hall, 4.6, 1.05, 3.6, 22.8, 0, 8.8, mat.green, bEdge);
    frameFlat(null, 23.2, 1.05, 9.3, 3.8, 2.6);
    const welds: THREE.Group[] = [];
    for (const [hx, hz] of [[23, 9], [26.4, 9], [23, 11.6], [26.4, 11.6]] as const) {
      const w = new THREE.Group();
      w.position.set(hx, 0, hz);
      g.add(w);
      mbox(w, 0.7, 1, 0.7, -0.05, 2, -0.05, mat.green);
      mbox(w, 0.3, 0.6, 0.3, 0.15, 1.4, 0.15, mat.green, null);
      B.box(0.16, 2.2, 0.16, hx + 0.22, 1.05, hz - 0.35, "grey");
      welds.push(w);
    }
    // corner cleaning
    kit.shadow(hall, 25, 15.4, 5, 3);
    B.box(3.4, 1.3, 2, 23.3, 0, 14.4, "white");
    frameFlat(null, 23.6, 1.3, 14.6, 2.8, 1.6);
    const brush = new THREE.Group();
    brush.position.set(26.1, 1.9, 15.3);
    g.add(brush);
    kit.box(brush, 0.5, 0.5, 0.5, -0.25, -0.25, -0.25, "blue");
    person(hall, 21.8, 0, 16.8);
    anims[1] = (t) => {
      rollMesh.rotation.y = t * 3;
      saws.forEach((s, i) => (s.position.y = -0.35 * ping(t + i * 0.3, 2.2)));
      welds.forEach((w, i) => (w.position.y = -0.5 * ping(t + i * 0.06, 2.6)));
      brush.rotation.y = t * 5;
    };
  }

  /* ── 3. Aluminum production (x 27.8–39.2): saw → CNC → crimping ── */
  {
    profileRack(28.4, 6, 1.8);
    const g = machine(2);
    kit.shadow(hall, 30.6, 10.1, 6, 3);
    B.box(4.8, 0.95, 1.4, 28.4, 0, 9.4, "light");
    B.box(4.4, 0.14, 0.14, 28.6, 0.95, 10.1, "white");
    const sawHead = new THREE.Group();
    sawHead.position.set(30.8, 0, 10.1);
    g.add(sawHead);
    kit.box(sawHead, 1, 1.2, 1.4, -0.5, 1.4, -0.7, "white");
    const sb = new THREE.Group();
    sb.position.set(0, 1.35, 0.76);
    sb.rotation.x = Math.PI / 2;
    sawHead.add(sb);
    cylMesh(sb, cyl(0.6, 0.06, 28), kit.fills.white, kit.edgeBlue);
    // CNC machining centre
    kit.shadow(hall, 32.4, 14.4, 10, 4.5);
    B.box(8, 1, 2.8, 28.4, 0, 13, "light");
    B.box(7.6, 0.14, 0.14, 28.6, 1, 14.3, "white");
    const gantry = new THREE.Group();
    g.add(gantry);
    kit.box(gantry, 0.35, 2, 0.35, 0, 1, -1.55, "white");
    kit.box(gantry, 0.35, 2, 0.35, 0, 1, 1.2, "white");
    kit.box(gantry, 0.55, 0.45, 3.1, -0.1, 3, -1.55, "white");
    const spindle = new THREE.Group();
    gantry.add(spindle);
    kit.box(spindle, 0.45, 0.9, 0.45, -0.05, 2.1, -0.22, "blue");
    gantry.position.set(29.4, 0, 14.4);
    // crimping press
    kit.shadow(hall, 36.3, 10, 4, 4);
    B.box(2.6, 1, 2.2, 35, 0, 8.8, "light");
    B.box(1.1, 2.4, 1.1, 36.8, 1, 8.9, "white");
    frameFlat(null, 35.2, 1, 9.3, 1.5, 1.4);
    const ram = new THREE.Group();
    ram.position.set(37.35, 0, 9.45);
    g.add(ram);
    kit.box(ram, 0.5, 0.6, 0.5, -0.25, 2.8, -0.25, "blue");
    person(hall, 34, 0, 12.2);
    anims[2] = (t) => {
      sawHead.position.y = -0.35 * ping(t, 2.2);
      sb.rotation.y = t * 8;
      gantry.position.x = 29.4 + 5.6 * ping(t, 6);
      spindle.position.z = 0.7 * Math.sin(t * 2.2);
      ram.position.y = -0.6 * ping(t, 1.6);
    };
  }

  /* ── 4. Coating (x 39.8–50.8): booth + oven, profiles ride overhead hooks ── */
  const COATS = [BLUE, 0x3b3f44, 0x8a6a48, 0xf4f4f2];
  const coatMats = COATS.map((c) => kit.track(lambert(c)));
  {
    const booth = new THREE.Group();
    hall.add(booth);
    kit.shadow(hall, 45.5, 4.8, 12, 7);
    B.box(6, 4.2, 0.2, 40.4, 0, 2, "white");
    B.box(0.2, 4.2, 5, 40.4, 0, 2, "white");
    B.box(0.2, 4.2, 5, 46.2, 0, 2, "white");
    B.box(6, 0.25, 5, 40.4, 4.2, 2, "light");
    wallWithOpenings(kit, booth, 6, 4.2, 0.2, 40.4, 0, 6.8, [{ x: 1.2, w: 3.6, y: 0, h: 3.4 }]);
    B.box(4.8, 0.3, 0.05, 40.9, 3.6, 7.02, "blue", null); // booth sign band
    B.box(3.6, 4.2, 5, 46.8, 0, 2, "light"); // oven
    B.box(2.6, 3.4, 0.05, 47.3, 0.2, 7, "white");
    B.box(10.6, 0.18, 0.18, 40.2, 5.2, 9, "grey"); // overhead conveyor
    for (const x of [40.3, 45.5, 50.4]) B.box(0.18, 5.2, 0.18, x, 0, 9, "grey");
  }
  const HOOKS = 7;
  const hooks: { g: THREE.Group; prof: THREE.Mesh; i: number }[] = [];
  {
    const g = machine(3);
    for (let i = 0; i < HOOKS; i++) {
      const hg = new THREE.Group();
      g.add(hg);
      kit.box(hg, 0.05, 1, 0.05, -0.025, 4.2, -0.025, "dark", null);
      hooks.push({ g: hg, prof: kit.box(hg, 0.16, 2.6, 0.16, -0.08, 1.6, -0.08, "grey"), i });
    }
    person(hall, 44, 0, 16.6);
    anims[3] = (t) => {
      hooks.forEach((h) => {
        const x = 40.5 + ((t * 1.1 + (h.i * 10) / HOOKS) % 9.8);
        h.g.position.set(x, 0, 9.09);
        h.prof.material = x > 46.2 ? coatMats[h.i % coatMats.length] : kit.fills.grey; // any RAL colour
      });
    };
  }

  /* ── 5. Glass units (x 51.4–62.6): cutting table → LISEC line (two panes → press) ── */
  {
    const g = machine(4);
    aFrame(57.8, 2.2, 4.4);
    kit.shadow(hall, 54.8, 4.4, 8, 6);
    B.box(6, 0.9, 4.6, 51.8, 0, 2, "light"); // cutting table
    const sheet = new THREE.Group();
    g.add(sheet);
    kit.box(sheet, 4.6, 0.04, 3.4, 0, 0.92, 0, "blueGlass", kit.edgeSoft);
    sheet.position.set(52.4, 0, 2.6);
    const bridge = new THREE.Group();
    g.add(bridge);
    kit.box(bridge, 0.3, 1.4, 0.3, 0, 0.9, -0.2, "white");
    kit.box(bridge, 0.3, 1.4, 0.3, 0, 0.9, 4.7, "white");
    kit.box(bridge, 0.4, 0.35, 5.2, -0.05, 2.3, -0.25, "white");
    const cutter = new THREE.Group();
    bridge.add(cutter);
    kit.box(cutter, 0.45, 0.55, 0.45, -0.08, 1.75, -0.2, "blue");
    bridge.position.set(52.2, 0, 2);
    // LISEC line
    kit.shadow(hall, 57, 13, 13, 4);
    B.box(10.6, 0.8, 2, 51.6, 0, 12, "light");
    for (let x = 52; x < 62; x += 0.8) {
      m4.makeRotationX(Math.PI / 2).setPosition(x, 0.86, 13);
      B.geo(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 10), m4, "white", kit.edgeSoft);
    }
    B.box(1.8, 3.4, 2.8, 56.2, 0, 11.6, "white"); // press
    B.box(1.8, 0.25, 2.8, 56.2, 3.4, 11.6, "blue", null);
    const pairs: { a: THREE.Group; b: THREE.Group; i: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const a = new THREE.Group();
      const b = new THREE.Group();
      g.add(a, b);
      kit.box(a, 1.8, 1.6, 0.06, -0.9, 0.9, -0.03, "blueGlass", kit.edgeSoft);
      kit.box(b, 1.8, 1.6, 0.06, -0.9, 0.9, -0.03, "blueGlass", kit.edgeSoft);
      pairs.push({ a, b, i });
    }
    person(hall, 55, 0, 9.4);
    anims[4] = (t) => {
      bridge.position.x = 52.2 + 5 * ping(t, 5);
      cutter.position.z = 4 * ping(t + 0.7, 2.5);
      sheet.position.x = 52.4 + 0.4 * ping(t, 10);
      pairs.forEach((p) => {
        const u = ((t * 0.12 + p.i / 3) % 1 + 1) % 1; // 0 → 1 along the line
        const x = 52.2 + 9.4 * u;
        const gap = 0.5 * (1 - clamp01((x - 55) / 1.5)); // panes meet at the press
        p.a.position.set(x, 0, 13 - gap);
        p.b.position.set(x, 0, 13 + gap);
      });
    };
  }

  /* ── 6. Glazing & assembly (x 63.2–69.8): frames on trestles, a glass unit set in ── */
  {
    const g = machine(5);
    for (const z of [3.4, 9.6]) {
      kit.shadow(hall, 66.4, z + 1.3, 6.5, 3.6);
      for (const x of [63.9, 68.3]) {
        B.box(0.12, 0.9, 2.4, x, 0, z, "grey");
        B.box(0.9, 0.1, 2.4, x - 0.4, 0.9, z, "grey");
      }
      frameFlat(null, 64, 1, z + 0.2, 4.8, 2);
    }
    B.box(4.1, 0.03, 1.3, 64.35, 1.12, 3.95, "blueGlass", kit.edgeSoft);
    // small jib with a vacuum cup lowering the glass unit into the frame
    B.box(0.3, 4.4, 0.3, 66.3, 0, 7.4, "grey");
    const jib = new THREE.Group();
    jib.position.set(66.45, 4.2, 7.55);
    g.add(jib);
    mbox(jib, 0.3, 0.3, 3.4, -0.15, 0, 0, mat.yellow);
    const pane = new THREE.Group();
    pane.position.set(0, 0, 3.05);
    jib.add(pane);
    kit.box(pane, 0.04, 1, 0.04, -0.02, -1, -0.02, "dark", null);
    mbox(pane, 0.9, 0.12, 0.7, -0.45, -1.12, -0.35, mat.yellow);
    kit.box(pane, 4.2, 0.08, 1.8, -2.1, -1.2, -0.9, "blueGlass", kit.edgeSoft);
    // check light
    B.box(0.12, 2.6, 0.12, 69.2, 0, 15.2, "grey");
    const lamp = kit.box(g, 0.6, 0.25, 0.6, 68.96, 2.6, 14.96, "blue", null);
    person(hall, 66.4, 0, 14.6);
    anims[5] = (t) => {
      pane.position.y = -2.1 * ping(t, 4);
      lamp.scale.setScalar(1 + 0.15 * Math.sin(t * 4));
    };
  }

  /* ── 7. Packing & shipping (x 70.4–83.2): wrap → A-frame racks → forklift → truck ── */
  let shipRig: THREE.Group;
  const fork = new THREE.Group();
  let carried: THREE.Mesh;
  {
    const g = machine(6);
    // wrap station: turntable with a standing window, film wrapping round it
    kit.shadow(hall, 73.8, 4.6, 5, 5);
    const table = cyl(1.4, 0.3, 32);
    const tableG = new THREE.Group();
    tableG.position.set(73.8, 0.15, 4.6);
    g.add(tableG);
    cylMesh(tableG, table, kit.fills.light);
    const standing = new THREE.Group();
    tableG.add(standing);
    kit.box(standing, 1.8, 1.6, 0.12, -0.9, 0.15, -0.06, "white");
    kit.box(standing, 1.5, 1.3, 0.03, -0.75, 0.3, -0.015, "blueGlass", kit.edgeSoft);
    const film = kit.box(standing, 1.95, 0.6, 0.24, -0.975, 0.2, -0.12, "glass", kit.edgeSoft);
    B.box(0.2, 2.8, 0.2, 76, 0, 4.5, "grey"); // wrapper mast
    // A-frame racks loaded with windows
    for (const z of [8.6, 13.4]) {
      aFrame(76.2, z, 6, false);
      for (let s = 0; s < 3; s++) {
        for (const side of [-1, 1]) {
          m4.makeRotationX(side * 0.13).setPosition(79.2, 1.3, z + 1.5 + side * (0.3 + s * 0.14));
          B.geo(new THREE.BoxGeometry(5.4, 1.9, 0.12), m4, "white", kit.edge);
        }
      }
    }
    // forklift shuttling racks out of shutter 12
    fork.rotation.y = -Math.PI / 2; // drives toward the south wall
    g.add(fork);
    kit.shadow(fork, 0.9, 0, 3.4, 2.2);
    kit.box(fork, 1.6, 1, 1.3, 0, 0.3, -0.65, "white");
    kit.box(fork, 0.55, 0.55, 1.1, -0.1, 1.3, -0.55, "grey");
    for (const [px, pz] of [[0.1, -0.6], [0.1, 0.5], [1.3, -0.6], [1.3, 0.5]] as const) kit.box(fork, 0.09, 1.5, 0.09, px, 1.3, pz, "grey");
    kit.box(fork, 1.35, 0.09, 1.2, 0.07, 2.8, -0.6, "white");
    for (const x of [0.1, 1.05]) for (const z of [0.5, -0.8]) kit.box(fork, 0.55, 0.55, 0.3, x, 0, z, "dark");
    kit.box(fork, 0.12, 2.8, 0.12, 1.65, 0.2, -0.5, "dark");
    kit.box(fork, 0.12, 2.8, 0.12, 1.65, 0.2, 0.38, "dark");
    carried = kit.box(fork, 1.4, 1.5, 1.2, 1.8, 0.4, -0.6, "white");
    kit.box(carried, 1.2, 1.3, 0.03, -0.6, -0.65, 0.61, "blueGlass", null);
    // the VALDA truck at the eastern doors
    shipRig = new THREE.Group();
    shipRig.position.set(OUT_DOCK + 0.9, 0, W + 0.6);
    shipRig.rotation.y = -Math.PI / 2;
    hall.add(shipRig);
    shipRig.add(makeTruck(kit));
    const box = makeContainer(kit);
    box.group.position.set(2.2, 2.1, 0);
    box.setDoors(1);
    shipRig.add(box.group);
    person(hall, 80.5, 0, 17.2);
    anims[6] = (t) => {
      tableG.rotation.y = t * 1.6;
      film.scale.y = 0.4 + 2.2 * ping(t, 5);
      film.position.y = 0.2 + 0.3 * film.scale.y;
      const loop = (t / 9) % 1;
      const go = ease(clamp01(loop / 0.4));
      const back = ease(clamp01((loop - 0.5) / 0.4));
      fork.position.set(OUT_DOCK + 0.9, 0, 13.5 + 6.6 * (go - back));
      carried.visible = loop < 0.46;
    };
  }

  /* ── More machines named in the station steps ── */
  const more: ((t: number) => void)[][] = ZONES.map(() => []);
  {
    // PVC: steel reinforcement bench, CNC router, seals & hardware bench
    const g1 = machine(1);
    bench(13, 12.6, 4, 1.6);
    for (let k = 0; k < 4; k++) B.box(3.6, 0.1, 0.1, 13.2, 0.92, 12.8 + k * 0.32, "grey", kit.edgeSoft);
    kit.shadow(hall, 19.9, 13.5, 4.4, 2.6);
    B.box(3.4, 1, 1.8, 18.2, 0, 12.6, "light");
    B.box(3.2, 0.12, 0.12, 18.3, 1, 13.45, "white");
    const router = new THREE.Group();
    router.position.set(18.7, 0, 13.5);
    g1.add(router);
    kit.box(router, 0.3, 0.9, 1.9, -0.15, 1.2, -0.95, "white");
    kit.box(router, 0.3, 0.5, 0.3, -0.15, 1.05, -0.15, "blue");
    more[1].push((t) => (router.position.x = 18.7 + 2.4 * ping(t, 3)));
    bench(13, 16.6, 6, 1.6);
    frameFlat(null, 13.3, 0.95, 16.8, 3.2, 1.2);
    for (let k = 0; k < 3; k++) B.box(0.45, 0.3, 0.45, 17 + k * 0.6, 0.95, 16.9, "dark", null);
    // aluminum: seals & hardware bench
    bench(35.4, 16.2, 3.4, 1.6);
    frameFlat(null, 35.6, 0.95, 16.4, 2.4, 1.2);
    // coating: pretreatment tanks + anodizing tanks with a dipping bundle
    const g3 = machine(3);
    for (let i = 0; i < 3; i++) {
      B.box(1.8, 1.2, 2, 40.4 + i * 2, 0, 12.2, "white");
      B.box(1.6, 0.03, 1.8, 40.5 + i * 2, 1.05, 12.3, "blueGlass", null);
    }
    kit.shadow(hall, 43.3, 13.2, 7, 3);
    for (let i = 0; i < 2; i++) {
      B.box(1.8, 1.2, 2.6, 46.6 + i * 2, 0, 12, "white");
      B.box(1.6, 0.03, 2.4, 46.7 + i * 2, 1.05, 12.1, "blueGlass", null);
    }
    B.box(4, 0.15, 0.15, 46.5, 2.5, 13.2, "grey");
    for (const x of [46.5, 50.35]) B.box(0.15, 2.5, 0.15, x, 0, 13.2, "grey");
    const dip = new THREE.Group();
    dip.position.set(47.5, 0, 13.3);
    g3.add(dip);
    kit.box(dip, 0.04, 0.9, 0.04, -0.02, 1.6, -0.02, "dark", null);
    kit.box(dip, 1.4, 0.2, 0.4, -0.7, 1.4, -0.2, "grey");
    more[3].push((t) => {
      dip.position.x = 47.5 + 2 * ping(t, 8);
      dip.position.y = -0.7 * ping(t + 1, 2);
    });
    // glass: washer on the LISEC line, spacer + butyl machine, secondary sealing robot
    const g4 = machine(4);
    kit.box(g4, 1.8, 2.2, 2.6, 52.2, 0, 11.7, "white");
    kit.box(g4, 1.8, 0.2, 0.04, 52.2, 1.7, 14.31, "blue", null);
    bench(52.2, 15.6, 3, 1.6, 1);
    frameFlat(null, 52.5, 1, 15.8, 2.2, 1.2, 0.08);
    const nozzle = new THREE.Group();
    nozzle.position.set(52.6, 1.3, 16.4);
    g4.add(nozzle);
    kit.box(nozzle, 0.25, 0.35, 0.25, -0.12, 0, -0.12, "blue");
    B.box(0.5, 1.4, 0.5, 59.6, 0, 14.8, "grey");
    const arm = new THREE.Group();
    arm.position.set(59.85, 1.4, 15.05);
    g4.add(arm);
    kit.box(arm, 0.3, 0.3, 1.6, -0.15, 0, -1.6, "white");
    kit.box(arm, 0.2, 0.5, 0.2, -0.1, -0.5, -1.6, "blue");
    more[4].push((t) => {
      nozzle.position.x = 52.6 + 1.9 * ping(t, 2.4);
      arm.rotation.y = 0.6 * Math.sin(t * 1.3);
    });
    // packing: corner protectors on the standing window
    for (const [x, y] of [[-0.9, 0.15], [0.7, 0.15], [-0.9, 1.55], [0.7, 1.55]] as const) B.box(0.2, 0.2, 0.2, 73.8 + x, 0.3 + y, 4.5, "blue", null);
  }

  /* ── Machines the station steps point at (hall-local boxes) + highlight + pick boxes ── */
  const RB = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));
  const MACHINES: Record<string, THREE.Box3> = {
    "goods-truck": RB(6.2, 0, W + 0.4, 10.8, 3.4, W + 7.4),
    "goods-glass": RB(0.9, 0, 9.2, 11.4, 6.2, 16.7),
    "goods-racks": RB(1.2, 0, 1.8, 11.4, 4.2, 6.8),
    "pvc-foil": RB(12.8, 0, 9.4, 17.4, 2.6, 11),
    "pvc-saw": RB(17.8, 0, 9.4, 22.8, 2.6, 11),
    "pvc-steel": RB(13, 0, 12.6, 17, 1.2, 14.2),
    "pvc-router": RB(18.2, 0, 12.6, 21.6, 2.2, 14.4),
    "pvc-weld": RB(22.8, 0, 8.8, 27.4, 3.1, 12.4),
    "pvc-clean": RB(23.3, 0, 14.4, 26.7, 2.4, 16.4),
    "pvc-hardware": RB(13, 0, 16.6, 19, 1.4, 18.2),
    "alu-racks": RB(28.4, 0, 1.8, 34.4, 4.2, 6.8),
    "alu-saw": RB(28.4, 0, 9.4, 33.2, 2.6, 10.8),
    "alu-cnc": RB(28.4, 0, 13, 36.4, 3.5, 15.8),
    "alu-crimp": RB(35, 0, 8.8, 37.6, 3.4, 11),
    "alu-hardware": RB(35.4, 0, 16.2, 38.8, 1.3, 17.8),
    "coat-pre": RB(40.4, 0, 12.2, 46.2, 1.4, 14.2),
    "coat-booth": RB(40.4, 0, 2, 46.4, 4.4, 7),
    "coat-oven": RB(46.8, 0, 2, 50.4, 4.2, 7),
    "coat-anod": RB(46.5, 0, 12, 50.5, 2.7, 14.6),
    "glass-cut": RB(51.8, 0, 2, 57.8, 2.6, 6.6),
    "glass-wash": RB(52.2, 0, 11.7, 54, 2.2, 14.3),
    "glass-spacer": RB(52.2, 0, 15.6, 55.2, 1.6, 17.2),
    "glass-press": RB(56.2, 0, 11.6, 58, 3.7, 14.4),
    "glass-seal": RB(58.6, 0, 12, 61, 2.4, 15.3),
    "glass-rack": RB(57.8, 0, 2.2, 62.2, 3.5, 5.2),
    "glaze-bench": RB(63.6, 0, 3.2, 69.2, 4.6, 12.2),
    "glaze-check": RB(65.4, 0, 13.8, 69.6, 2.9, 16),
    "pack-wrap": RB(72.2, 0, 3, 76.3, 2.8, 6.2),
    "pack-racks": RB(76.2, 0, 8.6, 82.2, 3.5, 16.4),
    "pack-load": RB(69.8, 0, 12.8, 72.6, 3.2, W + 7.4),
  };
  {
    const span = (EX1 - EX0 - 2) / 5;
    for (let i = 0; i < 5; i++) {
      const cx = EX0 + 1 + span * (i + 0.5);
      MACHINES[`role-${i}`] = RB(cx - 1.6, MEZZ_Y, -7.6, cx + 1.6, MEZZ_Y + 2.3, -4.4);
    }
  }
  // highlight: blue outline + faint fill around the chosen machine, and an anchor for its label
  const hlGeo = kit.track(new THREE.BoxGeometry(1, 1, 1));
  const hlFill = kit.track(new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.1, depthWrite: false }));
  const hlLine = kit.track(new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.9 }));
  const hl = new THREE.Mesh(hlGeo, hlFill);
  hl.add(new THREE.LineSegments(kit.track(new THREE.EdgesGeometry(hlGeo)), hlLine));
  hl.visible = false;
  hall.add(hl);
  const hlAnchor = new THREE.Object3D();
  hall.add(hlAnchor);
  // invisible pick boxes: clicking a machine opens its step
  const pickMat = kit.track(new THREE.MeshBasicMaterial({ visible: false }));
  const pickables: THREE.Mesh[] = [];
  ZONES.forEach((z, station) =>
    z.steps.forEach((st, step) => {
      const b = st.machine ? MACHINES[st.machine] : undefined;
      if (!b) return;
      const m = new THREE.Mesh(hlGeo, pickMat);
      b.getCenter(m.position);
      b.getSize(m.scale);
      m.userData = { station, step };
      hall.add(m);
      pickables.push(m);
    }),
  );

  /* ── Process read-out: the product at every stage, floor markers + arrows, step anchors ── */
  const P = {
    silver: kit.track(lambert(0xc9ccd1)),
    wood: kit.track(lambert(0x8a6a48)),
    anthracite: kit.track(lambert(0x3b3f44)),
    bronze: kit.track(lambert(0x7c5a3a)),
    champagne: kit.track(lambert(0xcdbd98)),
    ral: kit.track(lambert(0xf4f4f2)),
    tag: kit.track(lambert(0x5aa36a)),
    vest: kit.track(lambert(0xe6c84a)),
    powder: kit.track(lambert(0xb9c4d4, { transparent: true, opacity: 0.35, depthWrite: false })),
  };
  const WHITE = kit.fills.white;
  const DARK = kit.fills.dark;
  /** PVC profile: white body, multi-chamber end face (+x end) */
  const pvcProfile = (x0: number, y: number, zc: number, len: number, m: THREE.Material = WHITE) => {
    B.box(len, 0.28, 0.34, x0, y, zc - 0.17, m);
    for (const dz of [-0.09, 0, 0.09]) B.box(0.012, 0.24, 0.02, x0 + len, y + 0.02, zc + dz - 0.01, DARK, null);
    B.box(0.012, 0.02, 0.3, x0 + len, y + 0.13, zc - 0.15, DARK, null);
  };
  /** thermally broken aluminum profile: two silver halves with a dark insulating strip */
  const aluProfile = (x0: number, y: number, zc: number, len: number, m: THREE.Material = P.silver) => {
    B.box(len, 0.3, 0.13, x0, y, zc - 0.175, m);
    B.box(len, 0.22, 0.09, x0, y + 0.04, zc - 0.045, DARK, null);
    B.box(len, 0.3, 0.13, x0, y, zc + 0.045, m);
  };
  const rectFrame = (x: number, y: number, z: number, w: number, d: number, t: number, m: THREE.Material) => {
    B.box(w, t, t, x, y, z, m);
    B.box(w, t, t, x, y, z + d - t, m);
    B.box(t, t, d - 2 * t, x, y, z + t, m);
    B.box(t, t, d - 2 * t, x + w - t, y, z + t, m);
  };
  /** standing window (in the x–y plane) with glass; optional colour */
  const standingWindow = (x: number, y: number, z: number, w: number, h: number, m: THREE.Material = WHITE) => {
    B.box(w, 0.12, 0.14, x, y, z, m);
    B.box(w, 0.12, 0.14, x, y + h - 0.12, z, m);
    B.box(0.12, h - 0.24, 0.14, x, y + 0.12, z, m);
    B.box(0.12, h - 0.24, 0.14, x + w - 0.12, y + 0.12, z, m);
    B.box(w - 0.24, h - 0.24, 0.03, x + 0.12, y + 0.12, z + 0.055, "blueGlass", kit.edgeSoft);
    B.box(w - 0.3, 0.02, 0.04, x + 0.15, y + h - 0.3, z + 0.07, "white", null); // glass highlight line
  };
  const panel = (x: number, z: number) => {
    // machine control panel: post + angled screen
    B.box(0.12, 1.2, 0.12, x, 0, z, "grey");
    B.box(0.6, 0.45, 0.12, x - 0.24, 1.2, z - 0.02, "white");
    B.box(0.46, 0.3, 0.02, x - 0.17, 1.27, z + 0.1, "blue", null);
  };
  const worker = (x: number, z: number, y = 0) => {
    const g = person(hall, x, y, z);
    mbox(g, 0.52, 0.5, 0.52, -0.26, 0.55, -0.26, P.vest, kit.edgeSoft); // hi-vis vest
    return g;
  };

  // Goods in: silver aluminum bundles on the second rack, a glass stillage by the truck
  for (const y of [1.95, 3]) B.box(4.6, 0.28, 0.55, 6.6, y, 4.7, P.silver);
  B.box(4, 0.25, 2.2, 11.2, 0, W + 1.4, "light");
  for (let s = 0; s < 3; s++) {
    m4.makeRotationX(-0.12).setPosition(13.2, 1.55, W + 2.3 + s * 0.12);
    B.geo(new THREE.BoxGeometry(3.6, 2.6, 0.04), m4, "blueGlass", kit.edgeSoft);
  }
  worker(10.4, 18.6);

  // PVC: plain → foiled profile, 45° cut pieces, steel inserted, routed slots, hardware on the frame
  pvcProfile(12.9, 1.02, 10.2, 1.6);
  pvcProfile(15.7, 1.02, 10.2, 1.6, P.wood);
  for (const [a, dz] of [[0.785, -0.2], [-0.785, 0.2]] as const) {
    m4.makeRotationY(a).setPosition(21.3, 1.12, 10.1 + dz);
    B.geo(new THREE.BoxGeometry(1.1, 0.26, 0.3), m4, "white");
  }
  pvcProfile(13.2, 0.92, 13.7, 2.8);
  B.box(1.1, 0.12, 0.12, 16, 1.0, 13.64, "grey"); // steel sliding in
  pvcProfile(18.4, 1.02, 13.5, 3);
  for (let k = 0; k < 3; k++) B.box(0.3, 0.03, 0.1, 18.9 + k * 0.9, 1.305, 13.45, DARK, null); // routed slots
  B.box(0.2, 0.14, 0.14, 13.4, 1.07, 17.2, DARK, null); // hinges
  B.box(0.2, 0.14, 0.14, 15.9, 1.07, 17.2, DARK, null);
  B.box(0.12, 0.12, 0.45, 16.3, 1.07, 17.1, "blue", null); // handle
  panel(17.5, 11.4);
  panel(21.9, 12.6);
  for (const x of [22.7, 25, 27.3]) B.box(0.08, 1.6, 0.08, x, 0, 8.5, "grey"); // welder safety fence
  B.box(4.7, 1.2, 0.03, 22.7, 0.3, 8.52, "glass", kit.edgeSoft);
  worker(20.3, 11.9);
  worker(25, 13.4);

  // Aluminum: thermal-break sample, cut pieces, drilled profile, crimped frame, frame with gaskets
  B.box(0.12, 0.9, 0.12, 30.3, 0, 7.4, "grey");
  B.box(0.12, 0.9, 0.12, 32.1, 0, 7.4, "grey");
  aluProfile(30, 0.9, 7.47, 2.4);
  for (const [a, dz] of [[0.785, -0.22], [-0.785, 0.22]] as const) {
    m4.makeRotationY(a).setPosition(32.3, 1.12, 10.1 + dz);
    B.geo(new THREE.BoxGeometry(1, 0.28, 0.3), m4, P.silver);
  }
  aluProfile(29.2, 1.02, 14.1, 4);
  for (let k = 0; k < 4; k++) B.box(0.1, 0.03, 0.1, 29.6 + k * 1, 1.325, 13.95, DARK, null); // drilled
  rectFrame(35.25, 1.02, 9.3, 1.6, 1.4, 0.14, P.silver);
  rectFrame(35.6, 0.95, 16.4, 2.4, 1.2, 0.14, P.silver);
  B.box(2.2, 0.03, 0.04, 35.7, 1.1, 16.52, DARK, null); // gasket
  B.box(0.12, 0.12, 0.4, 37.6, 1.09, 16.8, "blue", null);
  panel(33.8, 11.2);
  panel(34.4, 16.5);
  for (const x of [28.2, 32.4, 36.6]) B.box(0.08, 1.6, 0.08, x, 0, 12.6, "grey"); // CNC fence
  B.box(8.4, 1.2, 0.03, 28.2, 0.3, 12.62, "glass", kit.edgeSoft);
  worker(31, 11.8);

  // Coating: raw profiles over the pretreatment tanks, powder cloud in the booth, RAL colours out of the oven, anodized profiles
  B.box(6.2, 0.12, 0.12, 40.3, 3, 13.2, "grey");
  for (const x of [40.3, 46.4]) B.box(0.12, 3, 0.12, x, 0, 13.2, "grey");
  for (let k = 0; k < 4; k++) B.box(0.16, 1.6, 0.16, 41 + k * 1.4, 1.4, 13.18, P.silver);
  for (let k = 0; k < 14; k++) {
    const r = 0.18 + ((k * 37) % 7) * 0.04;
    m4.makeTranslation(41.2 + ((k * 53) % 40) / 10, 1 + ((k * 29) % 25) / 10, 3 + ((k * 17) % 30) / 10);
    B.geo(new THREE.SphereGeometry(r, 8, 6), m4, P.powder, null); // powder cloud
  }
  B.box(6.4, 0.9, 3.2, 40.2, 4.4, 2.9, "white"); // extraction hood
  B.box(0.9, 1.6, 0.9, 42.6, 5.3, 3.8, "light"); // duct
  for (const x of [48.1, 49.1]) B.box(0.05, 3.2, 0.06, x, 0.2, 7.02, DARK, null); // oven door seams
  B.box(3.6, 0.12, 0.8, 46.8, 2.6, 7.6, "grey"); // colour rack at the oven exit
  for (const x of [46.8, 50.3]) B.box(0.1, 2.6, 0.1, x, 0, 7.95, "grey");
  [P.anthracite, P.ral, P.bronze, kit.fills.blue].forEach((m, k) => B.box(0.18, 2.1, 0.18, 47.3 + k * 0.8, 0.4, 7.95, m));
  B.box(4, 0.1, 0.8, 46.5, 0.8, 15.6, "grey"); // anodized bundle on a trestle
  for (const x of [46.6, 50.3]) B.box(0.1, 0.8, 0.8, x, 0, 15.6, "grey");
  for (let k = 0; k < 3; k++) B.box(3.8, 0.16, 0.16, 46.6, 0.9 + (k % 2) * 0.17, 15.7 + k * 0.2, P.champagne);
  worker(45.6, 8.6);

  // Glass units: score lines, cut panes, butyl spacer, sealed unit, double + triple units
  for (const z of [3.4, 4.6]) B.box(4.6, 0.012, 0.03, 52.4, 0.965, z, DARK, null);
  for (const x of [54, 55.4]) B.box(0.03, 0.012, 3.4, x, 0.965, 2.6, DARK, null);
  for (let s = 0; s < 3; s++) {
    m4.makeRotationX(-0.14).setPosition(56.9, 0.9, 8 + s * 0.12);
    B.geo(new THREE.BoxGeometry(1.4, 1.1, 0.04), m4, "blueGlass", kit.edgeSoft);
  }
  B.box(1.6, 0.35, 0.8, 56.1, 0, 7.6, "light");
  rectFrame(52.5, 1.02, 15.8, 2.2, 1.2, 0.1, DARK); // butyl-coated spacer
  B.box(1.7, 1.4, 0.26, 59.4, 0.9, 12.6, "blueGlass", kit.edgeSoft); // sealed unit at the robot
  B.box(1.7, 0.06, 0.28, 59.4, 0.87, 12.59, DARK, null);
  B.box(1.7, 0.06, 0.28, 59.4, 2.27, 12.59, DARK, null);
  B.box(3.2, 0.2, 0.9, 58.6, 0, 6.2, "light");
  for (const [x, n] of [[58.8, 2], [60.6, 3]] as const) {
    for (let k = 0; k < n; k++) B.box(1.4, 1.3, 0.04, x, 0.2, 6.4 + k * 0.14, "blueGlass", kit.edgeSoft);
    B.box(1.4, 0.06, 0.08 + 0.14 * (n - 1), x, 0.2, 6.38, DARK, null);
  }
  panel(55.5, 11.2);
  for (let x = 51.8; x < 62; x += 2.1) B.box(1.9, 0.9, 0.05, x, 0.9, 11.55, "white", kit.edgeSoft); // LISEC units' housings
  worker(55.3, 9.4);

  // Glazing: frame + glass unit waiting, finished window with a green "checked" tag
  standingWindow(64.2, 0.05, 13.9, 1.6, 2);
  B.box(0.3, 0.3, 0.04, 65.5, 1.5, 14.06, P.tag, null);
  B.box(0.18, 0.18, 0.05, 66.7, 0.05, 13.7, "grey");
  B.box(1.6, 1.2, 0.2, 64.2, 1.12, 7.6, "blueGlass", kit.edgeSoft); // unit ready on the bench edge
  for (const x of [64.1, 68.4]) B.box(0.18, 0.08, 0.3, x, 1.12, 10.2, DARK, null); // setting blocks
  worker(67.9, 13.2);

  // Packing: a finished window before wrapping
  standingWindow(70.7, 0.05, 3.2, 1.3, 1.8);
  worker(75.8, 7.4);

  // Offices: a readable prop for every team
  const texPlane = (w: number, h: number, draw: (g: CanvasRenderingContext2D, W: number, H: number) => void) => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = Math.round((320 * h) / w);
    const g = c.getContext("2d");
    if (g) {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, c.width, c.height);
      g.strokeStyle = "#1f4e8c";
      g.fillStyle = "#1f4e8c";
      g.lineWidth = 6;
      draw(g, c.width, c.height);
    }
    const tex = kit.track(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(w, h)), kit.track(new THREE.MeshBasicMaterial({ map: tex })));
    return m;
  };
  {
    const span = (EX1 - EX0 - 2) / 5;
    const cxOf = (i: number) => EX0 + 1 + span * (i + 0.5);
    const screen = (i: number, draw: Parameters<typeof texPlane>[2]) => {
      const m = texPlane(1.05, 0.65, draw);
      m.position.set(cxOf(i), MEZZ_Y + 1.45, -6.9);
      hall.add(m);
    };
    // Quotations: papers, calculator and a USD sheet on the desk
    const usd = texPlane(0.8, 0.55, (g, w, h) => {
      g.font = "bold 90px Inter, Arial, sans-serif";
      g.textAlign = "center";
      g.fillText("USD", w / 2, h / 2 + 30);
    });
    usd.rotation.x = -Math.PI / 2;
    usd.position.set(cxOf(0) - 0.6, MEZZ_Y + 1.06, -6.5);
    hall.add(usd);
    B.box(0.45, 0.06, 0.6, cxOf(0) + 0.5, MEZZ_Y + 1.0, -6.9, "dark", null); // calculator
    screen(0, (g, w, h) => {
      for (let r = 0; r < 5; r++) g.fillRect(24, 26 + r * 34, w - 48 - (r % 2) * 80, 10);
      void h;
    });
    // Engineering: a structural diagram
    screen(1, (g, w, h) => {
      g.beginPath();
      g.moveTo(30, h - 40);
      g.lineTo(w - 30, h - 40);
      for (let k = 0; k <= 6; k++) {
        g.moveTo(30 + k * ((w - 60) / 6), h - 40);
        g.lineTo(30 + k * ((w - 60) / 6), h - 40 - 30 * Math.sin((k / 6) * Math.PI) - 20);
      }
      g.stroke();
      g.beginPath();
      g.moveTo(30, 40);
      for (let k = 0; k <= 20; k++) g.lineTo(30 + k * ((w - 60) / 20), 40 + 40 * Math.sin((k / 20) * Math.PI));
      g.stroke();
    });
    // Technical design: a big drawing screen with a window section
    screen(2, (g, w, h) => {
      g.strokeRect(40, 30, w - 80, h - 60);
      g.strokeRect(70, 55, w - 140, h - 110);
      g.lineWidth = 3;
      for (let k = 1; k < 4; k++) {
        g.beginPath();
        g.moveTo(70, 55 + k * ((h - 110) / 4));
        g.lineTo(w - 70, 55 + k * ((h - 110) / 4));
        g.stroke();
      }
    });
    // Transport & logistics: map with a route and containers
    screen(3, (g, w, h) => {
      g.lineWidth = 4;
      g.setLineDash([12, 10]);
      g.beginPath();
      g.moveTo(40, h - 50);
      g.bezierCurveTo(w * 0.35, 20, w * 0.65, h, w - 40, 50);
      g.stroke();
      g.setLineDash([]);
      g.fillRect(28, h - 64, 44, 26);
      g.fillRect(w - 64, 36, 44, 26);
    });
    // Production management: a schedule board
    const board = texPlane(1.8, 1.1, (g, w) => {
      for (let r = 0; r < 5; r++) {
        g.globalAlpha = 0.25;
        g.fillRect(20, 20 + r * 36, w - 40, 26);
        g.globalAlpha = 1;
        g.fillRect(30 + ((r * 47) % 120), 20 + r * 36, 60 + ((r * 31) % 90), 26);
      }
    });
    board.position.set(cxOf(4) + 0.4, MEZZ_Y + 1.35, -7.62);
    hall.add(board);
    B.box(1.9, 1.2, 0.06, cxOf(4) - 0.55, MEZZ_Y + 0.75, -7.7, "white");
  }

  // floor markers (numbered discs) and painted arrows, per station; step anchors above each machine
  const numTex = Array.from({ length: 8 }, (_, i) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      g.fillStyle = "#1f4e8c";
      g.beginPath();
      g.arc(64, 64, 60, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffffff";
      g.font = "600 70px Inter, Arial, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(String(i + 1), 64, 68);
    }
    const t = kit.track(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
  const discGeo = kit.track(new THREE.CircleGeometry(0.8, 40));
  discGeo.rotateX(-Math.PI / 2);
  const arrowMat = kit.track(new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.6, depthWrite: false }));
  const headShape = new THREE.Shape([new THREE.Vector2(0, 0.45), new THREE.Vector2(0.7, 0), new THREE.Vector2(0, -0.45)]);
  const headGeo = kit.track(new THREE.ShapeGeometry(headShape));
  headGeo.rotateX(-Math.PI / 2);
  const shaftGeo = kit.track(new THREE.PlaneGeometry(1, 0.22));
  shaftGeo.rotateX(-Math.PI / 2);
  /** marker positions that differ from "in front of the machine" */
  const MARK: Record<string, [number, number]> = { "goods-truck": [8.5, 22.6], "pack-load": [71.2, 18.6], "glass-rack": [60.2, 7.4], "glaze-bench": [66.4, 12.9] };
  const processGroups: THREE.Group[] = [];
  const markers: THREE.Mesh[][] = [];
  const stepAnchors: THREE.Object3D[][] = [];
  const markerMats: THREE.MeshBasicMaterial[] = [];
  ZONES.forEach((z, zi) => {
    const grp = new THREE.Group();
    grp.visible = false;
    hall.add(grp);
    processGroups.push(grp);
    const ms: THREE.Mesh[] = [];
    const anchors: THREE.Object3D[] = [];
    const pts: THREE.Vector3[] = [];
    const y0 = z.floorY + (z.floorY > 0 ? 0.3 : 0.07);
    z.steps.forEach((st, i) => {
      const b = st.machine ? MACHINES[st.machine] : undefined;
      const cx = b ? (b.min.x + b.max.x) / 2 : (z.rect[0] + z.rect[2]) / 2;
      const mk = st.machine && MARK[st.machine];
      const px = mk ? mk[0] : cx;
      const pz = mk ? mk[1] : b ? b.max.z + 1 : z.rect[3] - 1;
      const mat = kit.track(new THREE.MeshBasicMaterial({ map: numTex[i], transparent: true, depthWrite: false }));
      markerMats.push(mat);
      const disc = new THREE.Mesh(discGeo, mat);
      disc.position.set(px, y0 + 0.01, pz);
      grp.add(disc);
      ms.push(disc);
      pts.push(new THREE.Vector3(px, y0, pz));
      const a = new THREE.Object3D();
      a.position.set(cx, (b ? b.max.y : z.floorY + 2) + 0.35, b ? (b.min.z + b.max.z) / 2 : pz);
      hall.add(a);
      anchors.push(a);
    });
    if (zi !== OFFICES) {
      for (let i = 0; i + 1 < pts.length; i++) {
        const from = pts[i];
        const to = pts[i + 1];
        const d = to.clone().sub(from);
        const len = Math.hypot(d.x, d.z);
        if (len < 2.6) continue;
        const ang = Math.atan2(-d.z, d.x);
        const shaft = new THREE.Mesh(shaftGeo, arrowMat);
        const l = len - 1.6 - 0.7;
        shaft.scale.x = Math.max(0.1, l);
        shaft.position.set(from.x + (d.x / len) * (0.85 + l / 2), from.y, from.z + (d.z / len) * (0.85 + l / 2));
        shaft.rotation.y = ang;
        grp.add(shaft);
        const head = new THREE.Mesh(headGeo, arrowMat);
        head.position.set(from.x + (d.x / len) * (0.85 + l), from.y, from.z + (d.z / len) * (0.85 + l));
        head.rotation.y = ang;
        grp.add(head);
      }
    }
    markers.push(ms);
    stepAnchors.push(anchors);
  });

  /* ── Offices: five teams upstairs, each with a person, desk and label ── */
  const roleAnchors: THREE.Object3D[] = [];
  {
    const g = machine(OFFICES);
    const roles = ZONES[OFFICES].steps;
    const span = (EX1 - EX0 - 2) / roles.length;
    roles.forEach((_, i) => {
      const cx = EX0 + 1 + span * (i + 0.5);
      if (i > 0) B.box(0.08, 2.2, EZ1 - EZ0 - 1.2, EX0 + 1 + span * i, MEZZ_Y + 0.25, EZ0 + 0.6, "glass", kit.edgeSoft);
      kit.shadow(hall, cx, -6.2, 3.6, 2.4);
      B.box(2.6, 0.1, 1.2, cx - 1.3, MEZZ_Y + 1, -7.2, "white");
      B.box(0.1, 0.75, 1, cx - 1.2, MEZZ_Y + 0.25, -7.1, "grey", null);
      B.box(0.1, 0.75, 1, cx + 1.1, MEZZ_Y + 0.25, -7.1, "grey", null);
      const s = kit.box(g, 1.1, 0.7, 0.06, cx - 0.55, MEZZ_Y + 1.1, -7, "white");
      s.material = mat.screen;
      person(g, cx + 0.2, MEZZ_Y + 0.25, -5.4);
      const a = new THREE.Object3D();
      a.position.set(cx, MEZZ_Y + 2.7, -5.8);
      hall.add(a);
      roleAnchors.push(a);
    });
    const cA = new THREE.Color(0xe8ecf2);
    const cB = new THREE.Color(0xa9bfdd);
    anims[OFFICES] = (t) => {
      mat.screen.color.copy(cA).lerp(cB, 0.5 + 0.5 * Math.sin(t * 2));
    };
  }

  /* ── Zones: tint / pick planes, outlines, label anchors ── */
  const handles: FactoryZoneHandle[] = [];
  const tints: { mat: THREE.MeshBasicMaterial; line: THREE.LineBasicMaterial; level: number }[] = [];
  const planeGeo = kit.track(new THREE.PlaneGeometry(1, 1));
  planeGeo.rotateX(-Math.PI / 2);
  const outlineGeo = kit.track(new THREE.EdgesGeometry(planeGeo));
  hall.updateMatrixWorld(true);
  for (const z of ZONES) {
    const [x0, z0, x1, z1] = z.rect;
    const y = z.floorY + (z.floorY > 0 ? 0.27 : 0.05);
    const tm = kit.track(new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0, depthWrite: false }));
    const floor = new THREE.Mesh(planeGeo, tm);
    floor.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    floor.scale.set(x1 - x0, 1, z1 - z0);
    hall.add(floor);
    const line = kit.track(new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0 }));
    const outline = new THREE.LineSegments(outlineGeo, line);
    outline.position.copy(floor.position);
    outline.position.y += 0.01;
    outline.scale.copy(floor.scale);
    hall.add(outline);
    const anchor = new THREE.Object3D();
    // labels sit on the front edge of each pad (offices: above the extension)
    if (z.id === "offices") anchor.position.set((x0 + x1) / 2, EH + 1.2, (z0 + z1) / 2);
    else anchor.position.set((x0 + x1) / 2, 0.1, z1 - 0.9);
    hall.add(anchor);
    const bounds = new THREE.Box3(new THREE.Vector3(x0, z.floorY, z0), new THREE.Vector3(x1, z.floorY + z.top, z1)).applyMatrix4(hall.matrixWorld);
    handles.push({ anchor, floor, bounds });
    tints.push({ mat: tm, line, level: 0 });
  }
  const overview = new THREE.Box3(new THREE.Vector3(-1, 0, EZ0), new THREE.Vector3(L + 1, H, W + 2)).applyMatrix4(hall.matrixWorld);

  const ribGeo = kit.track(new THREE.BufferGeometry());
  ribGeo.setAttribute("position", new THREE.Float32BufferAttribute(ribLines, 3));
  hall.add(new THREE.LineSegments(ribGeo, ribs));
  B.build(hall);

  /* ── The real shutters, canopies and entry volume from the OBJ ── */
  const KEEP: [string, THREE.Material, THREE.LineBasicMaterial][] = [
    ["Loading shutter", mat.shutter, bEdge],
    ["Loading canopy", kit.track(lambert(0x2a5da6, { transparent: true, opacity: 0.55, depthWrite: false })), bEdge], // lighter so close-ups see past them
    ["entry volume", mat.entry, bEdge],
  ];
  const attachModel = (model: THREE.Group) => {
    model.rotation.x = -Math.PI / 2; // Z-up → Y-up
    const drop: THREE.Object3D[] = [];
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const rule = KEEP.find(([key]) => o.name.includes(key));
      if (!rule) {
        drop.push(o); // hall shell, roofs and far context are drawn by us (or left out)
        return;
      }
      const g = o.geometry as THREE.BufferGeometry;
      g.deleteAttribute("color");
      g.computeVertexNormals();
      kit.track(g);
      o.material = rule[1];
      o.add(new THREE.LineSegments(kit.track(new THREE.EdgesGeometry(g, 28)), rule[2]));
    });
    drop.forEach((o) => {
      o.removeFromParent();
      if (o instanceof THREE.Mesh) (o.geometry as THREE.BufferGeometry).dispose();
    });
    scene.add(model);
  };

  /* ── Animation ── */
  const clocks = ZONES.map(() => 0);
  const IDLE = new Set([3, 4, 6]); // coating hooks, glass line, forklift run in the overview
  const hlBox = new THREE.Box3();
  let hlKey: string | null = null;

  return {
    scene,
    zones: handles,
    roleAnchors,
    overview,
    pickables,
    /** per station, per step: label anchor above the machine */
    stepAnchors,
    /** world box that frames a station's whole process line (machines, markers, products) */
    stationBox(i: number) {
      const b = new THREE.Box3();
      const z = ZONES[i];
      z.steps.forEach((st) => st.machine && MACHINES[st.machine] && b.union(MACHINES[st.machine]));
      markers[i].forEach((m) => b.expandByPoint(m.position));
      return b.applyMatrix4(hall.matrixWorld);
    },
    /** emphasise one step's floor marker */
    setMarker(station: number, step: number) {
      markers.forEach((ms, zi) => ms.forEach((m, i) => m.scale.setScalar(zi === station && i === step ? 1.4 : 1)));
    },
    /** label anchor above the highlighted machine */
    hlAnchor,
    attachModel,
    /** world bounds of a step's machine (for the camera) */
    machineBox(key: string) {
      const b = MACHINES[key];
      return b ? b.clone().applyMatrix4(hall.matrixWorld) : null;
    },
    /** outline one machine (or clear with null) */
    setHighlight(key: string | null) {
      hlKey = key && MACHINES[key] ? key : null;
      hl.visible = hlKey !== null;
      if (!hlKey) return;
      hlBox.copy(MACHINES[hlKey]).expandByScalar(0.25);
      hlBox.getCenter(hl.position);
      hlBox.getSize(hl.scale);
      hlAnchor.position.set(hl.position.x, hlBox.max.y + 0.3, hl.position.z);
    },
    update(dt: number, s: FactoryState, t: number) {
      let moving = false;
      const k = s.life ? 1 - Math.exp(-dt * 7) : 1;
      const step = (level: number, target: number) => {
        const next = level + (target - level) * k;
        if (Math.abs(next - target) > 0.002) moving = true;
        return Math.abs(next - target) < 0.002 ? target : next;
      };
      ZONES.forEach((_, i) => {
        const on = i === s.active;
        const idle = s.active < 0 && IDLE.has(i);
        if (s.life && (on || idle)) clocks[i] += dt;
        anims[i](clocks[i]);
        more[i].forEach((f) => f(clocks[i]));
        const tn = tints[i];
        tn.level = step(tn.level, on ? 1 : 0);
        tn.mat.opacity = 0.1 * tn.level;
        tn.line.opacity = 0.85 * tn.level;
      });
      processGroups.forEach((g, i) => (g.visible = i === s.active));
      if (hl.visible) {
        const pulse = s.life ? 0.5 + 0.5 * Math.sin(t * 3) : 0.6;
        hlFill.opacity = 0.06 + 0.1 * pulse;
        hlLine.opacity = 0.6 + 0.4 * pulse;
      }
      return moving;
    },
    dispose() {
      kit.dispose();
    },
  };
}

export type FactoryBuild = ReturnType<typeof buildFactory>;
