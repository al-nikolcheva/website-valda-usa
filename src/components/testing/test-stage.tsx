"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kit } from "./engine";
import { buildTest, STEP_LABELS, type TestKind } from "./scenes";

const CAM_DIR = new THREE.Vector3(10, 8, 10).normalize();
const PAD = 1.12;
const MAX_LABELS = 8;

type Ctl = { step: (i: number) => void; toggle: () => void };

/**
 * Isometric test animation with step tabs and a play control.
 * Renders only while on screen and while playing; holds the last frame otherwise.
 */
export function TestStage({ kind, className }: { kind: TestKind; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const hudRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ctl = useRef<Ctl>({ step: () => {}, toggle: () => {} });
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const labels = STEP_LABELS[kind];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    canvas.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(3, 6, 8);
    scene.add(sun);

    const kit = new Kit();
    const build = buildTest(kind, kit);
    scene.add(build.root);
    const { steps } = build;
    const total = steps[steps.length - 1].end;

    /* camera fitted to the scene bounds */
    const bounds = build.bounds;
    const center = bounds.getCenter(new THREE.Vector3());
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
    camera.position.copy(center).addScaledVector(CAM_DIR, 60);
    camera.lookAt(center);
    camera.updateMatrixWorld(true);
    const vmin = new THREE.Vector2(Infinity, Infinity);
    const vmax = new THREE.Vector2(-Infinity, -Infinity);
    const corner = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      corner
        .set(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z)
        .applyMatrix4(camera.matrixWorldInverse);
      vmin.set(Math.min(vmin.x, corner.x), Math.min(vmin.y, corner.y));
      vmax.set(Math.max(vmax.x, corner.x), Math.max(vmax.y, corner.y));
    }
    const vcx = (vmin.x + vmax.x) / 2;
    const vcy = (vmin.y + vmax.y) / 2;
    const vw = (vmax.x - vmin.x) * PAD;
    const vh = (vmax.y - vmin.y) * PAD;

    let cssW = 1;
    let cssH = 1;
    const fit = () => {
      const rect = host.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      renderer.setSize(cssW, cssH, false);
      const aspect = cssW / cssH;
      const viewH = Math.max(vh, vw / aspect);
      const viewW = viewH * aspect;
      camera.left = vcx - viewW / 2;
      camera.right = vcx + viewW / 2;
      camera.top = vcy + viewH / 2;
      camera.bottom = vcy - viewH / 2;
      camera.updateProjectionMatrix();
    };

    /* playback state */
    let t = reduceMotion ? steps[0].end - 0.001 : 0;
    let stopAt = t;
    let mode: "all" | number = reduceMotion ? 0 : "all";
    let playingNow = false;
    let started = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    let lastActive = -1;
    let lastCaption = "";
    let lastHud = "";
    const proj = new THREE.Vector3();

    const stepAt = (time: number) => {
      for (let k = 0; k < steps.length; k++) if (time < steps[k].end) return k;
      return steps.length - 1;
    };

    const draw = () => {
      const fr = build.update(t);
      if (fr.caption !== lastCaption && captionRef.current) captionRef.current.textContent = lastCaption = fr.caption;
      const hud = fr.hud ?? "";
      if (hud !== lastHud && hudRef.current) hudRef.current.textContent = lastHud = hud;
      if (barRef.current) barRef.current.style.transform = `scaleX(${t / total})`;
      build.labels.forEach((L, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        if (!L.show) {
          el.style.opacity = "0";
          return;
        }
        proj.copy(L.p).project(camera);
        if (el.textContent !== L.text) el.textContent = L.text;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const px = ((proj.x + 1) / 2) * cssW;
        const py = ((1 - proj.y) / 2) * cssH;
        // keep labels inside the stage on narrow screens
        const x = L.align === "right" ? Math.min(px + 8, cssW - w) : Math.min(Math.max(px - w / 2, 0), cssW - w);
        const y = L.align === "right" ? py - h / 2 : py - 6 - h;
        el.style.transform = `translate(${Math.max(0, x)}px, ${y}px)`;
        el.dataset.accent = L.accent ? "1" : "0";
        el.style.opacity = "1";
      });
      const a = mode === "all" ? stepAt(t) : mode;
      if (a !== lastActive) {
        lastActive = a;
        setActive(a);
      }
      renderer.render(scene, camera);
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      t = Math.min(stopAt, t + dt);
      draw();
      if (t >= stopAt) {
        playingNow = false;
        last = 0;
        setPlaying(false);
        setDone(true);
        return;
      }
      schedule();
    };
    const schedule = () => {
      if (!playingNow || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const play = (from: number, to: number) => {
      stop();
      setDone(false);
      if (reduceMotion) {
        t = to;
        playingNow = false;
        draw();
        return;
      }
      t = from;
      stopAt = to;
      playingNow = true;
      setPlaying(true);
      draw();
      schedule();
    };

    ctl.current = {
      step: (i) => {
        started = true;
        mode = i;
        play(steps[i].start, steps[i].end - 0.001);
      },
      toggle: () => {
        started = true;
        if (playingNow) {
          playingNow = false;
          stop();
          setPlaying(false);
          return;
        }
        if (t >= stopAt - 0.002) {
          // finished: replay everything
          mode = "all";
          play(0, total);
        } else {
          playingNow = true;
          setPlaying(true);
          schedule();
        }
      },
    };

    const ro = new ResizeObserver(() => {
      fit();
      draw();
      setReady(true);
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !started) {
          started = true;
          if (!reduceMotion) play(0, total);
        }
        if (visible) schedule();
        else stop();
      },
      { threshold: 0.35 },
    );
    io.observe(host);

    const onVis = () => (document.hidden ? stop() : schedule());
    document.addEventListener("visibilitychange", onVis);
    queueMicrotask(() => setReduced(reduceMotion));

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      ctl.current = { step: () => {}, toggle: () => {} };
      kit.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [kind]);

  return (
    <div className={cn("rounded-lg bg-panel p-4 md:p-6", className)}>
      <div className="relative aspect-[4/3] w-full select-none overflow-hidden md:aspect-[16/9]">
        <div
          ref={hostRef}
          aria-hidden
          className="absolute inset-x-0 bottom-0 top-11 transition-opacity duration-500 sm:top-7"
          style={{ opacity: ready ? 1 : 0 }}
        />
        {/* projected 3D labels */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-11 sm:top-7">
          {Array.from({ length: MAX_LABELS }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 whitespace-nowrap rounded-md border border-char/10 bg-white/95 px-2 py-0.5 text-[11px] leading-4 text-char opacity-0 transition-opacity duration-300 data-[accent=1]:border-blue/30 data-[accent=1]:text-blue md:text-[12px]"
            />
          ))}
        </div>
        {/* caption + readout */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-0.5 text-[12px] font-medium leading-5 text-char sm:flex-row sm:items-start sm:justify-between sm:gap-4 md:text-[13px]">
          <p className="flex items-center gap-2" aria-live="polite">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
            <span ref={captionRef} />
          </p>
          <span ref={hudRef} className="pl-3.5 tabular-nums text-slate sm:pl-0 sm:text-right" />
        </div>
        <span className="absolute inset-x-0 bottom-0 h-px bg-char/10">
          <span ref={barRef} className="absolute inset-0 origin-left bg-blue" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Test steps" className="flex flex-wrap gap-1.5">
          {labels.map((l, i) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => ctl.current.step(i)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-[13px] leading-5 transition-colors",
                i === active ? "border-char bg-char text-white" : "border-char/10 bg-white text-char hover:border-char/30",
              )}
            >
              <span className={cn("tabular-nums", i === active ? "text-white/55" : "text-mute")}>{String(i + 1).padStart(2, "0")}</span>
              {l}
            </button>
          ))}
        </div>
        {!reduced && (
          <button
            type="button"
            onClick={() => ctl.current.toggle()}
            className="inline-flex items-center gap-1.5 rounded-md border border-char/10 bg-white px-3 py-1.5 text-[13px] leading-5 text-char transition-colors hover:border-char/30"
          >
            {playing ? <Pause size={13} /> : done ? <RotateCcw size={13} /> : <Play size={13} />}
            {playing ? "Pause" : done ? "Replay all" : "Play"}
          </button>
        )}
      </div>
    </div>
  );
}
