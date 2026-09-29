import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Fill, Kit } from "@/components/ship/journey/kit";

/**
 * Collects static boxes / shapes and merges them into one mesh per fill + one line set per edge style,
 * so a whole factory of racks, walls and crates costs a handful of draw calls.
 */
export class Batch {
  private solids = new Map<THREE.Material, THREE.BufferGeometry[]>();
  private lines = new Map<THREE.LineBasicMaterial, THREE.BufferGeometry[]>();
  private m = new THREE.Matrix4();

  constructor(private kit: Kit) {}

  /** Box with min corner (x, y, z). */
  box(w: number, h: number, d: number, x: number, y: number, z: number, fill: Fill | THREE.Material = "white", line: THREE.LineBasicMaterial | null = this.kit.edge) {
    this.m.makeTranslation(x + w / 2, y + h / 2, z + d / 2);
    this.geo(new THREE.BoxGeometry(w, h, d), this.m, fill, line);
  }

  /** Any geometry, placed by a matrix (geometry is consumed). */
  geo(g: THREE.BufferGeometry, matrix: THREE.Matrix4, fill: Fill | THREE.Material, line: THREE.LineBasicMaterial | null = this.kit.edge) {
    if (line) {
      const e = new THREE.EdgesGeometry(g, 20);
      e.applyMatrix4(matrix);
      const list = this.lines.get(line) ?? [];
      list.push(e);
      this.lines.set(line, list);
    }
    g.applyMatrix4(matrix);
    // keep attribute sets identical for merging
    for (const name of Object.keys(g.attributes)) if (name !== "position" && name !== "normal" && name !== "uv") g.deleteAttribute(name);
    const flat = g.index ? g.toNonIndexed() : g;
    if (flat !== g) g.dispose();
    const mat = typeof fill === "string" ? this.kit.fills[fill] : fill;
    const list = this.solids.get(mat) ?? [];
    list.push(flat);
    this.solids.set(mat, list);
  }

  build(parent: THREE.Object3D) {
    for (const [mat, list] of this.solids) {
      const merged = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      if (!merged) continue;
      this.kit.track(merged);
      parent.add(new THREE.Mesh(merged, mat));
    }
    for (const [mat, list] of this.lines) {
      const merged = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      if (!merged) continue;
      this.kit.track(merged);
      parent.add(new THREE.LineSegments(merged, mat));
    }
    this.solids.clear();
    this.lines.clear();
  }
}
