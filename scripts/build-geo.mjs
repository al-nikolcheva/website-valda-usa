// Builds the map data for /build from us-atlas (pre-projected Albers USA, 975 × 610).
//   node scripts/build-geo.mjs
// Writes public/geo/states.json (every state) and public/geo/counties/<fips>.json (one
// file per state, loaded only when a visitor zooms into that state).
//
// Shape: { id, name, polys: number[][][] } where each poly is [outer, ...holes] and each
// ring is a flat [x0, y0, x1, y1, ...] array rounded to 0.1 map units.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const read = (f) => JSON.parse(readFileSync(new URL(`../node_modules/us-atlas/${f}`, import.meta.url)));
const out = new URL("../public/geo/", import.meta.url);
mkdirSync(new URL("counties/", out), { recursive: true });

const r = (n) => Math.round(n * 10) / 10;
function flat(ring) {
  const pts = [];
  let px, py;
  for (const [x, y] of ring) {
    const fx = r(x), fy = r(y);
    if (fx === px && fy === py) continue; // drop points that collapse after rounding
    pts.push(fx, fy);
    px = fx; py = fy;
  }
  return pts;
}
function polys(geom) {
  if (!geom) return [];
  const list = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
  return list.map((p) => p.map(flat).filter((ring) => ring.length >= 6)).filter((p) => p.length);
}

const states = read("states-albers-10m.json");
const stateList = feature(states, states.objects.states).features
  .map((f) => ({ id: String(f.id), name: f.properties.name, polys: polys(f.geometry) }))
  .filter((s) => s.polys.length);
writeFileSync(new URL("states.json", out), JSON.stringify(stateList));

const counties = read("counties-albers-10m.json");
const byState = new Map();
for (const f of feature(counties, counties.objects.counties).features) {
  const id = String(f.id);
  const st = id.slice(0, 2);
  const p = polys(f.geometry);
  if (!p.length) continue;
  if (!byState.has(st)) byState.set(st, []);
  byState.get(st).push({ id, name: f.properties.name, polys: p });
}
for (const [st, list] of byState) {
  list.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(new URL(`counties/${st}.json`, out), JSON.stringify(list));
}
console.log(`states: ${stateList.length}, county files: ${byState.size}`);
