import * as THREE from "three";
import { Kit, rng, type Fill } from "./kit";
import { buildCity } from "./city";
import { makeFlag } from "./flags";
import { CH, makeContainer, makeCrane, makeTruck, shipMaker, SHIP_SCALE, TRUCK_BED_X, TRUCK_BED_Y } from "./models";

import { clamp01, GATE_X, LANE_Z, lerp, P, QUAY_Z, seg, shipX, SHIP_Z, SITE_X, truck1X, truck2X, X1, X2 } from "./timeline";

const SHIP_Y = -0.8;
const HOOK_REST = 9.5; // spreader height when the crane is idle
const LIFT_H = 10.2; // container centre height while it swings across

export interface JourneyBuild {
  scene: THREE.Scene;
  /** apply scroll progress p (0–1); t = seconds; life = idle animation allowed */
  update: (p: number, t: number, life: boolean) => void;
  /** where the "Customs cleared" stamp hangs */
  stampAnchor: THREE.Object3D;
  dispose: () => void;
}

/** Eased crane move: hoist up, travel across, lower down. */
function liftPath(out: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: number) {
  const up = seg(c, 0, 0.35);
  const across = seg(c, 0.3, 0.7);
  const down = seg(c, 0.65, 1);
  out.set(lerp(a.x, b.x, across), a.y + (LIFT_H - a.y) * up - (LIFT_H - b.y) * down, lerp(a.z, b.z, across));
  return out;
}

export function buildJourney(): JourneyBuild {
  const kit = new Kit();
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.15);
  sun.position.set(3, 8, 6);
  scene.add(sun);

  /* ── Water + land ──────────────────────────────────────── */
  const water = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(620, 220)), kit.track(new THREE.MeshBasicMaterial({ color: 0xe9eef4 })));
  water.rotation.x = -Math.PI / 2;
  water.position.set(190, -0.25, 10);
  scene.add(water);

  const waves = new THREE.Group();
  const rnd = rng(7);
  const pts: number[] = [];
  for (let i = 0; i < 1100; i++) {
    const x = -30 + rnd() * 460;
    const z = -45 + rnd() * 105;
    const l = 0.8 + rnd() * 1.6;
    pts.push(x, -0.2, z, x + l, -0.2, z);
  }
  const waveGeo = kit.track(new THREE.BufferGeometry());
  waveGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  waves.add(new THREE.LineSegments(waveGeo, kit.track(new THREE.LineBasicMaterial({ color: 0xbfcad8 }))));
  scene.add(waves);

  const land = (x0: number, x1: number) => {
    kit.box(scene, x1 - x0, 0.6, QUAY_Z + 12, x0, -0.6, -12, "ground");
    kit.box(scene, x1 - x0, 0.12, 0.35, x0, 0, QUAY_Z - 0.35, "light", kit.edgeSoft); // quay edge
    for (let x = x0 + 3; x < x1 - 1; x += 5) kit.box(scene, 0.35, 0.35, 0.35, x, 0.12, QUAY_Z - 0.3, "dark", null); // bollards
  };
  land(-16, X1 + 19);
  land(X2 - 19, SITE_X + 22);

  /* ── Station: FACTORY (Bulgaria) ───────────────────────── */
  const factory = new THREE.Group();
  scene.add(factory);
  kit.shadow(factory, -5, -4, 17, 12);
  kit.box(factory, 12, 4.5, 8, -11, 0, -8, "white");
  const tooth = new THREE.Shape();
  tooth.moveTo(0, 0);
  tooth.lineTo(3, 0);
  tooth.lineTo(3, 1.6);
  tooth.lineTo(0, 0);
  const toothGeo = new THREE.ExtrudeGeometry(tooth, { depth: 8, bevelEnabled: false });
  for (let i = 0; i < 4; i++) {
    const m = kit.solid(factory, i === 0 ? toothGeo : toothGeo.clone(), "white");
    m.position.set(-11 + i * 3, 4.5, -8);
    kit.box(factory, 0.04, 1.3, 7.6, -11 + i * 3 + 2.99, 4.55, -7.8, "glass", kit.edgeSoft);
  }
  kit.box(factory, 12, 0.35, 0.08, -11, 3.9, 0, "blue", null);
  for (const dx of [-9.4, -5.2]) {
    kit.box(factory, 3.4, 3.3, 0.1, dx, 0, 0, "light");
    for (let k = 1; k < 5; k++) kit.box(factory, 3.4, 0.03, 0.12, dx, k * 0.66, 0, "grey", null);
  }
  kit.box(factory, 0.9, 2.1, 0.1, -1.4, 0, 0, "light");
  for (const [cx, cy, cz] of [[-0.2, 0, 1.2], [0.9, 0, 1.2], [0.35, 0.9, 1.2]] as const) kit.box(factory, 0.9, 0.9, 0.9, cx, cy, cz, "white");
  const stand = new THREE.Group();
  stand.position.set(3.2, 0, -4);
  factory.add(stand);
  kit.shadow(stand, 1, 0.1, 3, 1.4);
  kit.box(stand, 2.4, 0.15, 0.9, -0.2, 0, -0.45, "light");
  kit.box(stand, 0.12, 0.7, 0.12, 0.2, 0.15, -0.06, "grey");
  kit.box(stand, 0.12, 0.7, 0.12, 1.68, 0.15, -0.06, "grey");
  kit.window(stand, 2, 2.6, 0, 0.85, -0.09, true);

  // forklift carrying the window crate
  const fork = new THREE.Group();
  factory.add(fork);
  kit.shadow(fork, 0.9, 0, 3.2, 2);
  kit.box(fork, 1.5, 0.9, 1.2, 0, 0.3, -0.6, "white");
  kit.box(fork, 0.5, 0.5, 1.0, -0.1, 1.2, -0.5, "grey");
  for (const [px, pz] of [[0.1, -0.55], [0.1, 0.45], [1.2, -0.55], [1.2, 0.45]] as const) kit.box(fork, 0.08, 1.4, 0.08, px, 1.2, pz, "grey");
  kit.box(fork, 1.25, 0.08, 1.12, 0.07, 2.6, -0.56, "white");
  for (const x of [0.1, 1.0]) for (const z of [0.45, -0.75]) kit.box(fork, 0.5, 0.5, 0.3, x, 0, z, "dark");
  kit.box(fork, 0.1, 2.6, 0.1, 1.55, 0.2, -0.45, "dark");
  kit.box(fork, 0.1, 2.6, 0.1, 1.55, 0.2, 0.35, "dark");
  const carriage = new THREE.Group();
  carriage.position.set(1.65, 0.25, 0);
  fork.add(carriage);
  kit.box(carriage, 1.1, 0.06, 0.12, 0, 0, -0.4, "dark");
  kit.box(carriage, 1.1, 0.06, 0.12, 0, 0, 0.28, "dark");
  const crate = kit.box(scene, 0.95, 0.95, 0.95, 0, 0, 0, "white");

  /* ── Quay cranes, trucks, the hero container ───────────── */
  const crane1 = makeCrane(kit, X1);
  const crane2 = makeCrane(kit, X2);
  scene.add(crane1.group, crane2.group);
  const truck1 = makeTruck(kit);
  const truck2 = makeTruck(kit);
  truck1.position.z = truck2.position.z = LANE_Z;
  scene.add(truck1, truck2);
  const hero = makeContainer(kit);
  scene.add(hero.group);

  /* ── Container ship ────────────────────────────────────── */
  const makeShip = shipMaker(kit);
  const main = makeShip(11, ["grey", "white", "light", "grey"] as Fill[], true);
  const ship = main.group;
  main.wake.visible = false; // the main ship gets animated foam instead
  ship.scale.setScalar(SHIP_SCALE);
  ship.position.set(X1, SHIP_Y, SHIP_Z);
  scene.add(ship);

  // foam: short strokes streaming back from the stern, fading into the water
  const FOAM = 30;
  const foamPos = new Float32Array(FOAM * 6);
  const foamCol = new Float32Array(FOAM * 6);
  const foamGeo = kit.track(new THREE.BufferGeometry());
  foamGeo.setAttribute("position", new THREE.BufferAttribute(foamPos, 3));
  foamGeo.setAttribute("color", new THREE.BufferAttribute(foamCol, 3));
  const foam = new THREE.LineSegments(foamGeo, kit.track(new THREE.LineBasicMaterial({ vertexColors: true })));
  foam.frustumCulled = false;
  scene.add(foam);
  const cFoam = new THREE.Color(0x7d93b2);
  const cWater = new THREE.Color(0xe9eef4);
  const cTmp = new THREE.Color();
  const setFoam = (sternX: number, t: number, life: boolean) => {
    for (let i = 0; i < FOAM; i++) {
      const ph = life ? (t * 0.28 + i / FOAM) % 1 : i / FOAM;
      const d = ph * 16;
      const side = i % 2 ? 1 : -1;
      const z = SHIP_Z + side * (1.2 + d * 0.32 + (i % 3) * 0.25);
      const x = sternX - d;
      foamPos.set([x, -0.21, z, x - 0.9 - ph, -0.21, z + side * 0.25], i * 6);
      cTmp.copy(cFoam).lerp(cWater, ph);
      foamCol.set([cTmp.r, cTmp.g, cTmp.b, cTmp.r, cTmp.g, cTmp.b], i * 6);
    }
    foamGeo.attributes.position.needsUpdate = true;
    foamGeo.attributes.color.needsUpdate = true;
  };

  /* ── Station: CUSTOMS booth at the US port ─────────────── */
  const gate = new THREE.Group();
  gate.position.set(GATE_X, 0, 0);
  scene.add(gate);
  kit.shadow(gate, 1.2, 2.8, 3.4, 3);
  kit.box(gate, 1.8, 2.3, 1.7, 0.3, 0, 2, "white"); // booth
  kit.box(gate, 0.05, 0.8, 1.3, 2.1, 1.2, 2.2, "glass", kit.edgeSoft);
  kit.box(gate, 1.3, 0.8, 0.05, 0.55, 1.2, 3.7, "glass", kit.edgeSoft);
  kit.box(gate, 2.4, 0.18, 2.3, 0, 2.3, 1.7, "light"); // roof
  kit.box(gate, 2.4, 0.22, 0.04, 0, 2.05, 4.0, "blue", null); // sign band
  kit.box(gate, 0.3, 1.15, 0.3, -0.15, 0, LANE_Z + 1.45, "grey"); // barrier post
  const arm = new THREE.Group();
  arm.position.set(0, 1.05, LANE_Z + 1.6);
  gate.add(arm);
  for (let k = 0; k < 4; k++) kit.box(arm, 0.14, 0.14, 0.9, -0.07, -0.07, -0.9 * (k + 1), k % 2 ? "white" : "blue", k % 2 ? kit.edge : null);
  for (const z of [1.2, LANE_Z + 2.1]) kit.box(gate, 0.08, 0.9, 0.08, 3.2, 0, z, "grey");
  kit.box(gate, 6, 0.06, 0.06, -6, 0.8, 1.2, "grey", null); // low fence
  const stampAnchor = new THREE.Object3D();
  stampAnchor.position.set(1.2, 3.1, 2.8);
  gate.add(stampAnchor);

  /* ── Station: SITE — a small city block with empty openings ── */
  const site = new THREE.Group();
  site.position.x = SITE_X;
  scene.add(site);
  const city = buildCity(kit, site);

  /* ── Flags: Bulgaria + EU at the factory, USA at customs and on site ── */
  const flags = [
    { kind: "bg" as const, parent: factory, at: [2.2, 0, 0.6] },
    { kind: "eu" as const, parent: factory, at: [4.9, 0, 0.6] },
    { kind: "us" as const, parent: gate, at: [-3.2, 0, 0.4] }, // west of the booth, clear of the "Customs cleared" pill
    { kind: "us" as const, parent: site, at: [-15.6, 0, 2.6] },
  ].map((d) => {
    const fl = makeFlag(kit, d.kind);
    fl.group.position.set(d.at[0], d.at[1], d.at[2]);
    d.parent.add(fl.group);
    return fl;
  });

  /* ── Update ─────────────────────────────────────────────── */
  const slotW = new THREE.Vector3();
  const c1 = new THREE.Vector3();
  const c2 = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const IDENT = new THREE.Quaternion();

  return {
    scene,
    stampAnchor,
    update(p, t, life) {
      flags.forEach((fl) => fl.wave(t, life));
      const sway = (k: number) => (life ? Math.sin(t * 0.9 + k) * 0.06 : 0);

      // factory: forklift loads the crate, backs off; doors shut
      const f = clamp01(p / P.loadEnd);
      const fx = lerp(-8, 1.4, seg(f, 0, 0.65));
      fork.position.set(fx - 3 * seg(p, P.loadEnd, P.doorsShut + 0.02), 0, LANE_Z);
      carriage.position.y = 0.25 + seg(f, 0, 0.2) + (life && f >= 1 ? Math.sin(t * 1.7) * 0.03 : 0);
      const push = seg(f, 0.7, 1);
      crate.position.set(fx + 2.2 + push * 2.4, 0.25 + seg(f, 0, 0.2) + 0.535, LANE_Z);
      crate.visible = push < 0.92;
      hero.setDoors(Math.max(1 - seg(p, P.loadEnd, P.doorsShut), seg(p, P.doorsA, P.installA)));

      // trucks
      truck1.position.x = truck1X(p);
      truck2.position.x = truck2X(p);
      c1.set(truck1.position.x + TRUCK_BED_X, TRUCK_BED_Y + CH / 2, LANE_Z);
      c2.set(truck2.position.x + TRUCK_BED_X, TRUCK_BED_Y + CH / 2, LANE_Z);

      // ship
      const sx = shipX(p);
      ship.position.set(sx, SHIP_Y + (life ? Math.sin(t * 1.3) * 0.08 : 0), SHIP_Z);
      ship.rotation.x = life ? Math.sin(t * 1.1 + 0.6) * 0.01 : 0;
      ship.rotation.z = life ? Math.sin(t * 0.9) * 0.006 : 0;
      ship.updateMatrixWorld(true);
      slotW.copy(main.slot);
      ship.localToWorld(slotW);
      const sailing = p > P.sailA + 0.004 && p < P.sailB - 0.006;
      foam.visible = sailing;
      if (sailing) setFoam(sx - 8.5 * SHIP_SCALE, t, life);

      // hero container: truck → crane → ship → crane → truck
      hero.group.quaternion.copy(IDENT);
      if (p < P.liftA) pos.copy(c1);
      else if (p < P.liftB) liftPath(pos, c1, slotW, (p - P.liftA) / (P.liftB - P.liftA));
      else if (p < P.unloadA) {
        pos.copy(slotW);
        hero.group.quaternion.copy(ship.quaternion);
      } else if (p < P.unloadB) liftPath(pos, slotW, c2, (p - P.unloadA) / (P.unloadB - P.unloadA));
      else pos.copy(c2);
      hero.group.position.copy(pos);

      // cranes: rest → lower onto the box → carry it → hoist back up
      if (p < P.liftA) crane1.setHook(LANE_Z, lerp(HOOK_REST, c1.y + CH / 2, seg(p, P.liftA - 0.025, P.liftA)), sway(0) * (1 - seg(p, P.liftA - 0.03, P.liftA - 0.01)));
      else if (p < P.liftB) crane1.setHook(pos.z, pos.y + CH / 2, pos.x - X1);
      else crane1.setHook(slotW.z, lerp(slotW.y + CH / 2, HOOK_REST, seg(p, P.liftB, P.liftB + 0.025)), sway(1) * seg(p, P.liftB + 0.02, P.liftB + 0.04));
      const dockZ = SHIP_Z + main.slot.z * SHIP_SCALE;
      if (p < P.unloadA) crane2.setHook(dockZ, lerp(HOOK_REST, slotW.y + CH / 2, seg(p, P.unloadA - 0.025, P.unloadA)), sway(2) * (1 - seg(p, P.unloadA - 0.03, P.unloadA - 0.01)));
      else if (p < P.unloadB) crane2.setHook(pos.z, pos.y + CH / 2, pos.x - X2);
      else crane2.setHook(LANE_Z, lerp(c2.y + CH / 2, HOOK_REST, seg(p, P.unloadB, P.unloadB + 0.025)), sway(3) * seg(p, P.unloadB + 0.02, P.unloadB + 0.04));

      // customs barrier lifts
      arm.rotation.x = 1.35 * seg(p, P.barrierA, P.barrierB);

      // the whole VALDA range installs at once when the container doors open
      city.update(clamp01((p - P.installA) / (P.installB - P.installA)), clamp01((p - P.installB) / 0.03), t, life);

      waves.position.x = life ? Math.sin(t * 0.35) * 0.4 : 0;
      waves.position.z = life ? Math.cos(t * 0.27) * 0.15 : 0;
    },
    dispose() {
      kit.dispose();
    },
  };
}

