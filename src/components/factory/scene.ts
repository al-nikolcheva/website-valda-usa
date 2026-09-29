import * as THREE from "three";
import { BLUE, EDGE, Kit, wallWithOpenings } from "@/components/ship/journey/kit";
import { makeContainer, makeTruck } from "@/components/ship/journey/models";
import { Batch } from "./batch";
import { DWELL, MEZZ_Y, OFFICES, STATIONS, TOUR_END, ZONES } from "./zones";

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
  tourOn: boolean;
  tourP: number;
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
  STATIONS.forEach((z) => {
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
    person(hall, 20.2, 0, 13.2);
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
    person(hall, 43, 0, 12.5);
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

  /* ── Offices: five teams upstairs, each with a person, desk and label ── */
  const roleAnchors: THREE.Object3D[] = [];
  {
    const g = machine(OFFICES);
    const roles = ZONES[OFFICES].roles ?? [];
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

  /* ── "Follow a window": two products (PVC + aluminum) and their glass units ── */
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const TRUCK_A = V(OUT_DOCK + 0.9, 1.4, W + 2.4);
  const TRUCK_B = V(OUT_DOCK + 0.9, 2.2, W + 3.6);
  /** a leg of a product's journey: straight (dwell, inside a station) or via the forklift aisle (travel) */
  type Leg = { p0: number; p1: number; a: THREE.Vector3; b: THREE.Vector3; aisle: boolean };
  const leg = (p0: number, p1: number, a: THREE.Vector3, b: THREE.Vector3, aisle = false): Leg => ({ p0, p1, a, b, aisle });
  const pts = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const along = (l: Leg, u: number, out: THREE.Vector3) => {
    if (!l.aisle) return out.lerpVectors(l.a, l.b, u);
    pts[0].copy(l.a);
    pts[1].set(l.a.x, 1, AISLE_Z);
    pts[2].set(l.b.x, 1, AISLE_Z);
    pts[3].copy(l.b);
    const lens = [pts[0].distanceTo(pts[1]), pts[1].distanceTo(pts[2]), pts[2].distanceTo(pts[3])];
    let d = u * (lens[0] + lens[1] + lens[2]);
    for (let i = 0; i < 3; i++) {
      if (d <= lens[i] || i === 2) return out.lerpVectors(pts[i], pts[i + 1], lens[i] ? Math.min(1, d / lens[i]) : 1);
      d -= lens[i];
    }
    return out;
  };
  /** position at p; returns true while travelling on the aisle */
  const posAt = (legs: Leg[], p: number, out: THREE.Vector3) => {
    let prev = legs[0].a;
    for (const l of legs) {
      if (p < l.p0) {
        out.copy(prev);
        return false;
      }
      if (p <= l.p1) {
        along(l, ease((p - l.p0) / (l.p1 - l.p0)), out);
        return l.aisle && p > l.p0 && p < l.p1;
      }
      prev = l.b;
    }
    out.copy(prev);
    return false;
  };
  // PVC window: goods in → PVC (foil, cut, weld, clean) → waits → glazing → packing → truck
  const PVC_OUT = V(25, 1.2, 10.6);
  const LEGS_A: Leg[] = [
    leg(0, 0.6, V(3.7, 3.15, 3.4), V(5, 1, 13)),
    leg(0.6, 1, V(5, 1, 13), V(14.2, 1.05, 10.2), true),
    leg(1, 1.6, V(14.2, 1.05, 10.2), PVC_OUT),
    leg(4.6, 5, PVC_OUT, V(66.4, 1.12, 4.4), true),
    leg(5.6, 6, V(66.4, 1.12, 4.4), V(73.8, 1.95, 4.6), true),
    leg(6, 6.3, V(73.8, 1.95, 4.6), V(79.2, 1.2, 10.4)),
    leg(6.3, 6.45, V(79.2, 1.2, 10.4), TRUCK_A),
  ];
  // aluminum window: goods in → aluminum (cut, machine, crimp) → coating → glazing → packing → truck
  const LEGS_B: Leg[] = [
    leg(0, 0.6, V(3.7, 3.15, 5.2), V(7.6, 1, 13)),
    leg(1.6, 2, V(7.6, 1, 13), V(30.6, 1.1, 10.1), true),
    leg(2, 2.6, V(30.6, 1.1, 10.1), V(35.9, 1.15, 10)),
    leg(2.6, 3, V(35.9, 1.15, 10), V(41.5, 3.4, 9.1), true),
    leg(3, 3.6, V(41.5, 3.4, 9.1), V(49.5, 3.4, 9.1)),
    leg(4.6, 5, V(49.5, 3.4, 9.1), V(66.4, 1.12, 10.6), true),
    leg(5.6, 6, V(66.4, 1.12, 10.6), V(76.8, 1.1, 7.4), true),
    leg(6, 6.3, V(76.8, 1.1, 7.4), V(79.2, 1.8, 12.6)),
    leg(6.3, 6.45, V(79.2, 1.8, 12.6), TRUCK_B),
  ];
  // the two glass units made on the LISEC line, then carried to glazing
  const LEGS_G: Leg[] = [leg(4, 4.6, V(52.6, 1.1, 13), V(61, 1.1, 13)), leg(4.6, 5, V(61, 1.1, 13), V(66.4, 1.1, 7.5), true)];

  const cartGeo = () => {
    const c = new THREE.Group();
    hall.add(c);
    kit.box(c, 2, 0.1, 1.5, -1, 0.8, -0.75, "light");
    for (const [x, z] of [[-0.9, -0.65], [0.8, -0.65], [-0.9, 0.55], [0.8, 0.55]] as const) kit.box(c, 0.1, 0.8, 0.1, x, 0, z, "grey");
    kit.shadow(c, 0, 0, 2.6, 2);
    return c;
  };
  const makeProduct = (barFill: "white" | "grey") => {
    const g = new THREE.Group();
    hall.add(g);
    const barM = kit.box(g, 3.2, 0.16, 0.16, -1.6, 0, -0.08, barFill, kit.edgeBlue);
    const frameG = new THREE.Group();
    g.add(frameG);
    const bars = frameFlat(frameG, -0.9, 0, -0.65, 1.8, 1.3, 0.14, kit.edgeBlue);
    const glass = kit.box(frameG, 1.52, 0.03, 1.02, -0.76, 0.06, -0.51, "blueGlass", kit.edgeSoft);
    const wrapM = kit.box(frameG, 1.95, 0.24, 1.45, -0.975, -0.04, -0.725, "glass", kit.edgeSoft);
    const meshes: THREE.Mesh[] = [];
    g.traverse((o) => o instanceof THREE.Mesh && meshes.push(o));
    return { g, bar: barM, frameG, bars, glass, wrap: wrapM, meshes, cart: cartGeo() };
  };
  const prodA = makeProduct("white");
  const prodB = makeProduct("grey");
  const units = new THREE.Group();
  hall.add(units);
  for (const dz of [-0.3, 0.3]) kit.box(units, 1.6, 1.2, 0.08, -0.8, 0, dz - 0.04, "blueGlass", kit.edgeSoft);
  const unitsCart = cartGeo();
  const ring = new THREE.Mesh(kit.track(new THREE.RingGeometry(1.25, 1.45, 48)), kit.track(new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.5, depthWrite: false })));
  ring.rotation.x = -Math.PI / 2;
  hall.add(ring);
  /** which product the step is about (for the ring and for dragging): 0 PVC, 1 aluminum */
  const focusProduct = (p: number) => (p >= 1.6 && p < 3.6 ? 1 : 0);
  const worldAt = (which: number, p: number, out: THREE.Vector3) => {
    posAt(which === 1 ? LEGS_B : LEGS_A, p, out);
    return out.applyMatrix4(hall.matrixWorld);
  };

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
  const bursts = ZONES.map(() => 0);
  const IDLE = new Set([3, 4, 6]); // coating hooks, glass line, forklift run in the overview
  const heroPos = new THREE.Vector3();

  return {
    scene,
    zones: handles,
    roleAnchors,
    overview,
    machineRoots: roots,
    products: [prodA.meshes, prodB.meshes],
    worldAt,
    focusProduct,
    attachModel,
    /** make a station's machines do their thing for a moment */
    burst(i: number) {
      bursts[i] = 3;
    },
    /** tour station for progress p */
    stationAt(p: number) {
      const k = Math.min(STATIONS.length - 1, Math.max(0, Math.floor(p)));
      return p - k > 0.85 && k < STATIONS.length - 1 ? k + 1 : k;
    },
    update(dt: number, s: FactoryState) {
      let moving = false;
      const k = s.life ? 1 - Math.exp(-dt * 7) : 1;
      const step = (level: number, target: number) => {
        const next = level + (target - level) * k;
        if (Math.abs(next - target) > 0.002) moving = true;
        return Math.abs(next - target) < 0.002 ? target : next;
      };
      const tk = Math.min(STATIONS.length - 1, Math.max(0, Math.floor(s.tourP)));
      const dwelling = s.tourOn && s.tourP - tk < DWELL;
      ZONES.forEach((_, i) => {
        const on = i === s.active;
        const idle = s.active < 0 && !s.tourOn && IDLE.has(i);
        const touring = dwelling && tk === i;
        if (bursts[i] > 0) {
          bursts[i] = Math.max(0, bursts[i] - dt);
          moving = true;
        }
        if (s.life && (on || idle || touring || bursts[i] > 0)) clocks[i] += dt;
        anims[i](clocks[i]);
        const t = tints[i];
        t.level = step(t.level, on ? 1 : 0);
        t.mat.opacity = 0.1 * t.level;
        t.line.opacity = 0.85 * t.level;
      });

      // the two products + their glass units
      const p = Math.min(TOUR_END, Math.max(0, s.tourP));
      const leave = s.tourOn ? ease(clamp01((p - (TOUR_END - 0.15)) / 0.15)) : 0;
      shipRig.position.z = W + 0.6 + 14 * leave;
      const pose = (pr: typeof prodA, legs: Leg[], madeAt: number, coatAt: number | null) => {
        pr.g.visible = s.tourOn;
        pr.cart.visible = false;
        if (!s.tourOn) return;
        const travelling = posAt(legs, p, heroPos);
        pr.g.position.copy(heroPos);
        if (p > 6.45) pr.g.position.z += 14 * leave; // rides away on the truck
        pr.bar.visible = p < madeAt;
        pr.frameG.visible = p >= madeAt;
        const coated = coatAt !== null && p >= coatAt;
        pr.bars.forEach((b) => (b.material = coated ? kit.fills.blue : coatAt !== null ? kit.fills.light : kit.fills.white));
        pr.glass.visible = p >= 5.3;
        pr.wrap.visible = p >= 6.15;
        pr.cart.visible = travelling;
        pr.cart.position.set(heroPos.x, 0, heroPos.z);
      };
      pose(prodA, LEGS_A, 1.3, null);
      pose(prodB, LEGS_B, 2.3, 3.3);
      units.visible = s.tourOn && p >= 4 && p < 5.3;
      unitsCart.visible = false;
      if (units.visible) {
        unitsCart.visible = posAt(LEGS_G, p, heroPos);
        units.position.copy(heroPos);
        unitsCart.position.set(heroPos.x, 0, heroPos.z);
      }
      ring.visible = s.tourOn;
      if (s.tourOn) {
        const focus = p >= 4 && p < 4.6 ? units : focusProduct(p) === 1 ? prodB.g : prodA.g;
        ring.position.set(focus.position.x, 0.08, focus.position.z);
      }
      return moving;
    },
    dispose() {
      kit.dispose();
    },
  };
}

export type FactoryBuild = ReturnType<typeof buildFactory>;
