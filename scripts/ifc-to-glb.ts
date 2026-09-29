// Convert a simple faceted-brep IFC (IfcOpenShell export) to a GLB for <model-viewer>.
// Handles IFCFACETEDBREP → IFCCLOSEDSHELL → IFCFACE → IFCFACEOUTERBOUND → IFCPOLYLOOP,
// colours each element by its IFCMATERIAL. Usage:
//   bun scripts/ifc-to-glb.ts <in.ifc> <out.glb> [--skip=IFCWINDOW]
import { readFileSync, writeFileSync } from "fs";

const [, , input, output, ...flags] = process.argv;
const skip = new Set((flags.find((f) => f.startsWith("--skip="))?.slice(7) ?? "").split(",").filter(Boolean));
const src = readFileSync(input, "utf8");

// #id=TYPE(args);
const ents = new Map<number, { type: string; args: string }>();
for (const m of src.matchAll(/^#(\d+)=([A-Z0-9]+)\((.*)\);\s*$/gm)) ents.set(+m[1], { type: m[2], args: m[3] });
const refs = (s: string) => [...s.matchAll(/#(\d+)/g)].map((m) => +m[1]);
const nums = (s: string) => [...s.matchAll(/-?\d+(?:\.\d*)?(?:E[-+]?\d+)?/gi)].map((m) => +m[0]);

// Material per element.
const matOf = new Map<number, string>();
for (const e of ents.values()) {
  if (e.type !== "IFCRELASSOCIATESMATERIAL") continue;
  const r = refs(e.args);
  const mat = ents.get(r[r.length - 1]);
  const name = mat?.args.match(/^'([^']*)'/)?.[1] ?? "";
  for (const id of r.slice(0, -1)) matOf.set(id, name);
}

const STYLE: Record<string, { color: [number, number, number, number]; metal: number; rough: number }> = {
  "Powder coated aluminium": { color: [0.2, 0.21, 0.22, 1], metal: 0.35, rough: 0.45 },
  Polyamide: { color: [0.06, 0.06, 0.06, 1], metal: 0, rough: 0.8 },
  "Insulating glass": { color: [0.62, 0.74, 0.8, 0.28], metal: 0, rough: 0.05 },
  EPDM: { color: [0.03, 0.03, 0.03, 1], metal: 0, rough: 0.9 },
};

// Collect triangles (flat shaded) per material. IFC Z-up mm → glTF Y-up metres.
const buckets = new Map<string, number[]>();
const toGl = (p: number[]) => [p[0] / 1000, p[2] / 1000, -p[1] / 1000];
const point = (id: number) => toGl(nums(ents.get(id)!.args));

for (const [id, e] of ents) {
  if (!matOf.has(id) && e.type !== "IFCWINDOW") continue;
  if (skip.has(e.type)) continue;
  const shapeRefs = refs(e.args);
  const pds = ents.get(shapeRefs[shapeRefs.length - 1]); // IFCPRODUCTDEFINITIONSHAPE
  if (pds?.type !== "IFCPRODUCTDEFINITIONSHAPE") continue;
  const name = e.args.match(/^'[^']*',\$,'([^']*)'/)?.[1];
  const mat = matOf.get(id) ?? "Powder coated aluminium";
  const tris = buckets.get(mat) ?? [];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const rep of refs(pds.args)) for (const item of refs(ents.get(rep)!.args).slice(1)) {
    const brep = ents.get(item);
    if (brep?.type !== "IFCFACETEDBREP") continue;
    for (const face of refs(ents.get(refs(brep.args)[0])!.args)) {
      for (const bound of refs(ents.get(face)!.args)) {
        const loop = ents.get(refs(ents.get(bound)!.args)[0])!;
        const pts = refs(loop.args).map(point);
        for (const p of pts) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], p[k]); max[k] = Math.max(max[k], p[k]); }
        for (let i = 1; i < pts.length - 1; i++) tris.push(...pts[0], ...pts[i], ...pts[i + 1]);
      }
    }
  }
  buckets.set(mat, tris);
  console.log(e.type.padEnd(26), (name ?? "").padEnd(48), mat.padEnd(24), min.map((v) => v.toFixed(3)).join(","), "→", max.map((v) => v.toFixed(3)).join(","));
}

// Centre on the origin.
const all = [...buckets.values()].flat();
const c = [0, 1, 2].map((k) => {
  let lo = Infinity, hi = -Infinity;
  for (let i = k; i < all.length; i += 3) { lo = Math.min(lo, all[i]); hi = Math.max(hi, all[i]); }
  return (lo + hi) / 2;
});
c[1] = Math.min(...all.filter((_, i) => i % 3 === 1)); // sit on the floor

// Build GLB.
const bin: Buffer[] = [];
let off = 0;
const views: object[] = [], accessors: object[] = [], materials: object[] = [], primitives: object[] = [];
for (const [mat, tris] of buckets) {
  const n = tris.length / 3;
  const pos = new Float32Array(tris.length), nor = new Float32Array(tris.length);
  for (let i = 0; i < tris.length; i++) pos[i] = tris[i] - c[i % 3];
  for (let t = 0; t < n; t += 3) {
    const a = t * 3, u = [0, 1, 2].map((k) => pos[a + 3 + k] - pos[a + k]), v = [0, 1, 2].map((k) => pos[a + 6 + k] - pos[a + k]);
    const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0];
    const l = Math.hypot(nx, ny, nz) || 1;
    for (let j = 0; j < 3; j++) nor.set([nx / l, ny / l, nz / l], a + j * 3);
  }
  const lo = [0, 1, 2].map((k) => Math.min(...pos.filter((_, i) => i % 3 === k)));
  const hi = [0, 1, 2].map((k) => Math.max(...pos.filter((_, i) => i % 3 === k)));
  for (const [arr, extra] of [[pos, { min: lo, max: hi }], [nor, {}]] as const) {
    const buf = Buffer.from(arr.buffer);
    views.push({ buffer: 0, byteOffset: off, byteLength: buf.length, target: 34962 });
    accessors.push({ bufferView: views.length - 1, componentType: 5126, count: n, type: "VEC3", ...extra });
    bin.push(buf);
    off += buf.length;
  }
  const s = STYLE[mat] ?? STYLE["Powder coated aluminium"];
  materials.push({
    name: mat,
    pbrMetallicRoughness: { baseColorFactor: s.color, metallicFactor: s.metal, roughnessFactor: s.rough },
    ...(s.color[3] < 1 ? { alphaMode: "BLEND", doubleSided: true } : {}),
  });
  primitives.push({ attributes: { POSITION: accessors.length - 2, NORMAL: accessors.length - 1 }, material: materials.length - 1 });
}

const binBuf = Buffer.concat(bin);
const gltf = {
  asset: { version: "2.0", generator: "valda ifc-to-glb" },
  scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: "window" }],
  meshes: [{ primitives }], materials, accessors, bufferViews: views,
  buffers: [{ byteLength: binBuf.length }],
};
const pad = (b: Buffer, fill: number) => Buffer.concat([b, Buffer.alloc((4 - (b.length % 4)) % 4, fill)]);
const json = pad(Buffer.from(JSON.stringify(gltf)), 0x20), data = pad(binBuf, 0);
const header = Buffer.alloc(12), jh = Buffer.alloc(8), bh = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + json.length + 8 + data.length, 8);
jh.writeUInt32LE(json.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
bh.writeUInt32LE(data.length, 0); bh.writeUInt32LE(0x004e4942, 4);
writeFileSync(output, Buffer.concat([header, jh, json, bh, data]));
console.log(`wrote ${output} (${(12 + 16 + json.length + data.length) / 1024 | 0} KB)`);
