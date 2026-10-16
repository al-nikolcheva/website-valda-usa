"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Photoreal configurator: Blender renders of the house (scripts/render-house) composited
 * live. The mask render marks frame and glass pixels and the id render says which
 * opening each pixel belongs to, so every frame can be recoloured on the GPU without
 * re-rendering. Clicking reads the id map to pick the exact window.
 */

export type RenderView = "front" | "back";
export type RenderTime = "morning" | "noon" | "sunset" | "night";
export type OpeningPaint = { n: number; color: string; wood: boolean; glass: string };

type Props = {
  base: string; // e.g. /build/house
  view: RenderView;
  time: RenderTime;
  paint: OpeningPaint[];
  selected: number | null;
  onPick: (n: number | null) => void;
};

const MAX = 64; // openings the palette texture can hold
const FRAME_ALBEDO = 0.62; // how bright the neutral frames come out in the tone-mapped renders

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
uniform sampler2D tA;
uniform sampler2D tB;
uniform float uMix;
uniform sampler2D tMask;
uniform sampler2D tId;
uniform sampler2D tPalette; // row 0: frame colour (rgb) + wood flag (a); row 1: glass tint
uniform vec2 uScale;
uniform vec2 uCenter;
uniform float uSel;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }

void main() {
  vec2 uv = uCenter + (vUv - 0.5) * uScale;
  vec3 base = toLinear(mix(texture2D(tA, uv).rgb, texture2D(tB, uv).rgb, uMix));
  vec4 m = texture2D(tMask, uv);
  float n = floor(texture2D(tId, uv).r * 255.0 + 0.5);
  vec3 c = base;
  if (n > 0.5) {
    float u = (n - 0.5) / ${MAX}.0;
    vec4 frame = texture2D(tPalette, vec2(u, 0.25));
    vec3 tint = texture2D(tPalette, vec2(u, 0.75)).rgb;
    vec3 albedo = toLinear(frame.rgb);
    if (frame.a > 0.5) albedo *= mix(0.55, 1.3, m.b); // woodgrain foil
    // relight the neutral frame with the chosen colour, keeping a little of its gloss
    vec3 recoloured = base * (albedo / ${FRAME_ALBEDO.toFixed(2)}) + max(base - 0.75, 0.0) * 0.35;
    c = mix(c, recoloured, m.r);
    c = mix(c, c * toLinear(tint), m.g);
    float glow = 0.0;
    // a soft breathing highlight on the glass so the chosen frame colour stays true
    if (abs(n - uSel) < 0.5) glow = 0.10 + 0.06 * sin(uTime * 3.0);
    else if (abs(n - uHover) < 0.5) glow = 0.08;
    c += vec3(0.55, 0.7, 1.0) * glow * m.g;
  }
  gl_FragColor = vec4(toSrgb(c), 1.0);
}
`;

type Meta = { size: [number, number] };

export default function RenderStudio({ base, view, time, paint, selected, onPick }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{
    setView: (v: RenderView, t: RenderTime) => void;
    setTime: (t: RenderTime) => void;
    setPaint: (p: OpeningPaint[]) => void;
    setSelected: (n: number | null) => void;
  } | null>(null);
  const cb = useRef(onPick);
  const latest = useRef({ view, time, paint, selected });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    cb.current = onPick;
    latest.current = { view, time, paint, selected };
  });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block", touchAction: "none" });
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const loader = new THREE.TextureLoader();
    const cache = new Map<string, Promise<THREE.Texture>>();
    const tex = (url: string, data = false) => {
      if (!cache.has(url))
        cache.set(
          url,
          loader.loadAsync(url).then((t) => {
            t.colorSpace = THREE.NoColorSpace;
            t.generateMipmaps = false;
            t.minFilter = data ? THREE.NearestFilter : THREE.LinearFilter;
            t.magFilter = data ? THREE.NearestFilter : THREE.LinearFilter;
            t.flipY = true;
            return t;
          }),
        );
      return cache.get(url)!;
    };

    const paletteData = new Uint8Array(MAX * 2 * 4).fill(255);
    const palette = new THREE.DataTexture(paletteData, MAX, 2, THREE.RGBAFormat);
    palette.magFilter = palette.minFilter = THREE.NearestFilter;
    palette.needsUpdate = true;

    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blank.needsUpdate = true;
    const uniforms = {
      tA: { value: blank as THREE.Texture },
      tB: { value: blank as THREE.Texture },
      uMix: { value: 0 },
      tMask: { value: blank as THREE.Texture },
      tId: { value: blank as THREE.Texture },
      tPalette: { value: palette },
      uScale: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uSel: { value: -1 },
      uHover: { value: -1 },
      uTime: { value: 0 },
    };
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, depthTest: false }));
    scene.add(quad);

    // id map on the CPU for picking and for each opening's on-screen box
    let ids: { w: number; h: number; data: Uint8ClampedArray } | null = null;
    let boxes = new Map<number, { x0: number; y0: number; x1: number; y1: number }>();
    const readIds = (url: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, c.width, c.height).data;
          ids = { w: c.width, h: c.height, data };
          boxes = new Map();
          for (let y = 0; y < c.height; y += 2)
            for (let x = 0; x < c.width; x += 2) {
              const n = data[(y * c.width + x) * 4];
              if (!n) continue;
              const b = boxes.get(n);
              if (!b) boxes.set(n, { x0: x, y0: y, x1: x, y1: y });
              else {
                b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x);
                b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y);
              }
            }
          resolve();
        };
        img.src = url;
      });

    let aspectImg = 16 / 9;
    fetch(`${base}/openings.json`).then((r) => r.json()).then((m: Meta) => { aspectImg = m.size[0] / m.size[1]; fit(); });

    /* view framing: cover the canvas, then zoom toward the selected opening */
    const cover = new THREE.Vector2(1, 1);
    const goal = { cx: 0.5, cy: 0.5, z: 1 };
    const cur = { cx: 0.5, cy: 0.5, z: 1 };
    const fit = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, r.width), h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      const va = w / h;
      if (va > aspectImg) cover.set(1, aspectImg / va);
      else cover.set(va / aspectImg, 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const clampCenter = (cx: number, cy: number, z: number) => {
      const hx = cover.x / z / 2, hy = cover.y / z / 2;
      return [Math.min(1 - hx, Math.max(hx, cx)), Math.min(1 - hy, Math.max(hy, cy))];
    };

    const frameOn = (n: number | null) => {
      const b = n ? boxes.get(n) : null;
      if (!b || !ids) {
        Object.assign(goal, { cx: 0.5, cy: 0.5, z: 1 });
        return;
      }
      const bw = (b.x1 - b.x0) / ids.w, bh = (b.y1 - b.y0) / ids.h;
      const z = Math.min(3.2, Math.max(1.4, Math.min(cover.x / (bw * 2.6), cover.y / (bh * 2.4))));
      // image y runs down; uv y runs up. Aim a little below centre so the panel doesn't cover it.
      const cx = (b.x0 + b.x1) / 2 / ids.w;
      const cy = 1 - (b.y0 + b.y1) / 2 / ids.h - (cover.y / z) * 0.18;
      Object.assign(goal, { cx, cy, z });
    };

    const pickAt = (clientX: number, clientY: number): number | null => {
      if (!ids) return null;
      const r = el.getBoundingClientRect();
      const vx = (clientX - r.left) / r.width, vy = 1 - (clientY - r.top) / r.height;
      const u = cur.cx + (vx - 0.5) * (cover.x / cur.z);
      const v = cur.cy + (vy - 0.5) * (cover.y / cur.z);
      const px = Math.floor(u * ids.w), py = Math.floor((1 - v) * ids.h);
      if (px < 0 || py < 0 || px >= ids.w || py >= ids.h) return null;
      return ids.data[(py * ids.w + px) * 4] || null;
    };

    let currentView: RenderView | null = null;
    let currentTime: RenderTime | null = null;
    let fade = 1;
    const showTime = async (t: RenderTime) => {
      const v = currentView!;
      const next = await tex(`${base}/${v}-${t}.webp`);
      if (disposed || v !== currentView) return;
      if (currentTime === null) {
        uniforms.tA.value = uniforms.tB.value = next;
        uniforms.uMix.value = 1;
      } else {
        uniforms.tA.value = uniforms.tB.value;
        uniforms.tB.value = next;
        uniforms.uMix.value = 0;
        fade = 0;
      }
      currentTime = t;
    };
    const setView = async (v: RenderView, t: RenderTime) => {
      currentView = v;
      currentTime = null;
      setLoading(true);
      const [mask, id] = await Promise.all([tex(`${base}/${v}-mask.png`, true), tex(`${base}/${v}-id.png`, true), readIds(`${base}/${v}-id.png`)]);
      if (disposed || v !== currentView) return;
      mask.minFilter = mask.magFilter = THREE.LinearFilter;
      uniforms.tMask.value = mask;
      uniforms.tId.value = id;
      await showTime(t);
      setLoading(false);
      // warm the other times of day for this view
      (["morning", "noon", "sunset", "night"] as RenderTime[]).forEach((x) => tex(`${base}/${v}-${x}.webp`));
      frameOn(null);
    };
    const hex = new THREE.Color();
    const setPaint = (list: OpeningPaint[]) => {
      for (const p of list) {
        if (p.n < 1 || p.n > MAX) continue;
        const i = (p.n - 1) * 4;
        hex.set(p.color);
        paletteData.set([hex.r * 255, hex.g * 255, hex.b * 255, p.wood ? 255 : 0], i);
        hex.set(p.glass);
        paletteData.set([hex.r * 255, hex.g * 255, hex.b * 255, 255], MAX * 4 + i);
      }
      palette.needsUpdate = true;
    };
    const setSelected = (n: number | null) => {
      uniforms.uSel.value = n ?? -1;
      frameOn(n);
    };
    api.current = { setView, setTime: (t) => { if (currentView) showTime(t); }, setPaint, setSelected };

    // first state
    const l = latest.current;
    setPaint(l.paint);
    setView(l.view, l.time).then(() => setSelected(latest.current.selected));

    /* input */
    let down: { x: number; y: number } | null = null;
    const canvas = renderer.domElement;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onMove = (e: PointerEvent) => {
      const n = pickAt(e.clientX, e.clientY);
      uniforms.uHover.value = n ?? -1;
      canvas.style.cursor = n ? "pointer" : "default";
    };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return;
      down = null;
      cb.current(pickAt(e.clientX, e.clientY));
    };
    const onLeave = () => { uniforms.uHover.value = -1; };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let last = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      uniforms.uTime.value += dt;
      if (fade < 1) {
        fade = Math.min(1, fade + dt / 0.9);
        uniforms.uMix.value = fade * fade * (3 - 2 * fade);
      }
      const k = 1 - Math.exp(-dt * 4);
      cur.z += (goal.z - cur.z) * k;
      const [gx, gy] = clampCenter(goal.cx, goal.cy, cur.z);
      cur.cx += (gx - cur.cx) * k;
      cur.cy += (gy - cur.cy) * k;
      const [cx, cy] = clampCenter(cur.cx, cur.cy, cur.z);
      uniforms.uCenter.value.set(cx, cy);
      uniforms.uScale.value.set(cover.x / cur.z, cover.y / cur.z);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      cache.forEach((p) => p.then((t) => t.dispose()));
      palette.dispose();
      blank.dispose();
      quad.geometry.dispose();
      (quad.material as THREE.Material).dispose();
      renderer.dispose();
      canvas.remove();
      api.current = null;
    };
  }, [base]);

  useEffect(() => { api.current?.setView(view, latest.current.time); }, [view]);
  useEffect(() => { api.current?.setTime(time); }, [time]);
  useEffect(() => { api.current?.setPaint(paint); }, [paint]);
  useEffect(() => { api.current?.setSelected(selected); }, [selected]);

  return (
    <div ref={host} className="relative h-full w-full bg-[#cfd8e2]">
      {loading && <p className="absolute inset-0 grid place-items-center text-[14px] text-char/60">Loading the render…</p>}
    </div>
  );
}
