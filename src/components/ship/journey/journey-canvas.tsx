"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { buildJourney } from "./scene";
import { shotAt, stampAt } from "./timeline";

const MAX_YAW = (35 * Math.PI) / 180;
/** Region framed at zoom 1 (relative to the shot target), measured from the standard iso angle. */
const FRAME = new THREE.Box3(new THREE.Vector3(-13, -2.8, -9), new THREE.Vector3(13, 5, 7));
const ISO_DIR = new THREE.Vector3(10, 8, 10).normalize();
const PAD = 1.06;
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 10%, #000 86%, transparent 100%)";

/** WebGL diorama: the camera follows the hero container with scroll; drag to look around. */
export default function JourneyCanvas({ progress }: { progress: MotionValue<number> }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const stamp = stampRef.current;
    if (!host || !stamp) return;
    const life = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    // the diorama floats on the panel: fade every edge out
    canvas.style.setProperty("mask-image", EDGE_MASK);
    canvas.style.setProperty("-webkit-mask-image", EDGE_MASK);
    canvas.style.setProperty("mask-composite", "intersect");
    canvas.style.setProperty("-webkit-mask-composite", "source-in");
    host.prepend(canvas);

    const build = buildJourney();
    const { scene } = build;

    /* orthographic camera, aimed by azimuth / elevation around the shot target */
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
    const target = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const place = (x: number, y: number, z: number, az: number, el: number) => {
      target.set(x, y, z);
      dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      camera.position.copy(target).addScaledVector(dir, 120);
      camera.lookAt(target);
      camera.updateMatrixWorld(true);
    };
    // base frustum: FRAME seen from the standard iso angle
    camera.position.copy(ISO_DIR).multiplyScalar(120);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
    const vmin = new THREE.Vector2(Infinity, Infinity);
    const vmax = new THREE.Vector2(-Infinity, -Infinity);
    const v = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? FRAME.max.x : FRAME.min.x, i & 2 ? FRAME.max.y : FRAME.min.y, i & 4 ? FRAME.max.z : FRAME.min.z).applyMatrix4(camera.matrixWorldInverse);
      vmin.min(new THREE.Vector2(v.x, v.y));
      vmax.max(new THREE.Vector2(v.x, v.y));
    }
    const vw = (vmax.x - vmin.x) * PAD;
    const vh = (vmax.y - vmin.y) * PAD;

    let cssW = 1;
    let cssH = 1;
    const fit = () => {
      const rect = host.getBoundingClientRect();
      const w = (cssW = Math.max(1, rect.width));
      const h = (cssH = Math.max(1, rect.height));
      renderer.setSize(w, h, false);
      const aspect = w / h;
      const viewH = Math.max(vh, (vw * (aspect < 1 ? 0.84 : 1)) / aspect);
      const viewW = viewH * aspect;
      camera.left = -viewW / 2;
      camera.right = viewW / 2;
      camera.top = viewH / 2;
      camera.bottom = -viewH / 2;
      camera.updateProjectionMatrix();
    };

    /* "Customs cleared" pill, pinned above the booth */
    const sv = new THREE.Vector3();
    const placeStamp = (k: number) => {
      stamp.style.opacity = String(k);
      if (k <= 0.01) return;
      sv.setFromMatrixPosition(build.stampAnchor.matrixWorld).project(camera);
      const x = ((sv.x + 1) / 2) * cssW;
      const y = ((1 - sv.y) / 2) * cssH;
      stamp.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%) scale(${(0.85 + 0.15 * k).toFixed(3)})`;
    };

    /* drag to look around: clamped yaw with inertia, springs back */
    let yaw = 0;
    let yawVel = 0;
    let dragging = false;
    let startX = 0;
    let startYaw = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startYaw = yaw;
      yawVel = 0;
      host.setPointerCapture(e.pointerId);
      host.style.cursor = "grabbing";
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const w = host.clientWidth || 1;
      const next = Math.max(-MAX_YAW, Math.min(MAX_YAW, startYaw - ((e.clientX - startX) / w) * 1.6));
      yawVel = yawVel * 0.5 + (next - yaw) * 0.5;
      yaw = next;
      schedule();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
      host.style.cursor = "grab";
      schedule();
    };
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    /* render loop: continuous only while visible and alive (idle motion / drag), else on demand */
    let raf = 0;
    let visible = false;
    let lastP = -1;
    let lastYaw = NaN;
    let dirty = true;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = 0;
      const t = (now - t0) / 1000;
      const p = progress.get();
      if (!dragging) {
        yaw += yawVel;
        yawVel *= 0.9;
        if (Math.abs(yawVel) < 0.004) yaw += (0 - yaw) * 0.07;
        yaw = Math.max(-MAX_YAW, Math.min(MAX_YAW, yaw));
        if (Math.abs(yaw) < 0.0003 && Math.abs(yawVel) < 0.0003) yaw = yawVel = 0;
      }
      const shot = shotAt(p);
      if (life || dirty || p !== lastP || yaw !== lastYaw) {
        dirty = false;
        lastP = p;
        lastYaw = yaw;
        build.update(p, t, life);
        const drift = life ? Math.sin(t * 0.21) * 0.035 : 0;
        const bob = life ? Math.sin(t * 0.17) * 0.08 : 0;
        if (camera.zoom !== shot.zoom) {
          camera.zoom = shot.zoom;
          camera.updateProjectionMatrix();
        }
        place(shot.x, shot.y + bob, shot.z, shot.az + yaw + drift, shot.el);
        renderer.render(scene, camera);
        placeStamp(stampAt(p));
      }

    };
    const schedule = () => {
      if (raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(frame);
    };
    const unsub = progress.on("change", schedule);

    // setSize clears the canvas: re-render in the same tick so it never shows blank
    const renderNow = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      dirty = true;
      frame(performance.now());
    };
    const ro = new ResizeObserver(() => {
      fit();
      renderNow();
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) renderNow(); // draw immediately on re-entry
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(host);
    const onVis = () => schedule();
    document.addEventListener("visibilitychange", onVis);

    requestAnimationFrame(() => (host.style.opacity = "1"));

    return () => {
      if (raf) cancelAnimationFrame(raf);
      unsub();
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
  }, [progress]);

  return (
    <div ref={hostRef} aria-hidden className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden opacity-0 transition-opacity duration-700">
      <div
        ref={stampRef}
        className="pointer-events-none absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white py-1 pl-1 pr-3 text-[12px] font-medium text-char opacity-0 shadow-[0_2px_10px_rgba(31,78,140,0.18)] ring-1 ring-blue/25"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-blue text-white">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2 5 8.6l4.5-5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Customs cleared
      </div>
    </div>
  );
}
