import * as THREE from "three";
import { Kit, rng, wheels, type Fill } from "./kit";

/* ── Hero container dimensions (= one ship container slot at SHIP_SCALE) ── */
export const SHIP_SCALE = 2;
export const CL = 4; // length (x)
export const CH = 2; // height
export const CD = 2.3; // depth (z)

/* ── Container ship ─────────────────────────────────────────── */
const hullShape = (L: number, B: number) => {
  const s = new THREE.Shape();
  s.moveTo(-L / 2 + 0.4, -B / 2);
  s.lineTo(L / 2 - 3.2, -B / 2);
  s.quadraticCurveTo(L / 2 - 0.8, -B / 2 + 0.3, L / 2, 0);
  s.quadraticCurveTo(L / 2 - 0.8, B / 2 - 0.3, L / 2 - 3.2, B / 2);
  s.lineTo(-L / 2 + 0.4, B / 2);
  s.quadraticCurveTo(-L / 2, B / 2, -L / 2, B / 2 - 0.4);
  s.lineTo(-L / 2, -B / 2 + 0.4);
  s.quadraticCurveTo(-L / 2, -B / 2, -L / 2 + 0.4, -B / 2);
  return s;
};

export interface ShipModel {
  group: THREE.Group;
  /** static V wake (small ships) */
  wake: THREE.LineSegments;
  /** local centre of the free top slot the hero container rides in */
  slot: THREE.Vector3;
}

/** Ship factory sharing hull geometry; unscaled hull is 17 long, 4 wide, deck at y 2. */
export function shipMaker(kit: Kit) {
  const part = (h: number) => {
    const geo = kit.track(new THREE.ExtrudeGeometry(hullShape(17, 4), { depth: h, bevelEnabled: false, curveSegments: 6 }));
    geo.rotateX(-Math.PI / 2); // extrude along +y; shape y → world −z
    return { geo, edges: kit.track(new THREE.EdgesGeometry(geo, 20)) };
  };
  const low = part(0.9);
  const high = part(1.1);
  const wakeGeo = kit.track(new THREE.BufferGeometry());
  wakeGeo.setAttribute("position", new THREE.Float32BufferAttribute([-8.5, 0.12, -1.6, -13, 0.12, -3.2, -8.5, 0.12, 1.6, -13, 0.12, 3.2, 8.6, 0.12, -0.8, 7, 0.12, -2.6, 8.6, 0.12, 0.8, 7, 0.12, 2.6], 3));
  const wakeMat = kit.track(new THREE.LineBasicMaterial({ color: 0x9fb0c6 }));

  return (seed: number, palette: Fill[], heroSlot = false): ShipModel => {
    const g = new THREE.Group();
    for (const [p, fill, y] of [[low, "dark", 0], [high, "white", 0.9]] as const) {
      const m = new THREE.Mesh(p.geo, kit.fills[fill]);
      m.add(new THREE.LineSegments(p.edges, kit.edge));
      m.position.y = y;
      g.add(m);
    }
    kit.box(g, 13.3, 0.08, 4.02, -8.1, 1.55, -2.01, "blue", null); // boot stripe
    kit.box(g, 2.4, 2.6, 3.4, -8, 2, -1.7, "white"); // bridge
    kit.box(g, 2.8, 0.5, 4.2, -8.2, 4.6, -2.1, "white");
    kit.box(g, 0.04, 0.3, 3.6, -5.39, 4.7, -1.8, "dark", null); // bridge windows
    kit.box(g, 0.7, 1.1, 0.8, -7.7, 5.1, -0.4, "grey"); // funnel
    kit.box(g, 0.7, 0.2, 0.8, -7.7, 6.2, -0.4, "blue", null);
    const r = rng(seed);
    for (let bay = 0; bay < 5; bay++) {
      const rows = bay === 4 ? 2 : 3;
      for (let row = 0; row < rows; row++) {
        const hero = heroSlot && bay === 2 && row === 2;
        const tiers = hero ? 1 : bay === 4 ? 1 : 1 + Math.round(r() * 1.2 + 0.3);
        for (let tier = 0; tier < tiers; tier++) {
          const fill = palette[Math.floor(r() * palette.length)];
          const z = -1.8 + (rows === 2 ? 0.6 : 0) + row * 1.2;
          kit.box(g, 2, 1, 1.15, -5.2 + bay * 2.1, 2 + tier, z, fill);
        }
      }
    }
    const wake = new THREE.LineSegments(wakeGeo, wakeMat);
    g.add(wake);
    return { group: g, wake, slot: new THREE.Vector3(0, 3.5, 1.175) };
  };
}

/* ── Truck (origin: rear, ground, centre line; drives toward +x) ── */
export const TRUCK_BED_X = 2.2; // container centre, local x
export const TRUCK_BED_Y = 1.1; // container floor
export function makeTruck(kit: Kit) {
  const g = new THREE.Group();
  kit.shadow(g, 3.2, 0, 8.4, 3.6);
  kit.box(g, 6.4, 0.4, 2.2, 0, 0.7, -1.1, "grey"); // chassis
  kit.box(g, 1.9, 2.4, 2.3, 4.5, 0.7, -1.15, "white"); // cab
  kit.box(g, 0.05, 0.9, 1.9, 6.39, 1.9, -0.95, "glass", kit.edgeSoft); // windscreen
  kit.box(g, 0.05, 0.7, 0.05, 4.4, 1.1, 1.05, "dark", null);
  wheels(kit, g, [0.4, 1.3, 5.2], 0.8, -1.1);
  return g;
}

/* ── Hero container: VALDA blue, decal, rear doors ── */
function decalTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    g.fillStyle = "#ffffff";
    g.font = '600 92px "Inter Tight", Inter, "Helvetica Neue", Arial, sans-serif';
    g.textBaseline = "middle";
    g.textAlign = "center";
    // manual tracking for a wide-set logotype
    const text = "VALDA";
    const track = 18;
    const widths = [...text].map((ch) => g.measureText(ch).width);
    let x = 256 - (widths.reduce((a, b) => a + b, 0) + track * (text.length - 1)) / 2;
    g.textAlign = "left";
    [...text].forEach((ch, i) => {
      g.fillText(ch, x, 66);
      x += widths[i] + track;
    });
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makeContainer(kit: Kit) {
  const g = new THREE.Group();
  kit.box(g, CL, CH, CD, -CL / 2, -CH / 2, -CD / 2, "blue");
  kit.box(g, 0.01, CH - 0.12, CD - 0.16, -CL / 2 - 0.015, -CH / 2 + 0.06, -CD / 2 + 0.08, "dark", null); // open interior (seen when the doors swing)
  for (let k = 1; k < 9; k++) {
    for (const z of [CD / 2, -CD / 2 - 0.03]) kit.box(g, 0.03, CH - 0.2, 0.03, -CL / 2 + k * (CL / 9), -CH / 2 + 0.1, z, "blue", kit.edgeSoft);
  }
  const tex = kit.track(decalTexture());
  const mat = kit.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  const geo = kit.track(new THREE.PlaneGeometry(2.6, 0.65));
  const front = new THREE.Mesh(geo, mat);
  front.position.set(0.1, 0.1, CD / 2 + 0.05);
  g.add(front);
  const back = new THREE.Mesh(geo, mat);
  back.position.set(-0.1, 0.1, -CD / 2 - 0.05);
  back.rotation.y = Math.PI;
  g.add(back);

  // rear doors, hinged at the corners of the −x end
  const right = new THREE.Group();
  right.position.set(-CL / 2, 0, CD / 2);
  kit.box(right, 0.08, CH - 0.08, CD / 2 - 0.02, -0.08, -CH / 2 + 0.04, -CD / 2 + 0.01, "blue");
  const left = new THREE.Group();
  left.position.set(-CL / 2, 0, -CD / 2);
  kit.box(left, 0.08, CH - 0.08, CD / 2 - 0.02, -0.08, -CH / 2 + 0.04, 0.01, "blue");
  g.add(right, left);
  return {
    group: g,
    /** 0 shut … 1 swung fully open */
    setDoors(open: number) {
      right.rotation.y = open * 1.9;
      left.rotation.y = -open * 1.9;
    },
  };
}

/* ── Ship-to-shore quay crane at world x = X (quay edge along z = 9) ── */
export const CRANE_TROLLEY_Y = 11.9;
export function makeCrane(kit: Kit, X: number) {
  const g = new THREE.Group();
  g.position.x = X;
  for (const z of [3.8, 8.5]) {
    for (const sx of [-1, 1]) {
      kit.box(g, 0.35, 12.4, 0.35, sx * 2.6 - 0.175, 0, z - 0.175, "white");
      kit.box(g, 0.9, 0.35, 0.7, sx * 2.6 - 0.45, 0, z - 0.35, "grey");
    }
    kit.box(g, 5.55, 0.45, 0.35, -2.775, 12, z - 0.175, "white");
    kit.box(g, 5.55, 0.25, 0.25, -2.775, 6.2, z - 0.125, "white");
  }
  for (const sx of [-1, 1]) {
    kit.box(g, 0.35, 0.55, 19, sx * 2.6 - 0.175, 12.45, 1.5, "white"); // girders / boom
    kit.box(g, 0.28, 3.4, 0.28, sx * 2.6 - 0.14, 13, 3.66, "white"); // A-frame
  }
  kit.box(g, 5.55, 0.3, 0.3, -2.775, 16.4, 3.65, "white");
  kit.box(g, 5.6, 1.5, 2.4, -2.8, 13, 1.1, "white"); // machinery house
  kit.shadow(g, 0, 6.2, 8, 7);

  const trolley = new THREE.Group();
  trolley.position.y = CRANE_TROLLEY_Y;
  kit.box(trolley, 5.9, 0.55, 1.6, -2.95, 0, -0.8, "grey");
  g.add(trolley);
  const cable = new THREE.Group();
  kit.box(cable, 0.05, 1, 0.05, -1.4, -1, -0.025, "dark", null);
  kit.box(cable, 0.05, 1, 0.05, 1.35, -1, -0.025, "dark", null);
  trolley.add(cable);
  const spreader = new THREE.Group();
  kit.box(spreader, 4.3, 0.28, 2.45, -2.15, 0, -1.225, "grey");
  g.add(spreader);

  return {
    group: g,
    /** trolley at world z, spreader bottom at world y (= container top), small x offset */
    setHook(z: number, yBottom: number, dx = 0) {
      trolley.position.z = z;
      spreader.position.set(dx, yBottom, z);
      cable.scale.y = Math.max(0.01, CRANE_TROLLEY_Y - (yBottom + 0.28));
    },
  };
}
