"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { buildFactory, MODEL_URL } from "./scene";
import { OFFICES, ZONES } from "./zones";

const MAX_YAW = (35 * Math.PI) / 180;
const PAD = 1.04;
const PANEL_W = 360; // desktop info card width (px)
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, #000 3%, #000 97%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 3%, #000 96%, transparent 100%)";
const MAX_STEPS = Math.max(...ZONES.map((z) => z.steps.length));
const nn = (i: number) => String(i + 1).padStart(2, "0");

type Api = { set: (station: number, step: number) => void };

/** WebGL factory board: station bubbles, click for a close-up, steps highlight their machine, drag to look around. */
export default function FactoryCanvas({ active, step, onSelect }: { active: number; step: number; onSelect: (station: number, step: number) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const apiRef = useRef<Api | null>(null);
  const selectRef = useRef(onSelect);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    apiRef.current?.set(active, step);
  }, [active, step]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const labels = labelRefs.current;
    const stepEls = stepRefs.current;
    const life = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    canvas.style.setProperty("mask-image", EDGE_MASK);
    canvas.style.setProperty("-webkit-mask-image", EDGE_MASK);
    canvas.style.setProperty("mask-composite", "intersect");
    canvas.style.setProperty("-webkit-mask-composite", "source-in");
    host.prepend(canvas);

    const build = buildFactory();
    const { scene } = build;

    /* camera: wide screens look mostly from the south, narrow screens tilt to a 45° iso view */
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 600);
    const EL = Math.atan2(0.66, 1);
    let az = 0.42;
    const tgt = new THREE.Vector3();
    const place = (x: number, y: number, z: number, yaw: number) => {
      tgt.set(x, y, z);
      const a = az + yaw;
      camera.position.set(x + Math.sin(a) * Math.cos(EL) * 160, y + Math.sin(EL) * 160, z + Math.cos(a) * Math.cos(EL) * 160);
      camera.lookAt(tgt);
      camera.updateMatrixWorld(true);
    };
    const center = build.overview.getCenter(new THREE.Vector3());
    const ext = (b: THREE.Box3) => {
      const min = new THREE.Vector2(Infinity, Infinity);
      const max = new THREE.Vector2(-Infinity, -Infinity);
      const v = new THREE.Vector3();
      for (let i = 0; i < 8; i++) {
        v.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(camera.matrixWorldInverse);
        min.min(new THREE.Vector2(v.x, v.y));
        max.max(new THREE.Vector2(v.x, v.y));
      }
      return { w: max.x - min.x, h: max.y - min.y };
    };

    let cssW = 1;
    let cssH = 1;
    let viewW = 1;
    let viewH = 1;
    let all = { w: 1, h: 1 };
    const INSET = { side: 40, top: 44, bottom: 28 };
    const fit = () => {
      const r = host.getBoundingClientRect();
      cssW = Math.max(1, r.width);
      cssH = Math.max(1, r.height);
      renderer.setSize(cssW, cssH, false);
      az = cssW < 700 ? Math.PI / 4 : 0.42;
      INSET.side = cssW < 900 ? 24 : 40;
      place(center.x, center.y, center.z, 0);
      all = ext(build.overview);
      const aspect = cssW / cssH;
      viewH = Math.max(all.h * PAD, (all.w * PAD) / aspect);
      viewW = viewH * aspect;
    };
    const isWide = () => cssW >= 768;

    /* state + camera goal */
    let activeIdx = -1;
    let stepIdx = -1;
    const cur = { x: center.x, y: center.y, z: center.z, zoom: 1, shift: 0, shiftY: 0 };
    const goal = { ...cur };
    const box = new THREE.Box3();
    const c = new THREE.Vector3();
    const setGoal = () => {
      const wide = isWide();
      const key = activeIdx >= 0 && stepIdx >= 0 ? ZONES[activeIdx].steps[stepIdx]?.machine : undefined;
      const mb = key ? build.machineBox(key) : null;
      build.setHighlight(mb ? (key ?? null) : null);
      build.setMarker(activeIdx, stepIdx);
      if (activeIdx < 0) {
        place(center.x, center.y, center.z, 0);
        const zoom = Math.min(((cssW - 2 * INSET.side) / cssW) * (viewW / all.w), ((cssH - INSET.top - INSET.bottom) / cssH) * (viewH / all.h));
        Object.assign(goal, { x: center.x, y: center.y, z: center.z, zoom, shift: 0, shiftY: (INSET.bottom - INSET.top) / 2 });
      } else {
        // the whole process line of the station in one still view (steps only highlight)
        box.copy(build.stationBox(activeIdx)).expandByScalar(0.8);
        box.getCenter(c);
        place(c.x, c.y, c.z, 0);
        const e = ext(box);
        const fw = wide ? 0.58 : 0.9;
        const fh = wide ? 0.72 : 0.74;
        const zoom = Math.max(1, Math.min(4, Math.min((viewW * fw) / e.w, (viewH * fh) / e.h)));
        Object.assign(goal, { x: c.x, y: c.y, z: c.z, zoom, shift: wide ? (PANEL_W + 32) / 2 : 0, shiftY: 0 });
      }
      if (!life) Object.assign(cur, goal);
    };
    apiRef.current = {
      set(station: number, s: number) {
        activeIdx = station;
        stepIdx = s;
        setGoal();
        kick();
      },
    };

    /* pointer: drag rotates; a click on a machine opens its step, on a floor pad its station */
    let yaw = 0;
    let yawVel = 0;
    let dragging = false;
    let downX = 0;
    let downY = 0;
    let startYaw = 0;
    let moved = false;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const floors = build.zones.map((z) => z.floor);
    const pick = (clientX: number, clientY: number, objs: THREE.Object3D[]) => {
      const r = host.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(objs, false)[0];
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      downX = e.clientX;
      downY = e.clientY;
      moved = false;
      dragging = true;
      startYaw = yaw;
      yawVel = 0;
      host.setPointerCapture(e.pointerId);
      host.style.cursor = "grabbing";
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) moved = true;
      const next = Math.max(-MAX_YAW, Math.min(MAX_YAW, startYaw - ((e.clientX - downX) / (host.clientWidth || 1)) * 1.6));
      yawVel = yawVel * 0.5 + (next - yaw) * 0.5;
      yaw = next;
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
      host.style.cursor = "grab";
      if (!moved) {
        const m = pick(e.clientX, e.clientY, build.pickables);
        if (m) selectRef.current(m.object.userData.station as number, m.object.userData.step as number);
        else {
          const f = pick(e.clientX, e.clientY, floors);
          if (f) selectRef.current(floors.indexOf(f.object as THREE.Mesh), -1);
        }
      }
      kick();
    };
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    /* HTML overlays: station bubbles, office roles, the highlighted machine's label */
    const v = new THREE.Vector3();
    const project = (o: THREE.Object3D) => {
      v.setFromMatrixPosition(o.matrixWorld).project(camera);
      return { x: ((v.x + 1) / 2) * cssW, y: ((1 - v.y) / 2) * cssH };
    };
    const sizes: { w: number; h: number; compact: boolean }[] = [];
    const placeOverlays = () => {
      // below 900px: compact numbered bubbles right on each station; above: full pills, nudged apart
      const compact = cssW < 900;
      const boxes: { x: number; y: number; w: number; h: number }[] = [];
      build.zones.forEach((z, i) => {
        const el = labels[i];
        if (!el) return;
        el.dataset.compact = compact ? "1" : "0";
        if (!sizes[i] || sizes[i].compact !== compact) sizes[i] = { w: el.offsetWidth || 100, h: el.offsetHeight || 32, compact };
        const { w, h } = sizes[i];
        const s = project(z.anchor);
        const x = Math.min(cssW - w / 2 - 6, Math.max(w / 2 + 6, s.x));
        let y = s.y;
        if (!compact) {
          for (let guard = 0; guard < 6; guard++) {
            const hit = boxes.find((b) => Math.abs(b.x - x) < (b.w + w) / 2 + 4 && Math.abs(b.y - y) < (b.h + h) / 2 + 3);
            if (!hit) break;
            y = hit.y + (y >= hit.y ? 1 : -1) * ((hit.h + h) / 2 + 4);
          }
        }
        boxes.push({ x, y, w, h });
        const inside = y > h / 2 && y < cssH - h / 2 && s.x > 0 && s.x < cssW;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = !inside || activeIdx === i ? "0" : activeIdx < 0 ? "1" : "0.35"; // the open station shows its step labels instead
        el.style.pointerEvents = inside && activeIdx !== i ? "auto" : "none";
        el.dataset.active = activeIdx === i ? "1" : "0";
      });
      // step labels above each machine of the open station, nudged apart in screen space
      const steps = activeIdx >= 0 ? ZONES[activeIdx].steps : [];
      const sb: { x: number; y: number; w: number; h: number }[] = [];
      stepEls.forEach((el, i) => {
        if (!el) return;
        const on = i < steps.length;
        el.style.opacity = on ? "1" : "0";
        el.style.pointerEvents = on ? "auto" : "none";
        if (!on) return;
        const s = project(build.stepAnchors[activeIdx][i]);
        const w = el.offsetWidth || 120;
        const h = el.offsetHeight || 26;
        const x = Math.min(cssW - w / 2 - 6, Math.max(w / 2 + 6, s.x));
        let y = s.y - h / 2;
        for (let guard = 0; guard < 8; guard++) {
          const hit = sb.find((q) => Math.abs(q.x - x) < (q.w + w) / 2 + 4 && Math.abs(q.y - y) < (q.h + h) / 2 + 3);
          if (!hit) break;
          y = hit.y - (hit.h + h) / 2 - 4;
        }
        sb.push({ x, y, w, h });
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.dataset.active = i === stepIdx ? "1" : "0";
      });
    };

    /* render loop */
    let raf = 0;
    let visible = false;
    let last = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const t = (now - t0) / 1000;
      if (!dragging) {
        yaw += yawVel;
        yawVel *= 0.9;
        if (Math.abs(yawVel) < 0.004) yaw += (0 - yaw) * 0.07;
        yaw = Math.max(-MAX_YAW, Math.min(MAX_YAW, yaw));
        if (Math.abs(yaw) < 0.0003 && Math.abs(yawVel) < 0.0003) yaw = yawVel = 0;
      }
      const k = life ? 1 - Math.exp(-dt * 3.2) : 1;
      let travelling = false;
      for (const key of ["x", "y", "z", "zoom", "shift", "shiftY"] as const) {
        const d = goal[key] - cur[key];
        if (Math.abs(d) > 0.0005) travelling = true;
        cur[key] = Math.abs(d) < 0.0005 ? goal[key] : cur[key] + d * k;
      }
      const fading = build.update(dt, { active: activeIdx, life }, t);
      const drift = life && activeIdx < 0 ? Math.sin(t * 0.21) * 0.03 : 0;
      camera.zoom = cur.zoom;
      const d = ((cur.shift / cssW) * viewW) / cur.zoom; // screen-space offset for the info card
      const dy = ((cur.shiftY / cssH) * viewH) / cur.zoom;
      camera.left = -viewW / 2 + d;
      camera.right = viewW / 2 + d;
      camera.top = viewH / 2 - dy;
      camera.bottom = -viewH / 2 - dy;
      camera.updateProjectionMatrix();
      place(cur.x, cur.y, cur.z, yaw + drift);
      renderer.render(scene, camera);
      placeOverlays();
      if (life || travelling || fading || dragging || yaw !== 0 || yawVel !== 0) schedule();
      else last = 0;
    };
    const schedule = () => {
      if (raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(frame);
    };
    const renderNow = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      frame(performance.now());
    };
    function kick() {
      schedule();
    }

    const ro = new ResizeObserver(() => {
      fit();
      setGoal();
      renderNow();
    });
    ro.observe(host);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) renderNow();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          last = 0;
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(host);
    const onVis = () => {
      last = 0;
      schedule();
    };
    document.addEventListener("visibilitychange", onVis);

    let alive = true;
    fetch(MODEL_URL)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((txt) => {
        if (!alive) return;
        build.attachModel(new OBJLoader().parse(txt));
        renderNow();
      })
      .catch(() => {
        /* the factory still works without the OBJ details */
      })
      .finally(() => alive && requestAnimationFrame(() => (host.style.opacity = "1")));

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      apiRef.current = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      build.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);


  return (
    <div ref={hostRef} className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden opacity-0 transition-opacity duration-700">
      {/* station bubbles */}
      {ZONES.map((z, i) => (
        <button
          key={z.id}
          type="button"
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          onClick={() => onSelect(i, -1)}
          aria-label={i === OFFICES ? z.title : `${nn(i)} ${z.title}`}
          data-active="0"
          data-compact="0"
          className="group/pin absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-char/10 bg-white py-1 pl-1 pr-3 text-[12px] font-medium text-char opacity-0 shadow-[0_2px_10px_rgba(34,34,36,0.10)] transition-[opacity,background-color,color] duration-300 will-change-transform hover:border-blue/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-[active=1]:bg-blue data-[active=1]:text-white data-[compact=1]:border-transparent data-[compact=1]:bg-transparent data-[compact=1]:p-0 data-[compact=1]:shadow-none"
        >
          <span className="relative grid h-6 min-w-6 place-items-center rounded-full bg-char px-1 text-[11px] tabular-nums text-white group-data-[active=1]/pin:bg-white group-data-[active=1]/pin:text-blue">
            <span className="absolute inset-0 rounded-full bg-blue/30 motion-safe:animate-ping group-data-[active=1]/pin:hidden" aria-hidden />
            <span className="relative">{i === OFFICES ? "↑" : i + 1}</span>
          </span>
          <span className="group-data-[compact=1]/pin:hidden">{z.chip}</span>
          <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-char px-2 py-1 text-[11px] font-normal text-white opacity-0 transition-opacity group-hover/pin:opacity-100 group-focus-visible/pin:opacity-100 group-data-[compact=0]/pin:hidden">
            {z.title}
          </span>
        </button>
      ))}

      {/* step labels of the open station (same numbers as the floor markers and the card) */}
      {Array.from({ length: MAX_STEPS }, (_, i) => {
        const st = active >= 0 ? ZONES[active].steps[i] : undefined;
        return (
          <button
            key={i}
            type="button"
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            onClick={() => st && onSelect(active, i)}
            tabIndex={st ? 0 : -1}
            aria-hidden={!st}
            data-active="0"
            className="group/step absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-char/10 bg-white py-0.5 pl-0.5 pr-2.5 text-[11px] font-medium text-char opacity-0 shadow-[0_2px_8px_rgba(34,34,36,0.10)] transition-[opacity,background-color,color] duration-300 will-change-transform hover:border-blue/40 focus-visible:outline-2 focus-visible:outline-blue data-[active=1]:bg-blue data-[active=1]:text-white data-[active=1]:font-semibold"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-blue text-[10px] tabular-nums text-white group-data-[active=1]/step:bg-white group-data-[active=1]/step:text-blue">{i + 1}</span>
            {st?.title ?? ""}
          </button>
        );
      })}
    </div>
  );
}
