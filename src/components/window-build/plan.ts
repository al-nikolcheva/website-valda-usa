/*
 * The build plan for one PVC tilt & turn window, from profile to packed unit.
 *
 * Everything is in millimetres. World axes: x right, y up, z toward the room (interior), so z = 0 is the
 * exterior face of the frame. The window is drawn from data, Bygga style: every part is a node with a pose
 * per step, and the stage animates between the poses of two steps. A part with no pose yet is not made;
 * a pose with `hidden` removes it.
 *
 * The profile sections are simplified diagrams (outer shape + chambers), not the real extrusion drawings.
 */

export type Vec3 = [number, number, number];
export type Mat = "pvc" | "steel" | "gasket" | "glass" | "spacer" | "hw" | "block" | "wrap" | "card" | "label" | "tool";

/** A profile cross section: x = distance in from the outer edge, y = depth (exterior → interior). */
export interface Section {
  outer: [number, number][];
  holes: [number, number][][];
}

export type Geo =
  | { kind: "bar"; section: Section; length: number; miter: boolean }
  | { kind: "box"; size: Vec3; centered?: boolean }
  | { kind: "cyl"; r: number; h: number };

export interface Pose {
  p?: Vec3;
  r?: Vec3;
  /** drawn see-through (to show what is inside) */
  ghost?: boolean;
  /** removes the part from this step on */
  hidden?: boolean;
  /** when the part first appears: where it comes from, relative to p */
  from?: Vec3;
  /** seconds after the step starts */
  delay?: number;
  dur?: number;
}

export interface Node {
  key: string;
  parent?: string;
  geo?: Geo;
  mat?: Mat;
  poses: Record<number, Pose>;
}

export interface StepDef {
  id: string;
  station: string;
  title: string;
  text: string;
  items: string[];
  view: { az: number; el: number };
  /** highlight these keys (and everything inside them); a trailing * matches a prefix. Default: parts with a pose in this step */
  focus?: string[];
  /** extra moments of the step's live animation to fit the camera around (seconds) */
  fitLive?: number[];
}

const D = Math.PI / 180;

/* ── Sizes ───────────────────────────────────────────────── */
export const W = 1000; // frame width
export const H = 1300; // frame height
const FD = 76; // frame depth
const SO = 46; // sash outer edge, in from the frame's outer edge
const SZ = 24; // sash back face, from the frame's exterior face
const SW = W - 2 * SO;
const SH = H - 2 * SO;
const GI = 60; // glass edge, in from the sash's outer edge
const GW = SW - 2 * GI;
const GH = SH - 2 * GI;
const GZ = 16; // glass exterior face, from the sash back

/* ── Profile sections (simplified) ───────────────────────── */
const FRAME: Section = {
  // body 44 wide, full depth; an exterior stop lip runs on to 64 for the sash to close against
  outer: [[0, 0], [64, 0], [64, 22], [44, 22], [44, FD], [0, FD]],
  holes: [
    [[8, 6], [36, 6], [36, 20], [8, 20]],
    [[8, 26], [36, 26], [36, 66], [8, 66]], // main chamber: the steel goes here
    [[47, 5], [61, 5], [61, 17], [47, 17]],
  ],
};
const SASH: Section = {
  outer: [[0, 0], [70, 0], [70, 14], [56, 14], [56, 70], [0, 70]],
  holes: [
    [[3, 8], [9, 8], [9, 62], [3, 62]],
    [[12, 4], [44, 4], [44, 16], [12, 16]],
    [[12, 20], [44, 20], [44, 60], [12, 60]],
    [[58, 3], [67, 3], [67, 11], [58, 11]],
  ],
};
const BEAD: Section = {
  outer: [[0, 0], [16, 0], [16, 9], [9, 17], [0, 17]],
  holes: [[[3, 3], [7, 3], [7, 13], [3, 13]]],
};

/* ── Helpers ─────────────────────────────────────────────── */
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Four members of a rectangle, each running from its own corner (bottom, right, top, left), local y pointing in. */
function ring(w: number, h: number, o: Vec3 = [0, 0, 0]) {
  return [
    { p: add(o, [0, 0, 0]), r: [0, 0, 0] as Vec3, len: w },
    { p: add(o, [w, 0, 0]), r: [0, 0, 90 * D] as Vec3, len: h },
    { p: add(o, [w, h, 0]), r: [0, 0, 180 * D] as Vec3, len: w },
    { p: add(o, [0, h, 0]), r: [0, 0, -90 * D] as Vec3, len: h },
  ];
}
/** Which way each member comes in from (outward), for fly-ins. */
const OUT: Vec3[] = [[0, -320, 0], [320, 0, 0], [0, 320, 0], [-320, 0, 0]];

const nodes: Node[] = [];
const node = (n: Node) => (nodes.push(n), n);
const box = (size: Vec3, centered = false): Geo => ({ kind: "box", size, centered });

/* ── Step indices ────────────────────────────────────────── */
export const S = { arrive: 0, cut: 1, steel: 2, machine: 3, weld: 4, clean: 5, sash: 6, hardware: 7, igu: 8, glaze: 9, check: 10, pack: 11 } as const;

/* ── The bench: four frame profiles lying in front of the camera, room side down, rebate facing us ── */
const FRAME_RING = ring(W, H);
const BENCH_GAP = 230;
export const BENCH = FRAME_RING.map((m, i) => ({
  len: m.len,
  x0: (W - m.len) / 2,
  z: -BENCH_GAP * i,
  /** world pose of a bar lying on the bench */
  pose: (x0 = (W - m.len) / 2): Pose => ({ p: [x0, FD, -BENCH_GAP * i], r: [90 * D, 0, 0] }),
}));
/** bench pose maps bar-local (x, y, z) to world (x0 + x, FD - z, zBar + y) */
const benchWorld = (i: number, x: number, y: number, z: number): Vec3 => [BENCH[i].x0 + x, FD - z, BENCH[i].z + y];

/* ── 1. Uncut profiles ───────────────────────────────────── */
const LONG = 1700;
export const SAW_T0 = 0.25;
export const SAW_STEP = 0.75;
BENCH.forEach((b, i) => {
  const cutAt = SAW_T0 + i * SAW_STEP + SAW_STEP * 0.5;
  node({
    key: `long-${i}`,
    geo: { kind: "bar", section: FRAME, length: LONG, miter: false },
    mat: "pvc",
    poses: {
      [S.arrive]: { ...b.pose((W - LONG) / 2), from: [0, 0, 600], delay: 0.12 * i },
      [S.cut]: { hidden: true, delay: cutAt },
    },
  });
});

/* ── 2–5. Cut frame members, their steel and machining ───── */
const slotsByBar: { x: number; size: Vec3; z: number }[][] = [
  [{ x: 150, size: [36, 1.5, 6], z: 48 }, { x: 482, size: [36, 1.5, 6], z: 48 }, { x: 814, size: [36, 1.5, 6], z: 48 }],
  [{ x: 300, size: [24, 1.5, 14], z: 44 }, { x: 980, size: [24, 1.5, 14], z: 44 }],
  [],
  [{ x: 300, size: [24, 1.5, 14], z: 44 }, { x: 980, size: [24, 1.5, 14], z: 44 }],
];
export const ROUTER_T0 = 0.2;
export const ROUTER_STEP = 0.7;
/** where the router stops, in the order it machines (world: the face it cuts into is at z) */
export const ROUTER_PATH: Vec3[] = [];

FRAME_RING.forEach((m, i) => {
  const key = `frame-${i}`;
  const bench = BENCH[i].pose();
  node({
    key,
    geo: { kind: "bar", section: FRAME, length: m.len, miter: true },
    mat: "pvc",
    poses: {
      [S.cut]: { ...bench, delay: SAW_T0 + i * SAW_STEP + SAW_STEP * 0.5, dur: 0.01 },
      [S.steel]: { ...bench, ghost: true },
      [S.machine]: { ...bench },
      [S.weld]: { p: m.p, r: m.r, delay: 0.1 * i, dur: 1.3 },
    },
  });
  node({
    key: `steel-${i}`,
    parent: key,
    geo: box([m.len - 100, 22, 34]),
    mat: "steel",
    poses: { [S.steel]: { p: [50, 11, 29], from: [m.len + 200, 0, 0], delay: 0.35 + 0.28 * i, dur: 1.1 } },
  });
  for (const s of slotsByBar[i]) {
    const j = ROUTER_PATH.length;
    // s.z is the bar-local depth of the slot: deep in the rebate, so it shows under the stop lip on the bench
    ROUTER_PATH.push(benchWorld(i, s.x + s.size[0] / 2, 44 + s.size[1], s.z + s.size[2] / 2));
    node({
      key: `slot-${i}-${j}`,
      parent: key,
      geo: box(s.size),
      mat: "gasket",
      poses: { [S.machine]: { p: [s.x, 44, s.z], delay: ROUTER_T0 + j * ROUTER_STEP + ROUTER_STEP * 0.6, dur: 0.2 } },
    });
  }
});

/* the double-head saw: two blades, set on the miter lines (the stage moves them from bar to bar) */
const BLADE: Geo = { kind: "cyl", r: 120, h: 4 };
node({ key: "saw-a", geo: BLADE, mat: "tool", poses: { [S.cut]: { p: [0, 300, 0], r: [0, 45 * D, 90 * D], dur: 0.01 }, [S.steel]: { hidden: true } } });
node({ key: "saw-b", geo: BLADE, mat: "tool", poses: { [S.cut]: { p: [0, 300, 0], r: [0, -45 * D, 90 * D], dur: 0.01 }, [S.steel]: { hidden: true } } });
export const SAW_TOP = 250;
export const SAW_LOW = 100;
export const sawAt = (i: number) => ({
  a: [BENCH[i].x0 + 32, BENCH[i].z + 32] as [number, number],
  b: [BENCH[i].x0 + BENCH[i].len - 32, BENCH[i].z + 32] as [number, number],
});

/* the router: a spindle pointing into the rebate face */
node({ key: "router", geo: { kind: "cyl", r: 9, h: 140 }, mat: "tool", poses: { [S.machine]: { p: ROUTER_PATH[0], r: [90 * D, 0, 0], dur: 0.01 }, [S.weld]: { hidden: true } } });

/* ── Corners: weld beads, then corner protectors ─────────── */
FRAME_RING.forEach((m, i) => {
  const c = `corner-${i}`;
  node({ key: c, poses: { [S.arrive]: { p: m.p, r: m.r } } });
  node({ key: `weld-${i}-a`, parent: c, geo: box([64, 9, 6], true), mat: "pvc", poses: { [S.weld]: { p: [22, 22, FD + 3], r: [0, 0, 45 * D], delay: 1.45 + 0.1 * i, dur: 0.3 }, [S.clean]: { hidden: true, delay: 0.3 + 0.35 * i } } });
  node({ key: `weld-${i}-b`, parent: c, geo: box([11, 11, FD + 6], true), mat: "pvc", poses: { [S.weld]: { p: [0, 0, FD / 2], r: [0, 0, 45 * D], delay: 1.45 + 0.1 * i, dur: 0.3 }, [S.clean]: { hidden: true, delay: 0.3 + 0.35 * i } } });
  const pk = { delay: 0.12 * i, dur: 0.8 };
  node({ key: `prot-${i}-a`, parent: c, geo: box([150, 8, 118]), mat: "card", poses: { [S.pack]: { p: [-8, -8, -12], from: [-120, -120, 0], ...pk } } });
  node({ key: `prot-${i}-b`, parent: c, geo: box([8, 142, 118]), mat: "card", poses: { [S.pack]: { p: [-8, 0, -12], from: [-120, -120, 0], ...pk } } });
  node({ key: `prot-${i}-c`, parent: c, geo: box([150, 58, 6]), mat: "card", poses: { [S.pack]: { p: [-8, 0, 100], from: [-120, -120, 0], ...pk } } });
  node({ key: `prot-${i}-d`, parent: c, geo: box([58, 92, 6]), mat: "card", poses: { [S.pack]: { p: [-8, 58, 100], from: [-120, -120, 0], ...pk } } });
});

/* ── The sash, built beside the frame, then hung ─────────── */
export const SASH_BESIDE: Vec3 = [W + 260, SO, SZ];
node({ key: "sash", poses: { [S.arrive]: { p: SASH_BESIDE }, [S.check]: { p: [SO, SO, SZ], dur: 1.5 } } });
node({ key: "tilt", parent: "sash", poses: { [S.arrive]: { p: [0, 0, 0] } } }); // hinges on the bottom edge
node({ key: "turn", parent: "tilt", poses: { [S.arrive]: { p: [0, 0, 0] } } }); // hinges on the left edge

ring(SW, SH).forEach((m, i) =>
  node({
    key: `sash-${i}`,
    parent: "turn",
    geo: { kind: "bar", section: SASH, length: m.len, miter: true },
    mat: "pvc",
    poses: { [S.sash]: { p: m.p, r: m.r, from: OUT[i], delay: 0.15 * i, dur: 1.1 } },
  }),
);

/* ── Seals and hardware ──────────────────────────────────── */
const strips = (o: Vec3, w: number, h: number, t: number, d: number): { p: Vec3; size: Vec3 }[] => [
  { p: o, size: [w, t, d] },
  { p: add(o, [0, h - t, 0]), size: [w, t, d] },
  { p: add(o, [0, t, 0]), size: [t, h - 2 * t, d] },
  { p: add(o, [w - t, t, 0]), size: [t, h - 2 * t, d] },
];
strips([48, 48, 22], W - 96, H - 96, 6, 3).forEach((s, i) =>
  node({ key: `fgasket-${i}`, geo: box(s.size), mat: "gasket", poses: { [S.hardware]: { p: s.p, from: [0, 0, 160], delay: 0.08 * i } } }),
);
strips([62, 62, 14], SW - 124, SH - 124, 6, 2).forEach((s, i) =>
  node({ key: `sgasket-${i}`, parent: "turn", geo: box(s.size), mat: "gasket", poses: { [S.hardware]: { p: s.p, from: [0, 0, 160], delay: 0.3 + 0.08 * i } } }),
);
node({ key: "hinge-0", geo: box([36, 90, 10]), mat: "hw", poses: { [S.hardware]: { p: [4, 20, FD], from: [-160, 0, 0], delay: 0.7 } } });
node({ key: "hinge-1", geo: box([36, 90, 10]), mat: "hw", poses: { [S.hardware]: { p: [4, H - 110, FD], from: [-160, 0, 0], delay: 0.8 } } });
node({ key: "gear-0", parent: "turn", geo: box([4, SH - 240, 14]), mat: "hw", poses: { [S.hardware]: { p: [SW, 120, 30], from: [180, 0, 0], delay: 1.0 } } });
node({ key: "gear-1", parent: "turn", geo: box([SW - 240, 4, 14]), mat: "hw", poses: { [S.hardware]: { p: [120, SH, 30], from: [0, 180, 0], delay: 1.1 } } });
const HANDLE: Vec3 = [SW - 28, SH / 2, 70];
node({ key: "rose", parent: "turn", geo: box([30, 70, 12]), mat: "hw", poses: { [S.hardware]: { p: [HANDLE[0] - 15, HANDLE[1] - 35, HANDLE[2]], from: [0, 0, 220], delay: 1.3 } } });
node({ key: "lever", parent: "turn", poses: { [S.arrive]: { p: [HANDLE[0], HANDLE[1] + 10, HANDLE[2] + 12] } } });
node({ key: "lever-arm", parent: "lever", geo: box([22, 150, 16]), mat: "hw", poses: { [S.hardware]: { p: [-11, -140, 0], from: [0, 0, 220], delay: 1.4 } } });

/* ── Insulated glass unit, made on the glass line, then glazed into the sash ── */
node({ key: "igu", parent: "turn", poses: { [S.arrive]: { p: [GI, GI, 460] }, [S.glaze]: { p: [GI, GI, GZ], delay: 0.6, dur: 1.2 } } });
node({ key: "pane-out", parent: "igu", geo: box([GW, GH, 6]), mat: "glass", poses: { [S.igu]: { p: [0, 0, 0], from: [0, 0, 260] } } });
strips([2, 2, 6], GW - 4, GH - 4, 10, 24).forEach((s, i) =>
  node({ key: `spacer-${i}`, parent: "igu", geo: box(s.size), mat: "spacer", poses: { [S.igu]: { p: s.p, from: [0, 0, 260], delay: 0.6 + 0.05 * i } } }),
);
node({ key: "pane-in", parent: "igu", geo: box([GW, GH, 6]), mat: "glass", poses: { [S.igu]: { p: [0, 0, 30], from: [0, 0, 300], delay: 1.3, dur: 1.1 } } });

for (const [i, [x, y]] of ([[150, 56], [SW - 250, 56], [150, SH - 60], [SW - 250, SH - 60]] as const).entries())
  node({ key: `block-${i}`, parent: "turn", geo: box([100, 4, 36]), mat: "block", poses: { [S.glaze]: { p: [x, y, GZ], from: [0, 0, 200], delay: 0.1 * i } } });

ring(SW - 112, SH - 112, [56, 56, 53]).forEach((m, i) =>
  node({
    key: `gbead-${i}`,
    parent: "turn",
    geo: { kind: "bar", section: BEAD, length: m.len, miter: true },
    mat: "pvc",
    poses: { [S.glaze]: { p: m.p, r: m.r, from: [0, 0, 140], delay: 1.9 + 0.15 * i, dur: 0.8 } },
  }),
);

/* ── Packing ─────────────────────────────────────────────── */
node({ key: "wrap", geo: box([W + 28, H + 28, 144]), mat: "wrap", poses: { [S.pack]: { p: [-14, -14, -14], delay: 0.9, dur: 0.8 } } });
node({ key: "label", geo: box([240, 140, 1]), mat: "label", poses: { [S.pack]: { p: [640, 960, 131], from: [0, 0, 80], delay: 1.6 } } });

export const NODES = nodes;

/* ── The steps (copy) ────────────────────────────────────── */
const BENCH_VIEW = { az: 22 * D, el: 34 * D };
const FRAME_VIEW = { az: 32 * D, el: 20 * D };

export const STEPS: StepDef[] = [
  {
    id: "arrive",
    station: "Goods in",
    title: "Profiles arrive",
    text: "Every window starts as long lengths of multi-chamber PVC profile, delivered with galvanized steel, seals and hardware, and checked before production.",
    items: ["4 frame profiles"],
    view: BENCH_VIEW,
  },
  {
    id: "cut",
    station: "PVC line",
    title: "Cut at 45°",
    text: "A double-head saw cuts each profile to length with both ends at 45° at once, so the four pieces meet in clean mitered corners.",
    items: ["Double-head saw", "4 mitered profiles"],
    view: BENCH_VIEW,
    focus: ["frame-*", "saw-*"],
  },
  {
    id: "steel",
    station: "PVC line",
    title: "Steel reinforcement",
    text: "Galvanized steel slides into the main chamber of every profile. It stiffens the frame and gives the hardware screws something solid to bite into.",
    items: ["4 steel reinforcements"],
    view: BENCH_VIEW,
    focus: ["steel-*"],
  },
  {
    id: "machine",
    station: "PVC line",
    title: "Machining",
    text: "Drainage slots are routed into the rebate, so any water that gets past the outer seal runs back out, and holes are cut for the locks and hinges.",
    items: ["Drainage slots", "Hardware holes"],
    view: BENCH_VIEW,
    focus: ["slot-*", "router"],
  },
  {
    id: "weld",
    station: "PVC line",
    title: "Welding",
    text: "The four pieces are clamped in a four-head welder. The mitered ends are heated until they melt, then pressed together, all four corners in one go.",
    items: ["4 welded corners"],
    view: FRAME_VIEW,
  },
  {
    id: "clean",
    station: "PVC line",
    title: "Corner cleaning",
    text: "A corner cleaner trims the weld bead off the faces and grooves, leaving a smooth, fully sealed corner.",
    items: ["4 clean corners"],
    view: FRAME_VIEW,
    focus: ["weld-*"],
  },
  {
    id: "sash",
    station: "PVC line",
    title: "The sash",
    text: "The opening sash is made the same way: cut, reinforced, machined, welded and cleaned.",
    items: ["Sash frame"],
    view: FRAME_VIEW,
  },
  {
    id: "hardware",
    station: "PVC line",
    title: "Seals and hardware",
    text: "Gaskets are pressed into their grooves. Then the tilt & turn hinges, the locking gear around the sash and the handle are fitted.",
    items: ["Gaskets", "Hinges", "Locking gear", "Handle"],
    view: FRAME_VIEW,
  },
  {
    id: "igu",
    station: "Glass line",
    title: "Insulated glass unit",
    text: "On the LISEC line the panes are washed, a spacer filled with moisture absorber goes between them, and the unit is pressed together with argon inside, then sealed around the edge.",
    items: ["Outer pane", "Spacer", "Inner pane"],
    view: FRAME_VIEW,
  },
  {
    id: "glaze",
    station: "Glazing",
    title: "Glazing",
    text: "The glass unit is set on setting blocks inside the sash and held in place by glazing beads that clip in all around.",
    items: ["Setting blocks", "Glass unit", "4 glazing beads"],
    view: FRAME_VIEW,
    focus: ["block-*", "igu", "gbead-*"],
  },
  {
    id: "check",
    station: "Final check",
    title: "Hung and checked",
    text: "The sash is hung in the frame. Tilt, turn, locking, sealing and size are checked on every window before it is labeled.",
    items: ["Tilt", "Turn", "Lock"],
    view: { az: 36 * D, el: 16 * D },
    focus: ["sash"],
    fitLive: [3, 5.6],
  },
  {
    id: "pack",
    station: "Packing",
    title: "Packed to ship",
    text: "Corners are protected and every unit is wrapped and labeled, then packed on A-frame racks for the crossing.",
    items: ["Corner protectors", "Wrap", "Label"],
    view: { az: 30 * D, el: 20 * D },
  },
];
