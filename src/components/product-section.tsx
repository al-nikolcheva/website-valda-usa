"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/primitives";
import { SYSTEM_PROFILES } from "@/lib/systems";

type Hotspot = { n: number; x: number; y: number; t: string; b: string };

type SectionData = {
  eyebrow: string;
  title: string;
  intro: string;
  core: "thermal" | "steel";
  hotspots: Hotspot[];
  image?: string;
};

export const PRODUCT_SECTIONS: Record<string, SectionData> = {
  aluminium: {
    eyebrow: "The section · engineered in layers",
    title: "What holds the performance.",
    intro: "Every VALDA aluminium system is a stack of engineered layers. Explore the section.",
    core: "thermal",
    hotspots: [
      { n: 1, x: 24, y: 15.5, t: "Warm-edge glazing", b: "Sealed double unit with a low-conductivity spacer at the edge." },
      { n: 2, x: 50, y: 22, t: "Co-extruded gaskets", b: "Continuous EPDM seals on both the glass and the frame." },
      { n: 3, x: 40, y: 48.5, t: "Polyamide thermal break", b: "The insulated zone that splits inside from outside." },
      { n: 4, x: 64, y: 64, t: "Multi-chamber profile", b: "Aluminium chambers for rigidity, drainage and reinforcement." },
    ],
  },
  pvc: {
    eyebrow: "The section · engineered in layers",
    title: "Engineered for thermal comfort.",
    intro: "Every VALDA PVC system is a stack of engineered layers. Explore the section.",
    core: "steel",
    hotspots: [
      { n: 1, x: 24, y: 15.5, t: "Warm-edge glazing", b: "Sealed double unit with a low-conductivity spacer at the edge." },
      { n: 2, x: 50, y: 22, t: "Co-extruded gaskets", b: "Continuous EPDM seals on both the glass and the frame." },
      { n: 3, x: 38.5, y: 36, t: "Steel reinforcement core", b: "Galvanised steel inside the chambers for structural rigidity." },
      { n: 4, x: 64, y: 64, t: "Multi-chamber profile", b: "Insulating PVC chambers for warmth, drainage and strength." },
    ],
  },
};

export function ProductSection({ material, slug }: { material: keyof typeof PRODUCT_SECTIONS; slug?: string }) {
  const base = PRODUCT_SECTIONS[material];
  const override = slug ? SYSTEM_PROFILES[slug] : undefined;
  const data = { ...base, image: override?.image ?? base.image, hotspots: override?.hotspots ?? base.hotspots };
  const isPhoto = !!data.image;
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <Container>
        <p className="caption text-white/70">
          <span className="text-blue-bright">/</span> {data.eyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl headline text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05] text-white">
          {data.title}
        </h2>

        <div
          className="mt-14 grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16"
          onMouseLeave={() => setActive(null)}
        >
          {/* SECTION ART + HOTSPOTS */}
          <div className="relative mx-auto w-full max-w-[480px]">
            <div className={`relative ${isPhoto ? "aspect-[29/32]" : "aspect-square"}`}>
              {isPhoto ? (
                <Image
                  src={data.image!}
                  alt="Profile section"
                  fill
                  className="object-contain [filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.55))]"
                  sizes="480px"
                />
              ) : (
                <SectionArt core={data.core} active={active} />
              )}

              {data.hotspots.map((h) => {
                const isActive = active === h.n;
                const dim = active !== null && !isActive;
                return (
                  <button
                    key={h.n}
                    type="button"
                    onMouseEnter={() => setActive(h.n)}
                    onFocus={() => setActive(h.n)}
                    onClick={() => setActive((a) => (a === h.n ? null : h.n))}
                    aria-label={h.t}
                    className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                    style={{ left: `${h.x}%`, top: `${h.y}%`, zIndex: isActive ? 30 : 20 }}
                  >
                    {isActive && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-blue-bright/40"
                        animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <span
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full font-mono text-[12px] font-medium shadow-lg ring-1 transition-all duration-300 ${
                        isActive
                          ? "scale-110 bg-blue-bright text-white ring-white/70"
                          : dim
                          ? "scale-90 bg-blue/70 text-white/80 ring-white/20"
                          : "bg-blue text-white ring-white/40 hover:scale-105"
                      }`}
                    >
                      {h.n}
                    </span>

                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2 }}
                          className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 w-max max-w-[180px] -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-left shadow-xl"
                        >
                          <span className="block font-display text-[13px] font-semibold text-ink">{h.t}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEGEND */}
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {data.hotspots.map((h) => {
              const isActive = active === h.n;
              return (
                <button
                  key={h.n}
                  type="button"
                  onMouseEnter={() => setActive(h.n)}
                  onFocus={() => setActive(h.n)}
                  onClick={() => setActive((a) => (a === h.n ? null : h.n))}
                  className={`flex flex-col items-start gap-3 p-6 text-left outline-none transition-colors duration-300 ${
                    isActive ? "bg-blue" : "bg-ink hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] transition-colors duration-300 ${
                      isActive ? "bg-white text-blue" : "bg-white/10 text-white/80"
                    }`}
                  >
                    {h.n}
                  </span>
                  <span>
                    <span className="block headline text-[17px] text-white">{h.t}</span>
                    <span className={`mt-1.5 block text-[13px] leading-[1.7] ${isActive ? "text-white/85" : "text-white/55"}`}>
                      {h.b}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Brand SVG cross-section (horizontal jamb section) ─────────────── */
function SectionArt({ core, active }: { core: "thermal" | "steel"; active: number | null }) {
  const hl = (n: number) => (active === n ? 1 : active === null ? 0 : 0.35);
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" role="img" aria-label="Profile cross-section">
      <defs>
        <linearGradient id="ps-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6dae0" />
          <stop offset="1" stopColor="#9097a1" />
        </linearGradient>
        <linearGradient id="ps-metal2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9bfc7" />
          <stop offset="1" stopColor="#80868f" />
        </linearGradient>
        <linearGradient id="ps-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f93c8" stopOpacity="0.32" />
          <stop offset="1" stopColor="#2f4f86" stopOpacity="0.14" />
        </linearGradient>
        <radialGradient id="ps-glow" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#3a6dba" stopOpacity="0.20" />
          <stop offset="1" stopColor="#3a6dba" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft glow + faint technical grid */}
      <rect x="0" y="0" width="600" height="600" fill="url(#ps-glow)" />
      <g stroke="#ffffff" strokeOpacity="0.04">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="600" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} />
        ))}
      </g>

      {/* ── insulated glass unit (top) ── */}
      <g opacity={1}>
        {/* warm-edge spacer (left) — hotspot 1 */}
        <rect x="120" y="70" width="40" height="48" rx="4" fill="#7c828c" stroke="#5f6671" strokeWidth="2" />
        <rect x="120" y="70" width="40" height="48" rx="4" fill="#3a6dba" opacity={hl(1) * 0.5} />
        {/* two glass panes + cavity */}
        <rect x="160" y="72" width="300" height="18" fill="url(#ps-glass)" stroke="#9fb8de" strokeWidth="1.5" />
        <rect x="160" y="98" width="300" height="18" fill="url(#ps-glass)" stroke="#9fb8de" strokeWidth="1.5" />
      </g>

      {/* ── gaskets (EPDM) — hotspot 2 ── */}
      <g>
        <path d="M150 120 H460 V150 H150 Z" fill="#14181d" />
        <path d="M150 120 H460 V150 H150 Z" fill="#3a6dba" opacity={hl(2) * 0.55} />
        <circle cx="300" cy="135" r="11" fill="#1c2127" stroke="#3a6dba" strokeWidth={active === 2 ? 2.5 : 0} />
      </g>

      {/* ── aluminium / PVC multi-chamber frame — hotspot 4 ── */}
      <g>
        <rect x="150" y="150" width="300" height="320" rx="10" fill="url(#ps-metal)" stroke="#5f6671" strokeWidth="2.5" />
        {/* chamber dividers */}
        <g stroke="#6b727c" strokeWidth="2" fill="none">
          <rect x="172" y="172" width="118" height="86" rx="4" fill="url(#ps-metal2)" />
          <rect x="310" y="172" width="118" height="86" rx="4" fill="url(#ps-metal2)" />
          <rect x="172" y="322" width="118" height="126" rx="4" fill="url(#ps-metal2)" />
          <rect x="310" y="322" width="118" height="126" rx="4" fill="url(#ps-metal2)" />
        </g>
        {/* highlight wash for chambers */}
        <rect x="150" y="150" width="300" height="320" rx="10" fill="#3a6dba" opacity={hl(4) * 0.28} />
      </g>

      {/* ── core layer: thermal break (polyamide) or steel — hotspot 3 ── */}
      <g>
        {core === "thermal" ? (
          <>
            <rect x="150" y="270" width="300" height="30" fill="#1b2026" />
            <g stroke="#3a6dba" strokeOpacity="0.5" strokeWidth="2">
              {Array.from({ length: 15 }).map((_, i) => (
                <line key={i} x1={156 + i * 20} y1="270" x2={146 + i * 20} y2="300" />
              ))}
            </g>
            <rect x="150" y="270" width="300" height="30" fill="#3a6dba" opacity={hl(3) * 0.6} />
          </>
        ) : (
          <>
            <rect x="196" y="190" width="70" height="50" rx="3" fill="#5b6470" stroke="#2c333d" strokeWidth="3" />
            <rect x="334" y="190" width="70" height="50" rx="3" fill="#5b6470" stroke="#2c333d" strokeWidth="3" />
            <rect x="196" y="190" width="70" height="50" rx="3" fill="#3a6dba" opacity={hl(3) * 0.7} />
            <rect x="334" y="190" width="70" height="50" rx="3" fill="#3a6dba" opacity={hl(3) * 0.7} />
          </>
        )}
      </g>

      {/* drainage notch detail */}
      <path d="M150 430 h-22 v18 h22" fill="none" stroke="#5f6671" strokeWidth="2.5" />
    </svg>
  );
}
