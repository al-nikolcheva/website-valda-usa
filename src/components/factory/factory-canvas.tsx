"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { buildFactory, MODEL_URL } from "./scene";
import { FACTORY_COPY, OFFICES, STATIONS, TOUR_END, ZONES } from "./zones";

const MAX_YAW = (35 * Math.PI) / 180;
const PAD = 1.04;
const PANEL_W = 340; // desktop info card width (px)
const SPEED = 0.25; // tour progress per second (dwell 2.4 s, travel 1.6 s)
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, #000 3%, #000 97%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 3%, #000 96%, transparent 100%)";
const nn = (i: number) => String(i + 1).padStart(2, "0");
const snapOf = (p: number) => Math.min(TOUR_END, Math.max(0, Math.round(p - 0.3) + 0.3));

type Api = { setActive: (i: number) => void };

/** WebGL factory: station labels, click-to-focus, click machines, drag to look around, and "Follow a window". */
export default function FactoryCanvas({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const roleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLParagraphElement>(null);
  const apiRef = useRef<Api | null>(null);
  const ctlRef = useRef<{ toggle: () => void; step: (d: number) => void } | null>(null);
  const selectRef = useRef(onSelect);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    apiRef.current?.setActive(active);
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    const track = trackRef.current;
    if (!host || !track) return;
    const labels = labelRefs.current;
    const roleEls = roleRefs.current;
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

    /* camera: orthographic; wide screens look mostly from the south (the hall reads as a wide band),
       narrow screens tilt to a 45° iso view so the hall runs diagonally and fits a tall stage */
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
    let all = { w: 1, h: 1 };
    let zoneExt = build.zones.map(() => ({ w: 1, h: 1 }));
    const zoneCenter = build.zones.map((z) => z.bounds.getCenter(new THREE.Vector3()));
    // path samples (per product) for grabbing a product and dragging it along its route
    const SAMPLES = 220;
    const paths = [0, 1].map((which) => Array.from({ length: SAMPLES + 1 }, (_, i) => build.worldAt(which, (i / SAMPLES) * TOUR_END, new THREE.Vector3())));

    let cssW = 1;
    let cssH = 1;
    let viewW = 1;
    let viewH = 1;
    // screen insets kept free around the overview: labels at the sides, hint on top, play bar at the bottom
    const INSET = { side: 40, top: 44, bottom: 92 };
    const measureInsets = () => {
      const bar = barRef.current;
      INSET.bottom = (bar ? bar.offsetHeight + 12 : 64) + 36;
      INSET.side = cssW < 900 ? 24 : 40;
    };
    const fit = () => {
      const r = host.getBoundingClientRect();
      cssW = Math.max(1, r.width);
      cssH = Math.max(1, r.height);
      renderer.setSize(cssW, cssH, false);
      az = cssW < 700 ? Math.PI / 4 : 0.42;
      place(center.x, center.y, center.z, 0);
      all = ext(build.overview);
      zoneExt = build.zones.map((z) => ext(z.bounds));
      measureInsets();
      const aspect = cssW / cssH;
      viewH = Math.max(all.h * PAD, (all.w * PAD) / aspect);
      viewW = viewH * aspect;
    };
    const isWide = () => cssW >= 768;

    /* state */
    let activeIdx = -1;
    let tourOn = false;
    let isPlaying = false;
    let p = 0;
    let pTarget = 0;
    let scrubbing = false;
    let tourStation = -1;
    const cur = { x: center.x, y: center.y, z: center.z, zoom: 1, shift: 0, shiftY: 0 };
    const goal = { ...cur };
    const setGoal = () => {
      const wide = isWide();
      if (activeIdx < 0) {
        // the whole hall, inside the insets, at every width
        const zoom = Math.min(((cssW - 2 * INSET.side) / cssW) * (viewW / all.w), ((cssH - INSET.top - INSET.bottom) / cssH) * (viewH / all.h));
        Object.assign(goal, { x: center.x, y: center.y, z: center.z, zoom, shift: 0, shiftY: (INSET.bottom - INSET.top) / 2 });
      } else {
        const e = zoneExt[activeIdx];
        const c = zoneCenter[activeIdx];
        const close = tourOn ? 1.15 : 1;
        const zoom = Math.max(1, Math.min(4, close * Math.min((viewW * (wide ? 0.55 : 0.86)) / e.w, (viewH * (wide ? 0.6 : 0.52)) / e.h)));
        Object.assign(goal, { x: c.x, y: c.y, z: c.z, zoom, shift: wide ? (PANEL_W + 32) / 2 : 0, shiftY: INSET.bottom / 2 - 10 });
      }
      if (!life) Object.assign(cur, goal);
    };
    const setActiveIdx = (i: number) => {
      activeIdx = i;
      setGoal();
      kick();
    };

    /* tour controls */
    const syncTourUi = () => {
      const f = Math.min(1, Math.max(0, p / TOUR_END));
      if (handleRef.current) handleRef.current.style.left = `${(f * 100).toFixed(2)}%`;
      if (fillRef.current) fillRef.current.style.width = `${(f * 100).toFixed(2)}%`;
      track.querySelectorAll<HTMLElement>("[data-dot]").forEach((d, i) => (d.dataset.done = tourOn && p >= i ? "1" : "0"));
      track.setAttribute("aria-valuenow", String(build.stationAt(p) + 1));
      if (stepRef.current) {
        const k = build.stationAt(p);
        stepRef.current.textContent = tourOn ? `${nn(k)} ${STATIONS[k].chip}` : FACTORY_COPY.play;
      }
    };
    const startTour = () => {
      if (!tourOn) {
        tourOn = true;
        tourStation = -1;
      }
    };
    const play = () => {
      startTour();
      if (p >= TOUR_END - 0.001) p = pTarget = 0;
      isPlaying = true;
      setPlaying(true);
      setEnded(false);
      kick();
    };
    const pause = () => {
      isPlaying = false;
      pTarget = p;
      setPlaying(false);
      kick();
    };
    const stepTour = (d: number) => {
      startTour();
      pause();
      pTarget = snapOf(Math.min(TOUR_END, Math.max(0.3, snapOf(p) + d)));
      setEnded(false);
      kick();
    };
    const stopTour = () => {
      tourOn = false;
      isPlaying = false;
      setPlaying(false);
      setEnded(false);
      tourStation = -1;
      syncTourUi();
    };
    ctlRef.current = {
      toggle: () => (isPlaying ? pause() : play()),
      step: stepTour,
    };
    apiRef.current = {
      setActive(i: number) {
        if (tourOn) {
          if (i === tourStation) return; // echo of our own tour update
          if (i >= 0 && i < STATIONS.length) {
            pause();
            pTarget = i + 0.3;
            tourStation = i;
            setActiveIdx(i);
            return;
          }
          stopTour();
        }
        setActiveIdx(i);
      },
    };

    /* track scrubbing */
    const trackP = (clientX: number) => {
      const r = track.getBoundingClientRect();
      return Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * TOUR_END;
    };
    const onTrackDown = (e: PointerEvent) => {
      e.preventDefault();
      startTour();
      isPlaying = false;
      setPlaying(false);
      setEnded(false);
      scrubbing = true;
      track.setPointerCapture(e.pointerId);
      p = pTarget = trackP(e.clientX);
      kick();
    };
    const onTrackMove = (e: PointerEvent) => {
      if (!scrubbing) return;
      p = pTarget = trackP(e.clientX);
      kick();
    };
    const onTrackUp = (e: PointerEvent) => {
      if (!scrubbing) return;
      scrubbing = false;
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      pTarget = snapOf(p);
      kick();
    };
    track.addEventListener("pointerdown", onTrackDown);
    track.addEventListener("pointermove", onTrackMove);
    track.addEventListener("pointerup", onTrackUp);
    track.addEventListener("pointercancel", onTrackUp);

    /* pointer on the stage: grab the window, rotate, click machines / stations */
    let yaw = 0;
    let yawVel = 0;
    let dragging = false;
    let grabbing = false;
    let grabbed = 0; // which product is being dragged
    let downX = 0;
    let downY = 0;
    let startYaw = 0;
    let moved = false;
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.02 };
    const ndc = new THREE.Vector2();
    const floors = build.zones.map((z) => z.floor);
    const shown = (o: THREE.Object3D | null) => {
      for (let n = o; n; n = n.parent) if (!n.visible) return false;
      return true;
    };
    const pick = (clientX: number, clientY: number, objs: THREE.Object3D[], deep = false) => {
      const r = host.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(objs, deep).filter((h) => h.object instanceof THREE.Mesh && shown(h.object))[0];
    };
    const v2 = new THREE.Vector3();
    const nearestP = (clientX: number, clientY: number) => {
      const r = host.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      let best = 0;
      let bestD = Infinity;
      paths[grabbed].forEach((w, i) => {
        v2.copy(w).project(camera);
        // screen distance, with a small pull toward the current progress (products park for a while)
        const d = Math.hypot(((v2.x + 1) / 2) * cssW - x, ((1 - v2.y) / 2) * cssH - y) + Math.abs((i / SAMPLES) * TOUR_END - p) * 6;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return (best / SAMPLES) * TOUR_END;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, [data-ui]")) return;
      downX = e.clientX;
      downY = e.clientY;
      moved = false;
      host.setPointerCapture(e.pointerId);
      const hitA = tourOn ? pick(e.clientX, e.clientY, build.products[0]) : undefined;
      const hitB = tourOn ? pick(e.clientX, e.clientY, build.products[1]) : undefined;
      if (hitA || hitB) {
        grabbed = hitA && (!hitB || hitA.distance <= hitB.distance) ? 0 : 1;
        grabbing = true;
        isPlaying = false;
        setPlaying(false);
        host.style.cursor = "grabbing";
        kick();
        return;
      }
      dragging = true;
      startYaw = yaw;
      yawVel = 0;
      host.style.cursor = "grabbing";
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) moved = true;
      if (grabbing) {
        p = pTarget = nearestP(e.clientX, e.clientY);
        kick();
        return;
      }
      if (!dragging) return;
      const next = Math.max(-MAX_YAW, Math.min(MAX_YAW, startYaw - ((e.clientX - downX) / (host.clientWidth || 1)) * 1.6));
      yawVel = yawVel * 0.5 + (next - yaw) * 0.5;
      yaw = next;
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
      host.style.cursor = "grab";
      if (grabbing) {
        grabbing = false;
        pTarget = snapOf(p);
        kick();
        return;
      }
      if (!dragging) return;
      dragging = false;
      if (!moved) {
        // a machine does its thing; a floor pad focuses its station
        const m = pick(e.clientX, e.clientY, build.machineRoots, true);
        let st = -1;
        for (let n: THREE.Object3D | null = m?.object ?? null; n; n = n.parent) {
          if (typeof n.userData.station === "number") {
            st = n.userData.station;
            break;
          }
        }
        if (st >= 0) {
          build.burst(st);
          if (!tourOn) selectRef.current(st);
        } else {
          const f = pick(e.clientX, e.clientY, floors);
          if (f) selectRef.current(floors.indexOf(f.object as THREE.Mesh));
        }
      }
      kick();
    };
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    /* keyboard: ← / → step (tour or stations), space play/pause, Esc overview (while the stage is on screen) */
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const r = host.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.bottom < window.innerHeight * 0.4) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const d = e.key === "ArrowRight" ? 1 : -1;
        if (tourOn) stepTour(d);
        else selectRef.current(activeIdx < 0 ? (d > 0 ? 0 : ZONES.length - 1) : (activeIdx + d + ZONES.length) % ZONES.length);
      } else if (e.key === "Escape") {
        stopTour();
        selectRef.current(-1);
      }
    };
    window.addEventListener("keydown", onKey);

    /* HTML overlays: station labels + office roles */
    const v = new THREE.Vector3();
    const project = (o: THREE.Object3D) => {
      v.setFromMatrixPosition(o.matrixWorld).project(camera);
      return { x: ((v.x + 1) / 2) * cssW, y: ((1 - v.y) / 2) * cssH };
    };
    const sizes: { w: number; h: number; compact: boolean }[] = [];
    /** the play bar's rect in stage px: no pin or label may sit inside it */
    const barBox = () => {
      const bar = barRef.current;
      if (!bar) return null;
      const r = bar.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      return { l: r.left - h.left - 6, r: r.right - h.left + 6, t: r.top - h.top - 6, b: r.bottom - h.top + 6 };
    };
    const placeOverlays = () => {
      // below 900px: compact numbered pins right on each station; above: full label pills, nudged apart
      const compact = cssW < 900;
      const focus = tourOn ? build.stationAt(p) : activeIdx;
      const boxes: { x: number; y: number; w: number; h: number }[] = [];
      const bar = barBox();
      build.zones.forEach((z, i) => {
        const el = labels[i];
        if (!el) return;
        el.dataset.compact = compact ? "1" : "0";
        if (!sizes[i] || sizes[i].compact !== compact) sizes[i] = { w: el.offsetWidth || 100, h: el.offsetHeight || 32, compact };
        const { w, h } = sizes[i];
        const s = project(z.anchor);
        let x = Math.min(cssW - w / 2 - 6, Math.max(w / 2 + 6, s.x));
        let y = s.y;
        if (!compact) {
          for (let guard = 0; guard < 6; guard++) {
            const hit = boxes.find((bx) => Math.abs(bx.x - x) < (bx.w + w) / 2 + 4 && Math.abs(bx.y - y) < (bx.h + h) / 2 + 3);
            if (!hit) break;
            y = hit.y + (y >= hit.y ? 1 : -1) * ((hit.h + h) / 2 + 4);
          }
        }
        // exclusion zone: lift anything that would land on the play bar
        if (bar && x + w / 2 > bar.l && x - w / 2 < bar.r && y + h / 2 > bar.t) y = Math.min(y, bar.t - h / 2);
        x = Math.min(cssW - w / 2 - 6, Math.max(w / 2 + 6, x));
        boxes.push({ x, y, w, h });
        const inside = y > h / 2 && y < cssH - h / 2 && s.x > 0 && s.x < cssW;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = !inside ? "0" : focus < 0 || focus === i ? "1" : "0.45";
        el.style.pointerEvents = inside ? "auto" : "none";
        el.dataset.active = focus === i ? "1" : "0";
      });
      build.roleAnchors.forEach((a, i) => {
        const el = roleEls[i];
        if (!el) return;
        const s = project(a);
        el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
        el.style.opacity = activeIdx === OFFICES ? "1" : "0";
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
      // tour progress
      let touring = false;
      if (tourOn) {
        if (isPlaying) {
          p = pTarget = Math.min(TOUR_END, p + dt * SPEED);
          touring = true;
          if (p >= TOUR_END) {
            isPlaying = false;
            setPlaying(false);
            setEnded(true);
          }
        } else if (!scrubbing && !grabbing && Math.abs(pTarget - p) > 0.0005) {
          p += (pTarget - p) * (life ? 1 - Math.exp(-dt * 5) : 1);
          touring = true;
        } else if (!scrubbing && !grabbing) p = pTarget;
        const st = build.stationAt(p);
        if (st !== tourStation) {
          tourStation = st;
          activeIdx = st;
          setGoal();
          selectRef.current(st); // info card follows the window
        }
        syncTourUi();
      }
      const k = life ? 1 - Math.exp(-dt * 3.2) : 1;
      let travelling = false;
      for (const key of ["x", "y", "z", "zoom", "shift", "shiftY"] as const) {
        const d = goal[key] - cur[key];
        if (Math.abs(d) > 0.0005) travelling = true;
        cur[key] = Math.abs(d) < 0.0005 ? goal[key] : cur[key] + d * k;
      }
      const fading = build.update(dt, { active: activeIdx, life, tourOn, tourP: p });
      const drift = life && activeIdx < 0 && !tourOn ? Math.sin(t * 0.21) * 0.03 : 0;
      camera.zoom = cur.zoom;
      const d = ((cur.shift / cssW) * viewW) / cur.zoom; // screen-space offset for the info card
      camera.left = -viewW / 2 + d;
      camera.right = viewW / 2 + d;
      const dy = ((cur.shiftY / cssH) * viewH) / cur.zoom; // lift the content above the play bar
      camera.top = viewH / 2 - dy;
      camera.bottom = -viewH / 2 - dy;
      camera.updateProjectionMatrix();
      place(cur.x, cur.y, cur.z, yaw + drift);
      renderer.render(scene, camera);
      placeOverlays();
      if (life || touring || travelling || fading || dragging || grabbing || scrubbing || yaw !== 0 || yawVel !== 0) schedule();
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

    // the real shutters, canopies and entry volume from the OBJ; fade the stage in when ready
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
    syncTourUi();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      apiRef.current = null;
      ctlRef.current = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      track.removeEventListener("pointerdown", onTrackDown);
      track.removeEventListener("pointermove", onTrackMove);
      track.removeEventListener("pointerup", onTrackUp);
      track.removeEventListener("pointercancel", onTrackUp);
      build.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  const roles = ZONES[OFFICES].roles ?? [];
  const ctlBtn =
    "grid h-9 w-9 shrink-0 place-items-center rounded-md text-char transition-colors hover:bg-char hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

  return (
    <div ref={hostRef} className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden opacity-0 transition-opacity duration-700">
      {/* station labels (always visible in the overview) */}
      {ZONES.map((z, i) => (
        <button
          key={z.id}
          type="button"
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          onClick={() => onSelect(i)}
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

      {/* office roles (when the offices are focused) */}
      {roles.map((r, i) => (
        <div
          key={r.title}
          ref={(el) => {
            roleRefs.current[i] = el;
          }}
          className="pointer-events-none absolute left-0 top-0 max-w-[150px] rounded-md bg-char px-2 py-1 text-center text-[11px] leading-tight text-white opacity-0 shadow transition-opacity duration-300"
        >
          {r.title}
        </div>
      ))}

      {/* Follow a window: play, step, scrub */}
      <div ref={barRef} data-ui className="absolute inset-x-3 bottom-3 flex cursor-default items-center gap-1.5 rounded-lg bg-white/95 p-1.5 shadow-[0_6px_24px_rgba(34,34,36,0.12)] md:inset-x-auto md:left-4 md:w-[min(560px,calc(100%-32px))]">
        <button
          type="button"
          onClick={() => ctlRef.current?.toggle()}
          aria-label={playing ? "Pause" : ended ? "Replay" : FACTORY_COPY.play}
          className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-blue px-3 text-[13px] font-medium text-white transition-colors hover:bg-char focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {playing ? <Pause size={16} aria-hidden /> : ended ? <RotateCcw size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          <span className="hidden sm:inline">{playing ? "Pause" : ended ? "Replay" : "Play"}</span>
        </button>
        <button type="button" aria-label="Previous step" onClick={() => ctlRef.current?.step(-1)} className={ctlBtn}>
          <ChevronLeft size={18} aria-hidden />
        </button>
        <button type="button" aria-label="Next step" onClick={() => ctlRef.current?.step(1)} className={ctlBtn}>
          <ChevronRight size={18} aria-hidden />
        </button>
        <div className="min-w-0 flex-1 px-2">
          <p ref={stepRef} className="truncate text-[12px] font-medium text-char">
            {FACTORY_COPY.play}
          </p>
          <div ref={trackRef} className="relative mt-1 h-5 cursor-pointer touch-none" role="slider" aria-label="Window position in the process" aria-valuemin={1} aria-valuemax={STATIONS.length} aria-valuenow={1}>
            <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-char/10" />
            <div ref={fillRef} className="absolute left-0 top-1/2 h-[3px] w-0 -translate-y-1/2 rounded-full bg-blue" />
            {STATIONS.map((s, i) => (
              <span
                key={s.id}
                data-dot
                data-done="0"
                title={s.title}
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-char/25 data-[done=1]:bg-blue"
                style={{ left: `${(((i + 0.3) / TOUR_END) * 100).toFixed(2)}%` }}
              />
            ))}
            <div ref={handleRef} className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue bg-white shadow" style={{ left: "0%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
