"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { isHvhzCounty, stateZone } from "@/lib/build-project";
import { ZONE_COLOR } from "./zone-colors";

/** One state or county as written by scripts/build-geo.mjs. */
export type Region = { id: string; name: string; polys: number[][][] };

type Props = {
  stateId: string | null;
  countyId: string | null;
  onState: (r: Region) => void;
  onCounty: (r: Region) => void;
  onStatesLoaded?: (list: Region[]) => void;
  onCountiesLoaded?: (list: Region[]) => void;
};

// Map data is Albers USA, 975 × 610 units; scale it into a ~49-unit-wide world.
const S = 1 / 20;
const CX = 487;
const CY = 305;
const DEPTH = 0.55;
const COUNTY_DEPTH = 0.12;
const SELECTED = new THREE.Color("#222224");

function shapesOf(polys: number[][][]): THREE.Shape[] {
  const pt = (ring: number[], i: number) => new THREE.Vector2((ring[i] - CX) * S, -(ring[i + 1] - CY) * S);
  return polys.map(([outer, ...holes]) => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i < outer.length; i += 2) pts.push(pt(outer, i));
    const shape = new THREE.Shape(pts);
    for (const h of holes) {
      const hp: THREE.Vector2[] = [];
      for (let i = 0; i < h.length; i += 2) hp.push(pt(h, i));
      shape.holes.push(new THREE.Path(hp));
    }
    return shape;
  });
}

function outline(polys: number[][][], z: number, color: string, opacity: number) {
  const pos: number[] = [];
  for (const poly of polys)
    for (const ring of poly)
      for (let i = 0; i < ring.length; i += 2) {
        const j = (i + 2) % ring.length;
        pos.push((ring[i] - CX) * S, -(ring[i + 1] - CY) * S, z, (ring[j] - CX) * S, -(ring[j + 1] - CY) * S, z);
      }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

type Item = {
  region: Region;
  group: THREE.Group;
  mesh: THREE.Mesh;
  top: THREE.MeshStandardMaterial;
  side: THREE.MeshStandardMaterial;
  base: THREE.Color;
  lift: number;
};

/** Extruded, clickable US map. Click a state to fly in and load its counties. */
export default function UsMapCanvas({ stateId, countyId, onState, onCounty, onStatesLoaded, onCountiesLoaded }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ select: (s: string | null, c: string | null) => void } | null>(null);
  const cb = useRef({ onState, onCounty, onStatesLoaded, onCountiesLoaded });
  const sel = useRef({ stateId, countyId });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cb.current = { onState, onCounty, onStatesLoaded, onCountiesLoaded };
  });

  useEffect(() => {
    const host = hostRef.current;
    const tip = tipRef.current;
    if (!host || !tip) return;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", touchAction: "none" });
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c2cf, 2.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(-20, 40, 25);
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
    const HOME = { pos: new THREE.Vector3(0, 46, 40), target: new THREE.Vector3(0, 0, 1.5) };
    camera.position.copy(HOME.pos);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(HOME.target);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = 1.15;
    controls.minAzimuthAngle = -0.7;
    controls.maxAzimuthAngle = 0.7;
    controls.minDistance = 3;
    controls.maxDistance = 90;

    // fly-to: eased each frame until close, cancelled when the visitor grabs the map
    let fly: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
    controls.addEventListener("start", () => { fly = null; });

    const map = new THREE.Group();
    map.rotation.x = -Math.PI / 2;
    scene.add(map);
    const countyLayer = new THREE.Group();

    const states: Item[] = [];
    let counties: Item[] = [];
    let hover: Item | null = null;

    const makeItem = (region: Region, color: string, depth: number, z: number): Item => {
      const geo = new THREE.ExtrudeGeometry(shapesOf(region.polys), { depth, bevelEnabled: false });
      const base = new THREE.Color(color);
      const top = new THREE.MeshStandardMaterial({ color: base.clone(), roughness: 0.75, metalness: 0.02, transparent: true });
      const side = new THREE.MeshStandardMaterial({ color: base.clone().multiplyScalar(0.72), roughness: 0.9, transparent: true });
      const mesh = new THREE.Mesh(geo, [top, side]);
      const group = new THREE.Group();
      group.position.z = z;
      group.add(mesh);
      return { region, group, mesh, top, side, base, lift: 0 };
    };

    const frame = (obj: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(obj);
      const c = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const aspect = camera.aspect || 1.6;
      const span = Math.max(size.x / Math.min(aspect, 1.8), size.z);
      const d = span * 1.7 + 2.5;
      fly = { target: c, pos: c.clone().add(new THREE.Vector3(0, d * 0.82, d * 0.62)) };
    };

    let countyToken = 0;
    const loadCounties = async (sid: string) => {
      const token = ++countyToken;
      const res = await fetch(`/geo/counties/${sid}.json`);
      const list = (await res.json()) as Region[];
      if (disposed || token !== countyToken) return;
      const zone = stateZone(sid);
      counties = list.map((r) => {
        // Florida reads lighter than its HVHZ counties so Miami-Dade and Broward stand out
        const color = isHvhzCounty(r.id) ? ZONE_COLOR.hvhz : ZONE_COLOR[zone === "impact" ? "coastal" : zone];
        const it = makeItem(r, color, COUNTY_DEPTH, 0);
        countyLayer.add(it.group);
        return it;
      });
      countyLayer.add(outline(list.flatMap((r) => [r.polys].flat()), COUNTY_DEPTH + 0.005, "#ffffff", 0.9));
      cb.current.onCountiesLoaded?.(list);
      applySelection();
    };

    const clearCounties = () => {
      countyToken++;
      countyLayer.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      countyLayer.clear();
      counties = [];
      countyLayer.removeFromParent();
    };

    let shownState: string | null = null;
    const applySelection = () => {
      const { stateId: sid, countyId: cid } = sel.current;
      for (const it of states) {
        const on = !sid || it.region.id === sid;
        it.top.opacity = it.side.opacity = on ? 1 : 0.28;
        it.mesh.visible = !(sid && it.region.id === sid && counties.length); // counties replace the state's top
      }
      for (const it of counties) it.lift = it.region.id === cid ? 0.35 : 0;
      for (const it of counties) it.top.color.copy(it.region.id === cid ? SELECTED : it.base);
    };

    const select = (sid: string | null, cid: string | null) => {
      sel.current = { stateId: sid, countyId: cid };
      if (sid !== shownState) {
        shownState = sid;
        clearCounties();
        if (sid) {
          const st = states.find((s) => s.region.id === sid);
          if (st) {
            st.group.add(countyLayer);
            countyLayer.position.z = DEPTH + 0.002;
            frame(st.group);
          }
          loadCounties(sid);
        } else fly = { pos: HOME.pos.clone(), target: HOME.target.clone() };
      }
      if (sid && cid) {
        const c = counties.find((x) => x.region.id === cid);
        const st = states.find((s) => s.region.id === sid);
        if (c && st) {
          // zoom into the county, but keep enough of the state around it to read context
          const box = new THREE.Box3().setFromObject(c.group);
          const center = box.getCenter(new THREE.Vector3());
          const stBox = new THREE.Box3().setFromObject(st.group).getSize(new THREE.Vector3());
          const d = Math.max(Math.max(stBox.x, stBox.z) * 1.05, 5);
          fly = { target: center, pos: center.clone().add(new THREE.Vector3(0, d * 0.85, d * 0.6)) };
        }
      }
      applySelection();
    };
    apiRef.current = { select };

    fetch("/geo/states.json")
      .then((r) => r.json())
      .then((list: Region[]) => {
        if (disposed) return;
        for (const r of list) {
          const it = makeItem(r, ZONE_COLOR[stateZone(r.id)], DEPTH, 0);
          states.push(it);
          map.add(it.group);
        }
        map.add(outline(list.flatMap((r) => r.polys), DEPTH + 0.004, "#ffffff", 1));
        cb.current.onStatesLoaded?.(list);
        setLoading(false);
        frame(map);
        if (fly) {
          HOME.pos.copy(fly.pos);
          HOME.target.copy(fly.target);
          camera.position.copy(HOME.pos);
          controls.target.copy(HOME.target);
          fly = null;
        }
        select(sel.current.stateId, sel.current.countyId);
      });

    /* picking */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (e: PointerEvent): Item | null => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (counties.length) {
        const hit = ray.intersectObjects(counties.map((c) => c.mesh), false)[0];
        if (hit) return counties.find((c) => c.mesh === hit.object) ?? null;
      }
      const hit = ray.intersectObjects(states.filter((s) => s.mesh.visible).map((s) => s.mesh), false)[0];
      return hit ? states.find((s) => s.mesh === hit.object) ?? null : null;
    };

    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onMove = (e: PointerEvent) => {
      const it = pick(e);
      if (hover && hover !== it && !counties.includes(hover)) hover.lift = hover.region.id === sel.current.stateId ? 0 : 0;
      hover = it;
      renderer.domElement.style.cursor = it ? "pointer" : "grab";
      if (it) {
        const r = host.getBoundingClientRect();
        tip.textContent = it.region.name + (counties.includes(it) && isHvhzCounty(it.region.id) ? " · HVHZ" : "");
        tip.style.opacity = "1";
        tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
      } else tip.style.opacity = "0";
    };
    const onLeave = () => { hover = null; tip.style.opacity = "0"; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      down = null;
      const it = pick(e);
      if (!it) return;
      if (counties.includes(it)) cb.current.onCounty(it.region);
      else cb.current.onState(it.region);
    };
    const el = renderer.domElement;
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerup", onUp);

    const fit = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = Math.max(1, width) / Math.max(1, height);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);

    let raf = 0;
    let last = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const ease = (rate: number) => 1 - Math.exp(-rate * dt);
      if (fly) {
        camera.position.lerp(fly.pos, ease(4.5));
        controls.target.lerp(fly.target, ease(4.5));
        if (camera.position.distanceTo(fly.pos) < 0.02) fly = null;
      }
      const hoverLift = (it: Item) => (it === hover ? 0.18 : 0);
      for (const it of states) {
        const goal = (it.region.id === sel.current.stateId ? 0.2 : 0) + (sel.current.stateId ? 0 : hoverLift(it));
        it.group.position.z += (goal - it.group.position.z) * ease(9);
      }
      for (const it of counties) {
        const goal = it.lift + hoverLift(it) * 0.8;
        it.group.position.z += (goal - it.group.position.z) * ease(10);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerup", onUp);
      clearCounties();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      el.remove();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    sel.current = { stateId, countyId };
    apiRef.current?.select(stateId, countyId);
  }, [stateId, countyId]);

  return (
    <div ref={hostRef} className="relative h-full w-full">
      <div
        ref={tipRef}
        className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded-md bg-char px-2.5 py-1 text-[12px] text-white opacity-0 transition-opacity"
      />
      {loading && <p className="absolute inset-0 grid place-items-center text-[14px] text-mute">Loading the map…</p>}
    </div>
  );
}
