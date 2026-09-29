/* Scroll timeline for the journey (pure math, no three.js: safe to import from the section). */
import { SHIPPING_STEPS } from "@/lib/shipping";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** eased 0→1 progress of t between a and b */
export const seg = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export type Station = (typeof SHIPPING_STEPS)[number]["station"];

/** Scroll range owned by each station of the 3D journey. */
const STATION_RANGE: Record<Station, [number, number]> = {
  factory: [0, 0.4],
  sea: [0.4, 0.6],
  customs: [0.6, 0.8],
  site: [0.8, 1],
};
/** Where inside a step the chips jump to (fraction of the step's range). */
const CHIP_AT: Record<Station, number> = { factory: 0.7, sea: 0.65, customs: 0.75, site: 0.85 };
/** No step target goes past this (the finished block, before the section unpins). */
export const MAX_TARGET = 0.97;
/** Each caption step's [start, end] progress: steps sharing a station split its range evenly. */
export const STEP_RANGES: [number, number][] = SHIPPING_STEPS.map((s, i) => {
  const same = SHIPPING_STEPS.map((x, j) => (x.station === s.station ? j : -1)).filter((j) => j >= 0);
  const [a, b] = STATION_RANGE[s.station];
  const k = same.indexOf(i);
  const w = (b - a) / same.length;
  return [a + k * w, a + (k + 1) * w];
});
export const stepAt = (p: number) => {
  let i = 0;
  STEP_RANGES.forEach(([a], j) => {
    if (p >= a) i = j;
  });
  return i;
};
/** Progress the chip for step i scrolls to. */
export const stepTarget = (i: number) => {
  const [a, b] = STEP_RANGES[i];
  return Math.min(MAX_TARGET, lerp(a, b, CHIP_AT[SHIPPING_STEPS[i].station]));
};

/** Progress keyframes of the one hero container's trip. */
export const P = {
  loadEnd: 0.13, // forklift has pushed the crate in
  doorsShut: 0.16,
  driveA: 0.21, // truck → Bulgarian quay
  driveB: 0.36,
  liftA: 0.39, // quay crane → ship
  liftB: 0.45,
  sailA: 0.45, // ship crosses the Atlantic
  sailB: 0.58,
  unloadA: 0.58, // US crane → truck
  unloadB: 0.64,
  gateA: 0.645, // truck → customs booth
  gateB: 0.68,
  barrierA: 0.68,
  barrierB: 0.71,
  passA: 0.765, // through the gate and on by road to the site (truck waits while "Customs cleared" shows)
  siteB: 0.815, // parked at the block
  doorsA: 0.815, // container doors open
  installA: 0.83, // install sequence: facade floor by floor → sliding → door → windows → folding
  installB: 0.95, // then hold the finished block (completion ring) to the end
} as const;

/* ── World layout (x along the strip) ── */
export const X1 = 52; // Bulgarian quay crane (well away from the factory)
export const X2 = 132; // US quay crane
export const GATE_X = X2 + 16; // customs booth
export const SITE_X = 184;
export const LANE_Z = 6.25; // truck lane
export const QUAY_Z = 9; // quay edge
export const SHIP_Z = 13.5;

export const shipX = (p: number) => lerp(X1, X2, seg(p, P.sailA, P.sailB));
/** Bulgarian truck (rear x). */
export const truck1X = (p: number) => lerp(3.8, X1 - 2.2, seg(p, P.driveA, P.driveB));
/** US truck (rear x): crane → customs booth → through the gate → site, one continuous road. */
export function truck2X(p: number) {
  if (p < P.gateA) return X2 - 2.2;
  if (p < P.passA) return lerp(X2 - 2.2, GATE_X - 7.4, seg(p, P.gateA, P.gateB));
  return lerp(GATE_X - 7.4, SITE_X - 9, seg(p, P.passA, P.siteB));
}
/** "Customs cleared" stamp visibility (0–1). */
export const stampAt = (p: number) => seg(p, P.barrierA + 0.005, P.barrierB + 0.005) * (1 - seg(p, P.passA + 0.02, P.passA + 0.04));

export interface Shot {
  x: number;
  y: number;
  z: number;
  zoom: number;
  /** camera azimuth from +z toward +x (rad) */
  az: number;
  /** camera elevation (rad) */
  el: number;
}

const DEG = Math.PI / 180;
const ISO_AZ = 45 * DEG;
const ISO_EL = Math.atan2(8, Math.hypot(10, 10)); // the site's standard iso angle
// factory: close 3/4 front at the doors → low side angle at the container → wide high angle with the truck
const S_F0: Shot = { x: -3.6, y: 1.8, z: 3.5, zoom: 1.45, az: 24 * DEG, el: 18 * DEG };
const S_F1: Shot = { x: 3.6, y: 2, z: LANE_Z, zoom: 1.3, az: -36 * DEG, el: 15 * DEG };
const S_F2: Shot = { x: 0, y: 2.4, z: 4, zoom: 0.8, az: 40 * DEG, el: 42 * DEG };
const S_QUAY1: Shot = { x: X1, y: 4.6, z: 8, zoom: 0.72, az: ISO_AZ, el: ISO_EL };
const S_SAIL: Shot = { x: 0, y: 3.6, z: 11, zoom: 0.8, az: ISO_AZ, el: ISO_EL };
const S_QUAY2: Shot = { x: X2, y: 4.6, z: 8, zoom: 0.72, az: ISO_AZ, el: ISO_EL };
const GATE_LEAD = 4; // camera sits this far ahead of the truck at the gate
const S_GATE: Shot = { x: GATE_X - 5.2 + GATE_LEAD, y: 2.4, z: 4.5, zoom: 1.02, az: ISO_AZ, el: ISO_EL };
// the finished city block: wide iso shot, then a gentle push-in while everything installs
const S_BLOCK: Shot = { x: SITE_X - 7.5, y: 7, z: -2.5, zoom: 0.72, az: ISO_AZ, el: ISO_EL }; // y raised + zoom eased so the tower top stays in frame

const mix = (a: Shot, b: Shot, k: number): Shot => ({
  x: lerp(a.x, b.x, k),
  y: lerp(a.y, b.y, k),
  z: lerp(a.z, b.z, k),
  zoom: lerp(a.zoom, b.zoom, k),
  az: lerp(a.az, b.az, k),
  el: lerp(a.el, b.el, k),
});

/** Camera shot for a progress value: continuously follows the hero container. */
export function shotAt(p: number): Shot {
  if (p < 0.04) return S_F0;
  if (p < 0.11) return mix(S_F0, S_F1, seg(p, 0.04, 0.11));
  if (p < 0.17) return S_F1;
  if (p < P.sailA) {
    const follow = { ...S_F2, x: truck1X(p) + 2.2 };
    return mix(mix(S_F1, follow, seg(p, 0.17, 0.25)), S_QUAY1, seg(p, 0.33, P.liftA));
  }
  if (p < P.sailB) {
    const sail = { ...mix(S_QUAY1, S_SAIL, seg(p, P.sailA, P.sailA + 0.04)), x: shipX(p) };
    return mix(sail, S_QUAY2, seg(p, P.sailB - 0.035, P.sailB));
  }
  if (p < P.gateA) return S_QUAY2;
  if (p < P.passA) return mix(S_QUAY2, S_GATE, seg(p, P.gateA, P.gateB));
  // on the road: zoom out quickly (never push into the tower wall), glide to the block, then a gentle push-in
  const follow = { ...S_GATE, x: truck2X(p) + 2.2 + GATE_LEAD };
  const road = mix(follow, S_BLOCK, seg(p, P.passA, P.siteB));
  road.zoom = lerp(S_GATE.zoom, S_BLOCK.zoom, seg(p, P.passA, P.passA + 0.022));
  road.y = lerp(follow.y, S_BLOCK.y, seg(p, P.passA, P.passA + 0.03));
  if (p <= P.siteB) return road;
  const push = seg(p, P.siteB, MAX_TARGET);
  return { ...road, zoom: lerp(S_BLOCK.zoom, S_BLOCK.zoom * 1.05, push) };
}

/**
 * Where the scene settles for each caption step (the end of that step's action).
 * The section eases the scene toward these instead of scrubbing 1:1 with the scroll.
 */
export const STEP_SETTLE = [0.18, 0.38, 0.59, 0.75, 0.985];
