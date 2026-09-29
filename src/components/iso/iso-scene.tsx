"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildScene, FIRST_CAPTION, IsoKit, type IsoKind } from "./scenes";

const CAM_DIR = new THREE.Vector3(10, 8, 10).normalize();
const PAD = 1.28; // breathing room around the object (overlay UI sits in the margins)
const SCALE_FT = 3;

/** Soft radial contact shadow as a canvas texture. */
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(34,34,36,0.16)");
    grd.addColorStop(0.55, "rgba(34,34,36,0.06)");
    grd.addColorStop(1, "rgba(34,34,36,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function IsoScene({ kind }: { kind: IsoKind }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<() => void>(() => {});
  const [caption, setCaption] = useState(FIRST_CAPTION[kind]);
  const [scalePx, setScalePx] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    host.appendChild(canvas);

    /* scene */
    const scene = new THREE.Scene();
    // physically-based intensities (÷π): front faces ≈ white, side faces a soft grey
    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(3, 6, 8);
    scene.add(sun);

    const kit = new IsoKit();
    const build = buildScene(kind, kit);
    scene.add(build.root);

    /* bounds over the representative poses */
    const bounds = new THREE.Box3();
    const tmp = new THREE.Box3();
    for (const ft of build.fitTimes) {
      build.update(ft);
      build.root.updateMatrixWorld(true);
      tmp.setFromObject(build.root);
      bounds.union(tmp);
    }
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());

    /* contact shadow on the floor */
    const shTex = shadowTexture();
    kit.track(shTex);
    const shGeo = new THREE.PlaneGeometry(1, 1);
    kit.track(shGeo);
    const shMat = new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false });
    kit.track(shMat);
    const shadow = new THREE.Mesh(shGeo, shMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(center.x, bounds.min.y - 0.01, center.z);
    shadow.scale.set(size.x * 1.35, Math.max(size.z, size.x * 0.35) * 1.6, 1);
    scene.add(shadow);

    /* orthographic iso camera */
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
    camera.position.copy(center).addScaledVector(CAM_DIR, 60);
    camera.lookAt(center);
    camera.updateMatrixWorld(true);

    // view-space extents of the bounding box
    const vmin = new THREE.Vector2(Infinity, Infinity);
    const vmax = new THREE.Vector2(-Infinity, -Infinity);
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Vector3(
        i & 1 ? bounds.max.x : bounds.min.x,
        i & 2 ? bounds.max.y : bounds.min.y,
        i & 4 ? bounds.max.z : bounds.min.z,
      ).applyMatrix4(camera.matrixWorldInverse);
      vmin.min(new THREE.Vector2(p.x, p.y));
      vmax.max(new THREE.Vector2(p.x, p.y));
    }
    const vcx = (vmin.x + vmax.x) / 2;
    const vcy = (vmin.y + vmax.y) / 2;
    const vw = (vmax.x - vmin.x) * PAD;
    const vh = (vmax.y - vmin.y) * PAD;

    // world length along X projected to screen, per world unit (constant for ortho)
    const xAxisView = new THREE.Vector3(1, 0, 0).transformDirection(camera.matrixWorldInverse);
    const xForeshorten = Math.hypot(xAxisView.x, xAxisView.y);

    let viewH = 1;
    let cssW = 1;
    let cssH = 1;
    const fit = () => {
      const rect = host.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      renderer.setSize(cssW, cssH, false);
      const aspect = cssW / cssH;
      viewH = Math.max(vh, vw / aspect);
      const viewW = viewH * aspect;
      camera.left = vcx - viewW / 2;
      camera.right = vcx + viewW / 2;
      camera.top = vcy + viewH / 2;
      camera.bottom = vcy - viewH / 2;
      camera.updateProjectionMatrix();
      setScalePx(Math.round(SCALE_FT * xForeshorten * (cssH / viewH)));
    };

    /* animation state */
    let elapsed = reduceMotion ? build.staticT : 0;
    let last = 0;
    let raf = 0;
    let visible = false;
    let lastCaption = "";

    const draw = (t: number) => {
      const frame = build.update(t);
      if (frame.caption !== lastCaption) {
        lastCaption = frame.caption;
        setCaption(frame.caption);
      }
      canvas.style.opacity = String(frame.fade ?? 1);
      renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      elapsed = (elapsed + dt) % build.duration;
      draw(elapsed);
      schedule();
    };
    const schedule = () => {
      if (reduceMotion || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };

    replayRef.current = () => {
      elapsed = 0;
      if (!raf) draw(0);
    };

    const ro = new ResizeObserver(() => {
      fit();
      draw(elapsed);
      setReady(true);
      setReduced(reduceMotion);
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) schedule();
        else stop();
      },
      { rootMargin: "80px" },
    );
    io.observe(host);

    const onVis = () => (document.hidden ? stop() : schedule());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      replayRef.current = () => {};
      kit.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [kind]);

  return (
    <div className="absolute inset-0 select-none">
      <div
        ref={hostRef}
        aria-hidden
        className="absolute inset-0 transition-opacity duration-500 ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      />

      {/* step caption */}
      <div className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 text-[12px] font-medium text-char" aria-live="polite">
        <span className="h-1.5 w-1.5 rounded-full bg-blue" />
        {caption}
      </div>

      {/* replay */}
      {!reduced && (
        <button
          type="button"
          onClick={() => replayRef.current()}
          className="absolute right-0 top-0 rounded-md border border-char/10 bg-white px-2.5 py-1 text-[12px] text-char transition-colors hover:border-char/25"
        >
          Replay
        </button>
      )}

      {/* scale bar */}
      {scalePx > 0 && (
        <div className="pointer-events-none absolute bottom-0 left-0 flex flex-col gap-1 text-[11px] text-char/60">
          <span>{SCALE_FT} ft</span>
          <span className="relative block h-2" style={{ width: scalePx }}>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-char/50" />
            <span className="absolute left-0 top-0 h-2 w-px bg-char/50" />
            <span className="absolute right-0 top-0 h-2 w-px bg-char/50" />
          </span>
        </div>
      )}
    </div>
  );
}
