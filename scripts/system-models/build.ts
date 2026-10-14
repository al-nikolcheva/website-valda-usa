// Generate a GLB for every system into public/models/<slug>.glb.
//   bun scripts/system-models/build.ts            all systems
//   bun scripts/system-models/build.ts cs-77 …    only the listed slugs
// Models are built in mm (x across, y up, z exterior → interior) and written in
// metres, centred on x/z and standing on y = 0, with the interior facing +z.
// Material names are stable so the viewer can recolour them (e.g. RAL finishes).
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { Model, type Mat } from "./geometry";
import { SYSTEMS } from "./catalog";
import type { Material } from "./sections";

const OUT = fileURLToPath(new URL("../../public/models", import.meta.url));

type Style = { name: string; hex: string; metal: number; rough: number; alpha?: number };
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rgba = (hex: string, a = 1) => [1, 3, 5].map((i) => +lin(parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(4)).concat(a);

// Default finishes: RAL 7016 anthracite for aluminium, RAL 9016 white for PVC.
function styles(material: Material): Record<Mat, Style> {
  const alu = material === "alu";
  const body = alu ? { hex: "#373F43", metal: 0.15, rough: 0.5 } : { hex: "#F1F0EA", metal: 0, rough: 0.45 };
  return {
    ext: { name: alu ? "Aluminium exterior" : "PVC", ...body },
    int: { name: alu ? "Aluminium interior" : "PVC", ...body },
    polyamide: { name: "Polyamide", hex: "#1D1E20", metal: 0, rough: 0.8 },
    foam: { name: "Insulating foam", hex: "#D9D4C7", metal: 0, rough: 1 },
    steel: { name: "Steel reinforcement", hex: "#8B8F95", metal: 0.6, rough: 0.45 },
    gasket: { name: "EPDM", hex: "#0E0E0F", metal: 0, rough: 0.9 },
    spacer: { name: "Spacer", hex: "#8B8F95", metal: 0.4, rough: 0.5 },
    glass: { name: "Glass", hex: "#BCD3E6", metal: 0, rough: 0.05, alpha: 0.3 },
    hardware: { name: "Hardware", hex: alu ? "#A9ACB0" : "#C9CBCD", metal: 0.7, rough: 0.35 },
  };
}

function writeGlb(model: Model, material: Material, file: string, name: string) {
  const st = styles(material);
  // merge buckets that share a material name (PVC ext/int)
  const groups = new Map<string, { style: Style; tris: number[] }>();
  for (const [mat, tris] of model.tris) {
    const s = st[mat];
    const g = groups.get(s.name) ?? { style: s, tris: [] };
    for (let i = 0; i < tris.length; i++) g.tris.push(tris[i]);
    groups.set(s.name, g);
  }
  // bounds → centre x/z, floor on y
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const g of groups.values())
    for (let i = 0; i < g.tris.length; i++) {
      const k = i % 3;
      if (g.tris[i] < lo[k]) lo[k] = g.tris[i];
      if (g.tris[i] > hi[k]) hi[k] = g.tris[i];
    }
  const c = [(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2];

  const bin: Buffer[] = [];
  let off = 0;
  const views: object[] = [], accessors: object[] = [], materials: object[] = [], primitives: object[] = [];
  for (const { style: s, tris } of groups.values()) {
    const n = tris.length / 3;
    const pos = new Float32Array(tris.length), nor = new Float32Array(tris.length);
    for (let i = 0; i < tris.length; i++) pos[i] = (tris[i] - c[i % 3]) / 1000;
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pos.length; i++) {
      mn[i % 3] = Math.min(mn[i % 3], pos[i]);
      mx[i % 3] = Math.max(mx[i % 3], pos[i]);
    }
    for (let t = 0; t < n; t += 3) {
      const a = t * 3;
      const u = [0, 1, 2].map((k) => pos[a + 3 + k] - pos[a + k]), v = [0, 1, 2].map((k) => pos[a + 6 + k] - pos[a + k]);
      const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0];
      const l = Math.hypot(nx, ny, nz) || 1;
      for (let j = 0; j < 3; j++) nor.set([nx / l, ny / l, nz / l], a + j * 3);
    }
    for (const [arr, extra] of [[pos, { min: mn, max: mx }], [nor, {}]] as const) {
      const buf = Buffer.from(arr.buffer);
      views.push({ buffer: 0, byteOffset: off, byteLength: buf.length, target: 34962 });
      accessors.push({ bufferView: views.length - 1, componentType: 5126, count: n, type: "VEC3", ...extra });
      bin.push(buf);
      off += buf.length;
    }
    materials.push({
      name: s.name,
      pbrMetallicRoughness: { baseColorFactor: rgba(s.hex, s.alpha), metallicFactor: s.metal, roughnessFactor: s.rough },
      ...(s.alpha ? { alphaMode: "BLEND", doubleSided: true } : {}),
    });
    primitives.push({ attributes: { POSITION: accessors.length - 2, NORMAL: accessors.length - 1 }, material: materials.length - 1 });
  }

  const binBuf = Buffer.concat(bin);
  const gltf = {
    asset: { version: "2.0", generator: "valda system-models" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [{ name, primitives }],
    materials,
    accessors,
    bufferViews: views,
    buffers: [{ byteLength: binBuf.length }],
  };
  const pad = (b: Buffer, fill: number) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4, fill)]);
  const json = pad(Buffer.from(JSON.stringify(gltf)), 0x20), data = pad(binBuf, 0);
  const header = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + data.length, 8);
  jh.writeUInt32LE(json.length, 0);
  jh.writeUInt32LE(0x4e4f534a, 4);
  bh.writeUInt32LE(data.length, 0);
  bh.writeUInt32LE(0x004e4942, 4);
  writeFileSync(file, Buffer.concat([header, jh, json, bh, data]));
  return { kb: Math.round((28 + json.length + data.length) / 1024), size: [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]].map(Math.round) };
}

mkdirSync(OUT, { recursive: true });
const only = new Set(process.argv.slice(2));
for (const s of SYSTEMS) {
  if (only.size && !only.has(s.slug)) continue;
  const m = new Model();
  s.build(m);
  const r = writeGlb(m, s.material, join(OUT, `${s.slug}.glb`), s.name);
  console.log(`${s.slug.padEnd(26)} ${String(r.kb).padStart(5)} KB  ${r.size.join(" × ")} mm${s.confirm ? `  (confirm: ${s.confirm})` : ""}`);
}
