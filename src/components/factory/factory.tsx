"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { FACTORY_COPY, OFFICES, ZONES } from "./zones";

// three.js is loaded lazily, client only
const FactoryCanvas = dynamic(() => import("./factory-canvas"), { ssr: false });

const nn = (i: number) => String(i + 1).padStart(2, "0");
const arrowBtn =
  "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-panel text-char transition-colors hover:bg-char hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";
const chip = "h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

/** Interactive isometric cutaway of VALDA's Sofia factory: follow a window through the process. */
export function FactoryExplorer({ n = "03" }: { n?: string }) {
  const [active, setActive] = useState(-1);
  const select = useCallback((i: number) => setActive(i), []);
  const step = useCallback((d: number) => setActive((a) => (a < 0 ? (d > 0 ? 0 : ZONES.length - 1) : (a + d + ZONES.length) % ZONES.length)), []);
  const z = active >= 0 ? ZONES[active] : null;

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
          <div
            className="overflow-x-auto px-5 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Factory stations"
          >
            <div className="flex w-max gap-2 pr-10">
              <button type="button" onClick={() => setActive(-1)} aria-pressed={active < 0} className={`${chip} ${active < 0 ? "bg-char text-white" : "bg-white text-char hover:bg-char/5"}`}>
                Overview
              </button>
              {ZONES.map((zn, i) => (
                <button
                  key={zn.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`${chip} ${active === i ? "bg-blue text-white" : "bg-white text-char hover:bg-char/5"}`}
                >
                  {i !== OFFICES && <span className={`mr-1.5 tabular-nums ${active === i ? "text-white/70" : "text-mute"}`}>{nn(i)}</span>}
                  {zn.chip}
                </button>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-panel to-transparent" aria-hidden />
        </div>

        {/* stage */}
        <div className="relative mt-4 md:mt-6">
          <div className="relative h-[70svh] min-h-[420px] overflow-hidden rounded-lg md:h-[86svh] md:min-h-[600px]">
            <FactoryCanvas active={active} onSelect={select} />
            <p className="pointer-events-none absolute right-4 top-3 hidden items-center gap-2 text-[12px] text-mute md:flex">
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
                <path d="M4 1 1 5l3 4M14 1l3 4-3 4M1 5h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Drag to look around · tap a machine
            </p>
            <InfoCard zone={z} index={active} onPrev={() => step(-1)} onNext={() => step(1)} onClose={() => setActive(-1)} className="absolute right-4 top-10 hidden w-[340px] md:block" />
          </div>
          <InfoCard zone={z} index={active} onPrev={() => step(-1)} onNext={() => step(1)} onClose={() => setActive(-1)} className="relative z-10 -mt-4 md:hidden" />
          <p className="mt-4 text-[13px] text-mute">{FACTORY_COPY.caption}</p>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  zone,
  index,
  onPrev,
  onNext,
  onClose,
  className = "",
}: {
  zone: (typeof ZONES)[number] | null;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  className?: string;
}) {
  const open = zone !== null;
  return (
    <div
      aria-live="polite"
      className={`${className} rounded-lg bg-white p-5 shadow-[0_10px_40px_rgba(34,34,36,0.10)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0 max-md:hidden"}`}
    >
      {zone && (
        <>
          <div className="flex items-baseline justify-between text-[14px] text-mute">
            <p className="tabular-nums">{index === OFFICES ? "Upstairs" : `Step /${nn(index)}`}</p>
            <button type="button" onClick={onClose} className="-m-1 flex items-center gap-1 rounded p-1 text-[13px] text-mute transition-colors hover:text-char focus-visible:outline-2 focus-visible:outline-blue">
              Overview <X size={14} aria-hidden />
            </button>
          </div>
          <h3 className="sw-h mt-3 text-[26px] leading-tight text-char">{zone.title}</h3>
          <p className="mt-3 text-[15px] leading-6 text-slate">{zone.body}</p>
          {zone.roles && (
            <ul className="mt-4 divide-y divide-char/10 border-y border-char/10">
              {zone.roles.map((r) => (
                <li key={r.title} className="py-2">
                  <p className="text-[14px] font-medium text-char">{r.title}</p>
                  <p className="text-[13px] leading-5 text-slate">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex items-center justify-end gap-2">
            <button type="button" aria-label="Previous" onClick={onPrev} className={arrowBtn}>
              <ArrowLeft size={18} aria-hidden />
            </button>
            <button type="button" aria-label="Next" onClick={onNext} className={arrowBtn}>
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
