import * as THREE from "three";
import { BLUE, Kit, wallWithOpenings, type Fill } from "./kit";

/* A small city block with EMPTY openings for the whole VALDA range; every product installs at once.
   Coordinates are local to the site group (buildings face +z, the road runs along z ≈ 6). */

const easeOutBack = (x: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Part = { mesh: THREE.Mesh; line: THREE.LineSegments | null; settled: THREE.Material; settledLine: THREE.LineBasicMaterial | null };
interface Piece {
  group: THREE.Group;
  to: THREE.Vector3;
  from: THREE.Vector3;
  /** folding panels: start rotation about y */
  spin: number;
  /** [start, duration] within the install (0–1) */
  when: readonly [number, number];
  parts: Part[];
  moving: boolean | null;
}

export function buildCity(kit: Kit, parent: THREE.Object3D) {
  const root = new THREE.Group();
  parent.add(root);
  const pieces: Piece[] = [];

  /** a product piece: built in its own group (origin = min corner), flies from `off` into place */
  const piece = (x: number, y: number, z: number, off: [number, number, number], when: readonly [number, number], build: (add: (w: number, h: number, d: number, px: number, py: number, pz: number, kind: "frame" | "glass" | "leaf") => void) => void, spin = 0) => {
    const g = new THREE.Group();
    root.add(g);
    const parts: Part[] = [];
    build((w, h, d, px, py, pz, kind) => {
      const fill: Fill = kind === "glass" ? "blueGlass" : "white";
      const line = kind === "glass" ? kit.edgeSoft : kit.edge;
      const mesh = kit.box(g, w, h, d, px, py, pz, fill, line);
      parts.push({ mesh, line: (mesh.children[0] as THREE.LineSegments) ?? null, settled: kit.fills[fill], settledLine: line });
    });
    const to = new THREE.Vector3(x, y, z);
    pieces.push({ group: g, to, from: to.clone().add(new THREE.Vector3(...off)), spin, when, parts, moving: null });
  };

  /** window: frame + glass + mullion */
  const windowPiece = (x: number, y: number, z: number, W: number, H: number, off: [number, number, number], when: readonly [number, number]) =>
    piece(x, y, z, off, when, (add) => {
      const f = 0.1;
      add(W, f, 0.16, 0, 0, 0, "frame");
      add(W, f, 0.16, 0, H - f, 0, "frame");
      add(f, H - 2 * f, 0.16, 0, f, 0, "frame");
      add(f, H - 2 * f, 0.16, W - f, f, 0, "frame");
      add(W - 2 * f, H - 2 * f, 0.03, f, f, 0.07, "glass");
    });

  /* ── Tower: 7 storeys, empty curtain-wall grid → FACADE ── */
  const TX = -23;
  const TW = 8.4;
  const TZ0 = -11;
  const TZ1 = -3.4;
  const N = 7;
  const SH = 2.4;
  const BAYS = 4;
  const BW = TW / BAYS;
  kit.shadow(root, TX + TW / 2 + 0.8, (TZ0 + TZ1) / 2 + 0.8, TW * 1.5, 10);
  for (let i = 0; i <= N; i++) kit.box(root, TW + 0.2, 0.3, TZ1 - TZ0 + 0.2, TX - 0.1, i * SH, TZ0 - 0.1, "light");
  kit.box(root, TW, N * SH, 0.3, TX, 0, TZ0, "white");
  kit.box(root, 0.3, N * SH, TZ1 - TZ0, TX, 0, TZ0, "white");
  kit.box(root, 0.3, N * SH, TZ1 - TZ0, TX + TW - 0.3, 0, TZ0, "white");
  for (let j = 1; j < BAYS; j++) kit.box(root, 0.18, N * SH, 0.3, TX + j * BW - 0.09, 0.3, TZ1 - 0.3, "white"); // grid columns
  kit.box(root, 2.6, 1.2, 2.2, TX + 1.2, N * SH + 0.3, TZ0 + 1.5, "white"); // rooftop plant
  // side elevation detail (so the tall flank never reads as a blank white slab)
  for (let i = 0; i < N; i++) {
    kit.box(root, 0.06, 0.16, TZ1 - TZ0, TX + TW, i * SH + 0.2, TZ0, "light", kit.edgeSoft);
    for (const z of [TZ0 + 1.3, TZ0 + 4.3]) kit.box(root, 0.05, SH * 0.52, 1.6, TX + TW, i * SH + 0.75, z, "glass", kit.edgeSoft);
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < BAYS; j++) {
      const x = TX + j * BW + (j === 0 ? 0.32 : 0.1);
      const w = BW - (j === 0 || j === BAYS - 1 ? 0.42 : 0.2);
      const y = i * SH + 0.34;
      const h = SH - 0.38;
      // 1) facade: floor by floor, bottom → top
      piece(x, y, TZ1 - 0.22, [0, 3.2, 2.2], [i * 0.055 + j * 0.008, 0.16], (add) => {
        add(w, 0.08, 0.14, 0, 0, 0, "frame");
        add(w, 0.08, 0.14, 0, h - 0.08, 0, "frame");
        add(0.08, h - 0.16, 0.14, 0, 0.08, 0, "frame");
        add(0.08, h - 0.16, 0.14, w - 0.08, 0.08, 0, "frame");
        add(w - 0.16, 0.06, 0.1, 0.08, h * 0.32, 0.02, "frame"); // transom
        add(w - 0.16, h - 0.16, 0.03, 0.08, 0.08, 0.06, "glass");
      });
    }
  }

  /* ── House: entry door, lift & slide opening, windows ── */
  const HX = -12;
  const HW = 10;
  const HZ0 = -10;
  const HZ1 = -3.4;
  const HS = 3;
  kit.shadow(root, HX + HW / 2 + 0.8, (HZ0 + HZ1) / 2 + 0.8, HW * 1.4, 9);
  for (const y of [0, HS]) kit.box(root, HW + 0.2, 0.3, HZ1 - HZ0 + 0.2, HX - 0.1, y, HZ0 - 0.1, "light");
  kit.box(root, HW + 0.8, 0.3, HZ1 - HZ0 + 1, HX - 0.4, 2 * HS, HZ0 - 0.4, "light"); // roof with overhang
  kit.box(root, HW, 2 * HS - 0.3, 0.3, HX, 0.3, HZ0, "white");
  kit.box(root, 0.3, 2 * HS - 0.3, HZ1 - HZ0 - 0.3, HX, 0.3, HZ0 + 0.3, "white");
  kit.box(root, 0.3, 2 * HS - 0.3, HZ1 - HZ0 - 0.3, HX + HW - 0.3, 0.3, HZ0 + 0.3, "white");
  const FZ = HZ1 - 0.3;
  const door = { x: 0.8, w: 1.1, y: 0, h: 2.3 };
  const slide = { x: 2.9, w: 5.8, y: 0, h: 2.4 };
  const winsUp = [0.8, 4.2, 7.4].map((x) => ({ x, w: 1.7, y: 0.8, h: 1.4 }));
  wallWithOpenings(kit, root, HW, HS - 0.3, 0.3, HX, 0.3, FZ, [door, slide]);
  wallWithOpenings(kit, root, HW, HS - 0.3, 0.3, HX, HS + 0.3, FZ, winsUp);
  // 3) entry door: swings in on its hinge
  piece(HX + door.x + 0.04, 0.3, FZ + 0.05, [0, 0, 1.2], [0.5, 0.18], (add) => {
    const W = door.w - 0.08;
    const H = door.h - 0.04;
    add(0.08, H, 0.2, 0, 0, 0, "frame");
    add(0.08, H, 0.2, W - 0.08, 0, 0, "frame");
    add(W, 0.08, 0.2, 0, H - 0.08, 0, "frame");
    add(W - 0.16, H - 0.1, 0.07, 0.08, 0, 0.06, "leaf");
    add(0.16, H - 0.6, 0.02, W - 0.4, 0.3, 0.14, "glass");
  }, -1.5);
  // 2) lift & slide: two big panels glide along their track from either side
  const sw = (slide.w - 0.1) / 2 + 0.1;
  for (const [k, off] of [[0, -4], [1, 4]] as const) {
    piece(HX + slide.x + 0.05 + k * (sw - 0.1), 0.3, FZ + 0.04 + k * 0.1, [off, 0, 0.6], [0.38 + k * 0.06, 0.2], (add) => {
      const H = slide.h - 0.06;
      add(sw, 0.1, 0.14, 0, 0, 0, "frame");
      add(sw, 0.1, 0.14, 0, H - 0.1, 0, "frame");
      add(0.1, H - 0.2, 0.14, 0, 0.1, 0, "frame");
      add(0.1, H - 0.2, 0.14, sw - 0.1, 0.1, 0, "frame");
      add(sw - 0.2, H - 0.2, 0.03, 0.1, 0.1, 0.06, "glass");
    });
  }
  // 4) windows, one after another
  winsUp.forEach((o, n) => windowPiece(HX + o.x + 0.05, HS + 0.3 + o.y + 0.05, FZ + 0.06, o.w - 0.1, o.h - 0.1, [0, 0.8, 2.6], [0.58 + n * 0.05, 0.18]));

  /* ── Pavilion: wide terrace opening → folding / sliding system ── */
  const PX = 0.5;
  const PW = 8;
  const PZ0 = -8.5;
  const PZ1 = -3.4;
  const PS = 3;
  kit.shadow(root, PX + PW / 2 + 0.8, (PZ0 + PZ1) / 2 + 0.8, PW * 1.4, 7);
  kit.box(root, PW + 0.2, 0.3, PZ1 - PZ0 + 0.2, PX - 0.1, 0, PZ0 - 0.1, "light");
  kit.box(root, PW + 1.4, 0.25, PZ1 - PZ0 + 1.6, PX - 0.7, PS, PZ0 - 0.4, "light"); // deep flat roof
  kit.box(root, PW, PS - 0.3, 0.3, PX, 0.3, PZ0, "white");
  kit.box(root, 0.3, PS - 0.3, PZ1 - PZ0 - 0.3, PX, 0.3, PZ0 + 0.3, "white");
  kit.box(root, 0.3, PS - 0.3, PZ1 - PZ0 - 0.3, PX + PW - 0.3, 0.3, PZ0 + 0.3, "white");
  const open = { x: 0.4, w: PW - 0.8, h: 2.5 };
  wallWithOpenings(kit, root, PW, PS - 0.3, 0.3, PX, 0.3, PZ1 - 0.3, [{ x: open.x, w: open.w, y: 0, h: open.h }]);
  // deck in front
  kit.box(root, PW - 0.6, 0.12, 1.6, PX + 0.3, 0, PZ1, "light", kit.edgeSoft);
  const FOLD = 6;
  const fw = open.w / FOLD;
  for (let n = 0; n < FOLD; n++) {
    // 5) folding panels unfold across the opening from a stack at the right end
    const dx = open.w - (n + 1) * fw;
    piece(PX + open.x + n * fw, 0.3, PZ1 - 0.26, [dx, 0, 0.8 + 0.08 * n], [0.7 + n * 0.012, 0.22], (add) => {
      const H = open.h - 0.04;
      add(fw, 0.08, 0.12, 0, 0, 0, "frame");
      add(fw, 0.08, 0.12, 0, H - 0.08, 0, "frame");
      add(0.08, H - 0.16, 0.12, 0, 0.08, 0, "frame");
      add(0.08, H - 0.16, 0.12, fw - 0.08, 0.08, 0, "frame");
      add(fw - 0.16, H - 0.16, 0.03, 0.08, 0.08, 0.05, "glass");
    }, (n % 2 ? -1 : 1) * 1.2);
  }

  /* ── Road + kerb ── */
  kit.box(root, 60, 0.03, 2.9, -40, 0, 4.8, "light", kit.edgeSoft);
  for (let x = -38; x < 18; x += 3) kit.box(root, 1.2, 0.035, 0.12, x, 0.01, 6.19, "white", null);
  // street trees (simple)
  for (const x of [-13.2, -0.4, 10]) {
    kit.box(root, 0.14, 1.3, 0.14, x, 0, 3.4, "grey");
    kit.box(root, 1, 1, 1, x - 0.43, 1.3, 2.97, "white");
  }

  /* ── Completion pulse ring ── */
  const ringMat = kit.track(new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  const ring = new THREE.Mesh(kit.track(new THREE.RingGeometry(0.96, 1, 96)), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(-7, 0.05, -5);
  root.add(ring);

  const rot = new THREE.Euler();
  return {
    root,
    /**
     * u: 0–1 install progress (scroll); ring: 0–1 completion sweep; t seconds;
     * life = animate (reduced motion: each piece simply appears seated at its turn)
     */
    update(u: number, ringK: number, t: number, life: boolean) {
      for (const pc of pieces) {
        const [start, dur] = pc.when;
        const k = life ? clamp01((u - start) / dur) : u > start ? 1 : 0;
        const e = easeOutBack(k);
        pc.group.position.lerpVectors(pc.from, pc.to, e);
        pc.group.visible = k > 0;
        rot.set(0, pc.spin * (1 - Math.min(1, e)), 0);
        pc.group.rotation.copy(rot);
        const moving = k > 0 && k < 1;
        if (moving !== pc.moving) {
          pc.moving = moving;
          for (const part of pc.parts) {
            part.mesh.material = moving ? kit.fills.blue : part.settled;
            if (part.line) part.line.material = moving ? kit.edgeBlue : (part.settledLine ?? kit.edge);
          }
        }
      }
      // one soft ring when everything has landed (and a slow idle pulse after)
      const done = clamp01(ringK);
      const ph = life && ringK >= 1 ? (t * 0.3) % 1 : done;
      const s = 14 + 16 * ph;
      ring.scale.setScalar(s);
      ringMat.opacity = ringK > 0 ? 0.45 * Math.sin(Math.PI * ph) : 0;
    },
  };
}
