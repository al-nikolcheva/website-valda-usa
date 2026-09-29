"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { FACTORY_COPY, OFFICES, ZONES } from "./zones";

// three.js is loaded lazily, client only
const FactoryCanvas = dynamic(() => import("./factory-canvas"), { ssr: false });

const nn = (i: number) => String(i + 1).padStart(2, "0");
const arrowBtn =
  "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-panel text-char transition-colors hover:bg-char hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";
const chip = "h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

/** Interactive factory board: tap a station for a close-up and its steps; each step highlights its machine. */
export function FactoryExplorer({ n = "03" }: { n?: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState({ active: -1, step: -1 });
  const select = useCallback((active: number, step = -1) => setSel({ active, step }), []);
  const station = useCallback((d: number) => setSel((s) => ({ active: s.active < 0 ? (d > 0 ? 0 : ZONES.length - 1) : (s.active + d + ZONES.length) % ZONES.length, step: -1 })), []);
  const stepBy = useCallback(
    (d: number) =>
      setSel((s) => {
        if (s.active < 0) return s;
        const len = ZONES[s.active].steps.length;
        return { active: s.active, step: s.step < 0 ? (d > 0 ? 0 : len - 1) : Math.min(len - 1, Math.max(0, s.step + d)) };
      }),
    [],
  );

  // keyboard (while the stage is on screen): ←/→ stations, ↑/↓ steps, Esc overview
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.bottom < window.innerHeight * 0.4) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        station(e.key === "ArrowRight" ? 1 : -1);
      } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && sel.active >= 0) {
        e.preventDefault();
        stepBy(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Escape") select(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [station, stepBy, select, sel.active]);

  const z = sel.active >= 0 ? ZONES[sel.active] : null;
  const card = {
    zone: z,
    index: sel.active,
    step: sel.step,
    onStep: (i: number) => select(sel.active, i),
    onPrev: () => station(-1),
    onNext: () => station(1),
    onClose: () => select(-1),
  };

  return (
    <section className="bg-panel py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="flex items-baseline justify-between text-[14px] text-mute">
          <p>{FACTORY_COPY.label}</p>
          <p>/{n}</p>
        </div>
        <div className="mt-6 md:mt-10">
          <h2 className="sw-h max-w-[18ch] text-[clamp(2.2rem,4.4vw,3.5rem)] text-char">{FACTORY_COPY.heading}</h2>
          <p className="mt-4 max-w-xl text-[16px] leading-6 text-slate">{FACTORY_COPY.intro}</p>
        </div>

        {/* station chips: one scrolling row, no scrollbar, fading out at the right edge */}
        <div className="relative -mx-5 mt-8 md:mx-0">
          <div className="overflow-x-auto px-5 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="Factory stations">
            <div className="flex w-max gap-2 pr-10">
              <button type="button" onClick={() => select(-1)} aria-pressed={sel.active < 0} className={`${chip} ${sel.active < 0 ? "bg-char text-white" : "bg-white text-char hover:bg-char/5"}`}>
                Overview
              </button>
              {ZONES.map((zn, i) => (
                <button
                  key={zn.id}
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={sel.active === i}
                  className={`${chip} ${sel.active === i ? "bg-blue text-white" : "bg-white text-char hover:bg-char/5"}`}
                >
                  {i !== OFFICES && <span className={`mr-1.5 tabular-nums ${sel.active === i ? "text-white/70" : "text-mute"}`}>{nn(i)}</span>}
                  {zn.chip}
                </button>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-panel to-transparent" aria-hidden />
        </div>

        {/* stage */}
        <div className="relative mt-4 md:mt-6">
          <div ref={stage} className="relative h-[70svh] min-h-[420px] overflow-hidden rounded-lg md:h-[86svh] md:min-h-[600px]">
            <FactoryCanvas active={sel.active} step={sel.step} onSelect={select} />
            <p className="pointer-events-none absolute left-4 top-3 hidden items-center gap-2 text-[12px] text-mute md:flex">
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
                <path d="M4 1 1 5l3 4M14 1l3 4-3 4M1 5h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Drag to look around · tap a station or a machine
            </p>
            <InfoCard {...card} hover className="absolute right-4 top-4 hidden max-h-[calc(100%-32px)] w-[360px] overflow-y-auto md:block" />
          </div>
          <InfoCard {...card} className="relative z-10 -mt-4 md:hidden" listClassName="max-h-[38svh] overflow-y-auto" />
          <p className="mt-4 text-[13px] text-mute">{FACTORY_COPY.caption}</p>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  zone,
  index,
  step,
  onStep,
  onPrev,
  onNext,
  onClose,
  hover = false,
  className = "",
  listClassName = "",
}: {
  zone: (typeof ZONES)[number] | null;
  index: number;
  step: number;
  onStep: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  hover?: boolean;
  className?: string;
  listClassName?: string;
}) {
  const open = zone !== null;
  return (
    <div
      className={`${className} rounded-lg bg-white p-5 shadow-[0_10px_40px_rgba(34,34,36,0.10)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0 max-md:hidden"}`}
    >
      {zone && (
        <>
          <div className="flex items-baseline justify-between text-[14px] text-mute">
            <p className="tabular-nums">{index === OFFICES ? "Upstairs" : `/${nn(index)}`}</p>
            <button type="button" onClick={onClose} className="-m-1 flex items-center gap-1 rounded p-1 text-[13px] text-mute transition-colors hover:text-char focus-visible:outline-2 focus-visible:outline-blue">
              Overview <X size={14} aria-hidden />
            </button>
          </div>
          <h3 className="sw-h mt-2 text-[26px] leading-tight text-char">{zone.title}</h3>
          <p className="mt-2 text-[15px] leading-6 text-slate">{zone.intro}</p>
          <ol className={`mt-4 border-t border-char/10 ${listClassName}`} aria-live="polite">
            {zone.steps.map((s, i) => {
              const on = i === step;
              return (
                <li key={s.title} className="border-b border-char/10">
                  <button
                    type="button"
                    onClick={() => onStep(i)}
                    onMouseEnter={hover ? () => onStep(i) : undefined}
                    aria-pressed={on}
                    className={`flex w-full gap-3 px-1 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue ${on ? "bg-blue/[0.06]" : "hover:bg-char/[0.03]"}`}
                  >
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] tabular-nums transition-colors ${on ? "bg-blue text-white" : "bg-char/10 text-char"}`}>{i + 1}</span>
                    <span className="min-w-0">
                      <span className={`block text-[14px] font-medium ${on ? "text-blue" : "text-char"}`}>{s.title}</span>
                      <span className={`block text-[13px] leading-5 text-slate ${on ? "" : "line-clamp-1"}`}>{s.text}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" aria-label="Previous station" onClick={onPrev} className={arrowBtn}>
              <ArrowLeft size={18} aria-hidden />
            </button>
            <button type="button" aria-label="Next station" onClick={onNext} className={arrowBtn}>
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
