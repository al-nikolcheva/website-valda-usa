import * as THREE from "three";
import {
  arrow,
  BowPane,
  crackSegments,
  type Kit,
  lerp,
  lin,
  Particles,
  rng,
  seg,
  Shatter,
  Static,
  type StageBuild,
  type StageLabel,
} from "./engine";

export type TestKind = "compare" | "missile" | "cyclic" | "performance";

/** Step names, known before three.js loads (used for the server-rendered controls). */
export const STEP_LABELS: Record<TestKind, string[]> = {
  compare: ["Ordinary glass", "Impact glass", "Inside the glass"],
  missile: ["Centre hit", "Corner hit", "Small missile"],
  cyclic: ["Inward cycles", "Outward cycles"],
  performance: ["Air", "Water", "Structural"],
};

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const G = 14; // slowed gravity for readability
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/* ── Shared parts ───────────────────────────────────────────── */

/** Fixed window: frame (+ optional sash) + glazing bead. Glass sits at z = 0. */
function windowUnit(S: Static, W: number, H: number, x0: number, y0: number, sash = false) {
  const f = 0.22;
  S.frame(W, H, f, 0.34, x0, y0, 0, "frame");
  let ix = x0 + f;
  let iy = y0 + f;
  let iw = W - 2 * f;
  let ih = H - 2 * f;
  if (sash) {
    const sf = 0.2;
    S.frame(iw, ih, sf, 0.28, ix, iy, 0.05, "accent");
    ix += sf;
    iy += sf;
    iw -= 2 * sf;
    ih -= 2 * sf;
  }
  S.frame(iw, ih, 0.07, 0.1, ix, iy, 0.1, "frame");
  return { gw: iw, gh: ih, cx: x0 + W / 2, cy: iy + ih / 2, sashRect: { x0: x0 + f, y0: y0 + f, w: W - 2 * f, h: H - 2 * f } };
}

/** 2x4 timber missile, tip at the group origin, body along +z. */
function missile(kit: Kit, parent: THREE.Object3D, len = 3) {
  const g = new THREE.Group();
  kit.box(g, 0.16, 0.34, len, -0.08, -0.17, len / 2, "accent");
  g.visible = false;
  parent.add(g);
  return g;
}

/** Pressure chamber the window is sealed onto. */
function chamber(S: Static, W: number, H: number, y0: number) {
  const cw = W + 1.2;
  const ch = H + 1.2;
  const cx0 = -cw / 2;
  const cy0 = y0 - 0.6;
  S.frame(cw, ch, 0.6, 0.3, cx0, cy0, -0.32, "steel");
  S.box(cw, ch, 2.4, cx0, cy0, -1.67, "steel");
  for (const lx of [cx0 + 0.15, cx0 + cw - 0.45]) for (const lz of [-0.8, -2.6]) S.box(0.3, cy0, 0.3, lx, 0, lz, "steel");
  // blower + duct
  S.box(1.2, 1.3, 1.2, cw / 2 + 0.7, 0, -2.1, "steel");
  S.cyl(0.22, 0.8, cw / 2 + 0.35, 0.95, -2.1, "x", "steel");
  return { top: cy0 + ch, right: cw / 2 + 1.9 };
}

/** Three pressure arrows in front of the glass. */
function pressureArrows(kit: Kit, parent: THREE.Object3D, cx: number, cy: number) {
  const group = new THREE.Group();
  const list = [V(cx - 0.75, cy + 0.7), V(cx + 0.75, cy + 0.7), V(cx, cy - 0.6)].map((p) => {
    const a = arrow(kit, 1.1);
    a.position.copy(p);
    group.add(a);
    return a;
  });
  parent.add(group);
  /** p: 0–1 magnitude, dir: +1 inward (toward the chamber), −1 outward */
  return (p: number, dir: number) => {
    group.visible = p > 0.02;
    for (const a of list) {
      const len = 0.35 + 0.65 * p;
      a.scale.set(1, 1, len);
      if (dir > 0) {
        a.rotation.y = Math.PI;
        a.position.z = 0.35 + 1.1 * len;
      } else {
        a.rotation.y = 0;
        a.position.z = 0.35;
      }
    }
  };
}

/* ── 01 · Ordinary vs laminated glass ───────────────────────── */
function buildCompare(kit: Kit): StageBuild {
  const root = new THREE.Group();
  const S = new Static();
  const W = 3;
  const H = 4;
  const base = 0.4;
  const xs = [-2.4, 2.4];
  const units = xs.map((x) => {
    S.box(W + 0.5, base, 1.1, x - W / 2 - 0.25, 0, 0, "steel");
    return windowUnit(S, W, H, x - W / 2, base);
  });
  const statics = S.build(kit, root);
  const [uL, uR] = units;
  const cy = uL.cy;
  const IX = 0.15;
  const IY = 0.2;

  // left: ordinary (annealed) glass
  const shatter = new Shatter(kit, uL.gw, uL.gh, IX, IY, 11, -cy);
  shatter.group.position.set(uL.cx, cy, 0);
  root.add(shatter.group);

  // right: laminated glass = glass / interlayer / glass
  const cracks = crackSegments(IX, IY, uR.gw, uR.gh, 5, 18, 2.4);
  const layers = [
    new BowPane(kit, uR.gw, uR.gh, "glass", [cracks]),
    new BowPane(kit, uR.gw, uR.gh, "accentGlass"),
    new BowPane(kit, uR.gw, uR.gh, "glass", [cracks]),
  ];
  const lz = [0.035, 0, -0.035];
  layers.forEach((p, i) => {
    p.group.position.set(uR.cx, cy, lz[i]);
    root.add(p.group);
  });

  const mL = missile(kit, root);
  const mR = missile(kit, root);

  const T_L = 0.3;
  const HIT_L = 1.2;
  const T_R = 4.1;
  const HIT_R = 5.0;
  const EXP = 8.1;
  const Z0 = 10;
  const FLOOR = 0.17;
  const hy = cy + IY;

  const labels: StageLabel[] = [
    { text: "Ordinary glass", p: V(uL.cx, base + H + 0.3, 0), show: true },
    { text: "Laminated impact glass", p: V(uR.cx, base + H + 0.3, 0), show: true, accent: true },
    { text: "Opening left open", p: V(uL.cx, cy - 0.4, 0), show: false },
    { text: "Cracked, still closed", p: V(uR.cx, cy - 1.0, 0.1), show: false },
    { text: "Glass", p: V(), show: false, align: "right" },
    { text: "Interlayer (PVB or ionoplast)", p: V(), show: false, align: "right", accent: true },
    { text: "Glass", p: V(), show: false, align: "right" },
  ];

  const bounds = new THREE.Box3().setFromObject(statics);
  bounds.expandByPoint(V(0, 0, 2.2));

  return {
    root,
    bounds,
    labels,
    steps: [
      { label: "Ordinary glass", start: 0, end: 3.9 },
      { label: "Impact glass", start: 3.9, end: 7.8 },
      { label: "Inside the glass", start: 7.8, end: 11 },
    ],
    update(t) {
      // left missile: through the glass, then drops behind the window
      mL.visible = t >= T_L;
      if (t < HIT_L) mL.position.set(uL.cx + IX, hy, lerp(Z0, 0.05, lin(t, T_L, HIT_L)));
      else {
        const dt = t - HIT_L;
        const push = 1 - Math.pow(1 - Math.min(1, dt / 0.6), 2);
        mL.position.set(uL.cx + IX, Math.max(FLOOR, hy - 0.5 * G * Math.max(0, dt - 0.4) ** 2), 0.05 - 3.7 * push);
      }
      shatter.set(t - HIT_L);

      // right missile: bounces off and drops in front
      mR.visible = t >= T_R;
      if (t < HIT_R) {
        mR.position.set(uR.cx + IX, hy, lerp(Z0, 0.05, lin(t, T_R, HIT_R)));
        mR.rotation.z = 0;
      } else {
        const dt = t - HIT_R;
        mR.position.set(uR.cx + IX, Math.max(FLOOR, hy - 0.5 * G * dt * dt), 0.05 + 0.9 * (1 - Math.exp(-6 * dt)));
        mR.rotation.z = 0.35 * Math.min(1, dt * 3);
      }
      const dr = t - HIT_R;
      const bow = dr > 0 && dr < 0.4 ? -0.16 * Math.sin((Math.PI * dr) / 0.4) : 0;
      const crack = lin(t, HIT_R, HIT_R + 0.45);
      layers.forEach((p) => p.set(bow));
      layers[0].reveal(0, crack);
      layers[2].reveal(0, crack);

      // exploded view of the laminate
      const s = seg(t, EXP, EXP + 1.2);
      const zs = [0.035 + 1.3 * s, 0.65 * s, -0.035];
      layers.forEach((p, i) => (p.group.position.z = zs[i]));
      const ex = uR.cx + uR.gw / 2 + 0.05;
      labels[4].p.set(ex, cy + uR.gh / 2 - 0.2, zs[0]);
      labels[5].p.set(ex, cy, zs[1]);
      labels[6].p.set(ex, cy - uR.gh / 2 + 0.2, zs[2]);

      labels[2].show = t > HIT_L + 1.1;
      labels[3].show = t > HIT_R + 0.7 && t < EXP;
      for (let i = 4; i < 7; i++) labels[i].show = s > 0.7;

      const caption =
        t < 3.9
          ? "Ordinary glass shatters and falls out"
          : t < 7.8
            ? "Laminated glass cracks but stays in the frame"
            : "Two lites bonded to a tough interlayer";
      return { caption };
    },
  };
}

/* ── 02 · Missile impact test rig ───────────────────────────── */
function buildMissile(kit: Kit): StageBuild {
  const root = new THREE.Group();
  const S = new Static();
  const W = 3.6;
  const H = 5;
  const y0 = 1.1;
  const u = windowUnit(S, W, H, -W / 2, y0);

  // timber buck + steel test frame
  S.frame(W + 0.6, H + 0.6, 0.3, 0.5, -W / 2 - 0.3, y0 - 0.3, -0.05, "frame");
  const cL = -W / 2 - 0.65;
  const cR = W / 2 + 0.3;
  const top = 7.3;
  for (const cx of [cL, cR]) {
    S.box(0.35, top, 0.35, cx, 0, -0.1, "steel");
    S.box(0.8, 0.12, 3.2, cx - 0.22, 0, -1.45, "steel");
    S.beam(V(cx + 0.175, 5.8, -0.1), V(cx + 0.175, 0.12, -2.85), 0.2, "steel");
    for (const y of [1.6, 3.6, 5.6]) S.box(0.22, 0.26, 0.3, cx === cL ? cx + 0.35 : cx - 0.22, y, 0.18, "steel");
  }
  S.box(cR + 0.35 - cL, 0.35, 0.35, cL, top, -0.1, "steel");
  S.box(cR + 0.35 - cL, 0.3, 0.35, cL, y0 - 0.62, -0.1, "steel");

  // air cannon: cart + tank + hose (static), barrel on an aiming pivot
  const PIV = V(0.1, 2.75, 8.6);
  S.box(1.4, 2.3, 2.2, PIV.x - 0.7, 0, PIV.z + 0.2, "steel");
  S.cyl(0.5, 1.9, PIV.x + 1.5, 0.95, PIV.z + 0.8, "y", "frame");
  S.beam(V(PIV.x + 1.5, 1.9, PIV.z + 0.8), V(PIV.x + 0.3, PIV.y, PIV.z + 0.6), 0.1, "frame");
  const statics = S.build(kit, root);

  const pivot = new THREE.Group();
  pivot.position.copy(PIV);
  root.add(pivot);
  const B = new Static();
  const BARREL = 3.2;
  B.cyl(0.24, BARREL, 0, 0, BARREL / 2, "z", "frame");
  B.box(0.7, 0.7, 0.9, -0.35, -0.35, -0.25, "frame");
  B.build(kit, pivot);

  // specimen glass, with crack sets: centre, corner, and three small-missile zones
  const cen = V(0, 0);
  const cor = V(u.gw / 2 - 0.45, -u.gh / 2 + 0.45);
  const small = [V(-0.55, 0.9), V(-u.gw / 2 + 0.4, u.gh / 2 - 0.4), V(u.gw / 2 - 0.3, -0.2)];
  const pane = new BowPane(kit, u.gw, u.gh, "glass", [
    crackSegments(cen.x, cen.y, u.gw, u.gh, 3, 18, 2.4),
    crackSegments(cor.x, cor.y, u.gw, u.gh, 9, 14, 1.6),
    ...small.map((p, i) => crackSegments(p.x, p.y, u.gw, u.gh, 20 + i, 7, 0.3, [0.1, 0.2])),
  ]);
  pane.group.position.set(u.cx, u.cy, 0);
  root.add(pane.group);
  const world = (p: THREE.Vector3) => V(u.cx + p.x, u.cy + p.y, 0.02);
  const T_CEN = world(cen);
  const T_COR = world(cor);
  const T_SMALL = small.map(world);
  const REST = V(0, 3.2, 0);

  const m1 = missile(kit, root);
  const m2 = missile(kit, root);

  // steel balls: one instanced draw call
  const BALLS = 9;
  const ballGeo = kit.own(new THREE.SphereGeometry(0.07, 10, 8));
  const balls = new THREE.InstancedMesh(ballGeo, kit.solid, BALLS);
  balls.frustumCulled = false;
  root.add(balls);
  const bm = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

  const aim = V();
  const muzzle = V();
  const tmp = V();
  const HIT1 = 1.75;
  const HIT2 = 5.75;
  const FLY = 0.45;
  const SMALL0 = 9.0;
  const FLOOR = 0.17;

  const labels: StageLabel[] = [
    { text: "Air cannon", p: V(PIV.x, PIV.y + 0.9, PIV.z), show: false },
    { text: "9 lb 2x4 · 50 ft/s", p: V(), show: false, accent: true },
    { text: "", p: V(), show: false },
    { text: "Hit 1 · centre", p: T_CEN.clone().add(V(0, 0.35, 0.1)), show: false },
    { text: "Hit 2 · corner", p: T_COR.clone().add(V(0.25, 0, 0.1)), show: false, align: "right" },
    { text: "New specimen", p: V(0, y0 + H + 0.3, 0), show: false },
    { text: "2 g steel balls · 130 ft/s", p: V(), show: false, accent: true },
  ];

  const place = (m: THREE.Group, start: number, hit: number, target: THREE.Vector3, restX: number, t: number) => {
    m.visible = t >= start && t < 8;
    if (!m.visible) return;
    const dirX = PIV.x - target.x;
    const dirZ = PIV.z - target.z;
    const hl = Math.hypot(dirX, dirZ);
    if (t < hit) {
      m.position.lerpVectors(muzzle, target, lin(t, start, hit));
    } else {
      const dt = t - hit;
      m.position.set(lerp(target.x, restX, Math.min(1, dt * 2)), Math.max(FLOOR, target.y - 0.5 * G * dt * dt), target.z + 1.0 * (1 - Math.exp(-6 * dt)));
    }
    tmp.set(m.position.x + dirX / hl, m.position.y, m.position.z + dirZ / hl);
    m.lookAt(tmp);
  };

  const bounds = new THREE.Box3().setFromObject(statics);

  return {
    root,
    bounds,
    labels,
    steps: [
      { label: "Centre hit", start: 0, end: 4 },
      { label: "Corner hit", start: 4, end: 8 },
      { label: "Small missile", start: 8, end: 13.2 },
    ],
    update(t) {
      // aim
      if (t < 4) aim.lerpVectors(REST, T_CEN, seg(t, 0.2, 1.0));
      else if (t < 8) aim.lerpVectors(T_CEN, T_COR, seg(t, 4.2, 5.0));
      else {
        aim.copy(T_COR);
        T_SMALL.forEach((p, g) => {
          const s = seg(t, SMALL0 - 0.6 + g * 1.3, SMALL0 - 0.1 + g * 1.3);
          if (s > 0) aim.lerp(p, s);
        });
      }
      pivot.lookAt(aim);
      pivot.updateMatrixWorld(true);
      muzzle.set(0, 0, BARREL).applyMatrix4(pivot.matrixWorld);

      // large missiles (the specimen is swapped for the small-missile step)
      place(m1, HIT1 - FLY, HIT1, T_CEN, T_CEN.x, t);
      place(m2, HIT2 - FLY, HIT2, T_COR, T_COR.x - 0.3, t);
      const d1 = t - HIT1;
      const d2 = t - HIT2;
      const dip = (d: number, a: number) => (d > 0 && d < 0.4 ? -a * Math.sin((Math.PI * d) / 0.4) : 0);
      pane.set(t < 8 ? dip(d1, 0.18) + dip(d2, 0.1) : 0);
      pane.reveal(0, t < 8 ? lin(t, HIT1, HIT1 + 0.45) : 0);
      pane.reveal(1, t < 8 ? lin(t, HIT2, HIT2 + 0.4) : 0);

      // small missiles: three groups of three
      for (let i = 0; i < BALLS; i++) {
        const g = Math.floor(i / 3);
        const fire = SMALL0 + g * 1.3 + (i % 3) * 0.16;
        const hit = fire + 0.12;
        const target = T_SMALL[g];
        if (t < fire || t < 8) {
          balls.setMatrixAt(i, hidden);
          continue;
        }
        if (t < hit) tmp.lerpVectors(muzzle, target, lin(t, fire, hit));
        else {
          const dt = t - hit;
          tmp.set(target.x + ((i % 3) - 1) * 0.08, Math.max(0.07, target.y - 0.5 * G * dt * dt), target.z + 0.35 * Math.min(1, dt * 2) + (i % 3) * 0.05);
        }
        bm.makeTranslation(tmp.x, tmp.y, tmp.z);
        balls.setMatrixAt(i, bm);
      }
      balls.instanceMatrix.needsUpdate = true;
      T_SMALL.forEach((_, g) => pane.reveal(2 + g, t < 8 ? 0 : lin(t, SMALL0 + g * 1.3 + 0.12, SMALL0 + g * 1.3 + 0.6)));

      // labels
      labels[0].show = t < 1.3;
      const flying = (t > HIT1 - FLY - 0.05 && t < HIT1 + 0.9) || (t > HIT2 - FLY - 0.05 && t < HIT2 + 0.9);
      const m = t < 4 ? m1 : m2;
      labels[1].show = flying;
      if (flying) labels[1].p.copy(m.position).add(V(0, 0.35, 0));
      labels[3].show = t > HIT1 + 0.4 && t < 8;
      labels[4].show = t > HIT2 + 0.4 && t < 8;
      labels[5].show = t > 8 && t < SMALL0;
      labels[6].show = t > SMALL0 - 0.2;
      labels[6].p.lerpVectors(muzzle, aim, 0.5).add(V(0, 0.5, 0));

      let hud = "Shot 1 of 2 · 50 ft/s, about 34 mph";
      let caption = "Large missile: a 9 lb 2x4 at the centre";
      if (t >= 4 && t < 8) {
        hud = "Shot 2 of 2 · 50 ft/s, about 34 mph";
        caption = "Second hit, near a corner";
      } else if (t >= 8) {
        hud = "New specimen · 130 ft/s";
        caption = "Small missile: for glazing more than 30 ft up";
      }
      return { caption, hud };
    },
  };
}

/* ── 03 · Cyclic pressure ───────────────────────────────────── */
function buildCyclic(kit: Kit): StageBuild {
  const root = new THREE.Group();
  const S = new Static();
  const W = 3.6;
  const H = 5;
  const y0 = 1.3;
  chamber(S, W, H, y0);
  const u = windowUnit(S, W, H, -W / 2, y0);
  const statics = S.build(kit, root);

  // the impacted specimen goes straight on to cycling, cracks and all
  const pane = new BowPane(kit, u.gw, u.gh, "glass", [
    crackSegments(0, 0, u.gw, u.gh, 3, 18, 2.4),
    crackSegments(u.gw / 2 - 0.45, -u.gh / 2 + 0.45, u.gw, u.gh, 9, 14, 1.6),
  ]);
  pane.reveal(0, 1);
  pane.reveal(1, 1);
  pane.group.position.set(u.cx, u.cy, 0);
  root.add(pane.group);
  const setArrows = pressureArrows(kit, root, u.cx, u.cy);

  const C1 = 7;
  const C2 = 14;
  const OSC = 16; // visible pulses per half; each stands for ~280 cycles

  const labels: StageLabel[] = [
    { text: "Pressure chamber", p: V(-W / 2 - 0.3, y0 + H + 0.7, -1.7), show: true },
    { text: "Inward", p: V(u.cx + 0.6, u.cy + 1.9, 1.2), show: false, accent: true },
    { text: "Outward", p: V(u.cx + 0.6, u.cy + 1.9, 1.2), show: false, accent: true },
  ];
  const bounds = new THREE.Box3().setFromObject(statics);
  bounds.expandByPoint(V(0, 0, 2));

  return {
    root,
    bounds,
    labels,
    steps: [
      { label: "Inward cycles", start: 0, end: C1 },
      { label: "Outward cycles", start: C1, end: C2 + 1.2 },
    ],
    update(t) {
      let p = 0;
      let dir = 1;
      let cycles = 0;
      if (t < C1) {
        const fr = t / C1;
        const env = 0.5 + 0.5 * fr;
        p = env * (0.35 + 0.65 * (0.5 - 0.5 * Math.cos(2 * Math.PI * OSC * fr)));
        cycles = 4500 * fr;
      } else if (t < C2) {
        const fr = lin(t, C1, C2);
        const env = 1 - 0.5 * fr;
        p = env * (0.35 + 0.65 * (0.5 - 0.5 * Math.cos(2 * Math.PI * OSC * fr)));
        dir = -1;
        cycles = 4500 + 4500 * fr;
      } else {
        cycles = 9000;
        dir = -1;
      }
      pane.set(-dir * p * 0.42);
      setArrows(p, dir);
      labels[1].show = p > 0.02 && dir > 0;
      labels[2].show = p > 0.02 && dir < 0;
      const hud = `Cycle ${fmt(cycles)} of 9,000`;
      const caption =
        t < C1 ? "Positive pressure pushes the glass in" : t < C2 ? "Then suction pulls it out" : "9,000 cycles done. Still holding.";
      return { caption, hud };
    },
  };
}

/* ── 04 · Air, water, structural ────────────────────────────── */
function buildPerformance(kit: Kit): StageBuild {
  const root = new THREE.Group();
  const S = new Static();
  const W = 3.6;
  const H = 5;
  const y0 = 1.3;
  chamber(S, W, H, y0);
  const u = windowUnit(S, W, H, -W / 2, y0, true);
  const statics = S.build(kit, root);

  const pane = new BowPane(kit, u.gw, u.gh, "glass");
  pane.group.position.set(u.cx, u.cy, 0);
  root.add(pane.group);
  const setArrows = pressureArrows(kit, root, u.cx, u.cy);

  // spray rack (water step)
  const RZ = 2.3;
  const rackRows = [u.cy + 1.5, u.cy + 0.3, u.cy - 0.9];
  const nozX = [-1.4, -0.7, 0, 0.7, 1.4];
  const R = new Static();
  for (const y of rackRows) {
    R.cyl(0.06, 4.8, 0, y, RZ, "x", "frame", 8);
    for (const x of nozX) R.box(0.12, 0.12, 0.2, x - 0.06, y - 0.06, RZ - 0.14, "accent");
  }
  for (const x of [-2.45, 2.45]) {
    R.box(0.12, rackRows[0] + 0.2, 0.12, x - 0.06, 0, RZ, "frame");
    R.box(0.9, 0.08, 0.5, x - 0.45, 0, RZ, "frame");
  }
  const rack = R.build(kit, root);

  // deflection gauges (structural step)
  const GZ = 1.1;
  const Gs = new Static();
  const gaugeAt = [V(0.55, u.cy + 0.35), V(-u.gw / 2 - 0.3, u.cy - 0.2)];
  for (const g of gaugeAt) {
    Gs.box(0.5, 0.06, 0.5, g.x - 0.25, 0, GZ + 0.2, "steel");
    Gs.box(0.08, g.y, 0.08, g.x - 0.04, 0, GZ + 0.2, "steel");
    Gs.cyl(0.2, 0.12, g.x, g.y, GZ, "z", "frame", 16);
    Gs.cyl(0.025, GZ - 0.1, g.x, g.y, GZ / 2, "z", "accent", 6);
  }
  const gauges = Gs.build(kit, root);

  // particles
  const r = rng(42);
  const AIR = 150;
  const air = new Particles(kit, AIR, 3);
  const airData = Array.from({ length: AIR }, (_, i) => {
    const leak = i % 4 === 0;
    let x: number;
    let y: number;
    const sr = u.sashRect;
    if (leak) {
      // a point on the sash perimeter joint
      const e = r() * 2 * (sr.w + sr.h);
      if (e < sr.w) [x, y] = [sr.x0 + e, sr.y0];
      else if (e < sr.w + sr.h) [x, y] = [sr.x0 + sr.w, sr.y0 + e - sr.w];
      else if (e < 2 * sr.w + sr.h) [x, y] = [sr.x0 + sr.w - (e - sr.w - sr.h), sr.y0 + sr.h];
      else [x, y] = [sr.x0, sr.y0 + sr.h - (e - 2 * sr.w - sr.h)];
    } else {
      x = u.cx + (r() - 0.5) * u.gw * 0.9;
      y = u.cy + (r() - 0.5) * u.gh * 0.9;
    }
    return { x, y, leak, ph: r(), ox: (r() - 0.5) * 1.2, oy: (r() - 0.5) * 1.2 };
  });
  root.add(air.points);

  const DROPS = 220;
  const water = new Particles(kit, DROPS, 2.5);
  const nozzles = rackRows.flatMap((y) => nozX.map((x) => V(x, y, RZ - 0.25)));
  const dropData = Array.from({ length: DROPS }, (_, i) => ({
    n: nozzles[i % nozzles.length],
    ph: r(),
    sx: (r() - 0.5) * 0.7,
    sy: -0.1 - r() * 0.5,
    run: 0.7 + r() * 0.6,
  }));
  root.add(water.points);
  const bottom = u.cy - u.gh / 2 + 0.08;

  const A1 = 6;
  const W1 = 12;
  const END = 19;

  const labels: StageLabel[] = [
    { text: "Air leakage at 1.57 psf", p: V(u.cx, y0 + H + 0.35, 0), show: false, accent: true },
    { text: "Spray rack", p: V(-2.45, rackRows[0] + 0.45, RZ), show: false },
    { text: "Deflection gauge", p: V(gaugeAt[0].x, gaugeAt[0].y + 0.35, GZ), show: false },
    { text: "Example rating: CW-PG65 · ±65 psf", p: V(u.cx, y0 + H + 0.35, 0), show: false, accent: true },
  ];

  const bounds = new THREE.Box3().setFromObject(statics);
  bounds.union(new THREE.Box3().setFromObject(rack));
  bounds.union(new THREE.Box3().setFromObject(gauges));

  return {
    root,
    bounds,
    labels,
    steps: [
      { label: "Air", start: 0, end: A1 },
      { label: "Water", start: A1, end: W1 },
      { label: "Structural", start: W1, end: END },
    ],
    update(t) {
      // ── air
      const inAir = t < A1;
      air.points.visible = inAir;
      if (inAir) {
        airData.forEach((d, i) => {
          const born = d.ph * 2;
          if (t < born) return air.hide(i);
          const s = ((t - born) / 2) % 1;
          if (s < 0.8) {
            const k = s / 0.8;
            air.set(i, d.x + d.ox * (1 - k), d.y + d.oy * (1 - k), lerp(3.2, 0.12, k));
          } else if (d.leak) {
            const k = (s - 0.8) / 0.2;
            air.set(i, d.x, d.y, lerp(0.12, -0.2, k));
          } else air.hide(i);
        });
        air.commit();
      }

      // ── water
      const inWater = t >= A1 && t < W1;
      rack.visible = inWater;
      water.points.visible = inWater;
      if (inWater) {
        const tw = t - A1;
        dropData.forEach((d, i) => {
          const born = d.ph * 1.4;
          if (tw < born) return water.hide(i);
          const s = ((tw - born) / 1.4) % 1;
          const hitX = d.n.x + d.sx;
          const hitY = d.n.y + d.sy;
          if (s < 0.3) {
            const k = s / 0.3;
            water.set(i, lerp(d.n.x, hitX, k), lerp(d.n.y, hitY, k) - 0.3 * k * k, lerp(d.n.z, 0.14, k));
          } else {
            const y = hitY - 0.3 - (s - 0.3) * d.run * 4;
            if (y < bottom) water.hide(i);
            else water.set(i, hitX, y, 0.14);
          }
        });
        water.commit();
      }

      // ── structural: DP, then 150% DP, then release
      const ts = t - W1;
      const inStruct = t >= W1;
      gauges.visible = inStruct;
      let psf = 0;
      if (inStruct) psf = 65 * seg(ts, 0.4, 1.6) + 32.5 * seg(ts, 2.4, 3.4) - 97.5 * seg(ts, 4.2, 5.0);
      pane.set(-(psf / 97.5) * 0.38);
      setArrows(psf / 97.5, 1);

      labels[0].show = inAir;
      labels[1].show = inWater;
      labels[2].show = inStruct && ts < 5.2;
      labels[3].show = inStruct && ts > 5.2;

      let caption: string;
      let hud: string;
      if (inAir) {
        caption = "Air: how much slips through the joints";
        hud = "About a 25 mph wind";
      } else if (inWater) {
        caption = "Water: sprayed while the chamber pulls air";
        hud = "No water may reach the inside";
      } else {
        const half = Math.round(psf * 2) / 2;
        hud = `Load ${half % 1 ? half.toFixed(1) : half} psf`;
        caption =
          ts < 2.2 ? "Structural: loaded to the design pressure" : ts < 4.2 ? "Then to 150% of the design pressure" : "Released: no breakage, no lasting bend";
      }
      return { caption, hud };
    },
  };
}

export function buildTest(kind: TestKind, kit: Kit): StageBuild {
  switch (kind) {
    case "compare":
      return buildCompare(kit);
    case "missile":
      return buildMissile(kit);
    case "cyclic":
      return buildCyclic(kit);
    case "performance":
      return buildPerformance(kit);
  }
}
