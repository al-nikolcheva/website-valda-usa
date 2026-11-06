"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { STEPS } from "./plan";

// three.js is loaded lazily, client only
const BuildCanvas = dynamic(() => import("./build-canvas"), { ssr: false });

const nn = (i: number) => String(i + 1).padStart(2, "0");
const arrowBtn =
  "grid h-11 w-11 shrink-0 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:pointer-events-none disabled:opacity-30";

/** Step-by-step 3D build of one PVC tilt & turn window, from profile to packed unit. */
export function WindowBuild() {
  const [step, setStep] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const last = STEPS.length - 1;
  const go = useCallback((d: number) => setStep((s) => Math.min(last, Math.max(0, s + d))), [last]);

  // ← / → while the stage is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const r = stageRef.current?.getBoundingClientRect();
      if (!r || r.top > window.innerHeight * 0.6 || r.bottom < window.innerHeight * 0.4) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      go(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const s = STEPS[step];

  return (
    <section className="bg-panel py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="flex items-baseline justify-between text-[14px] text-mute">
          <p>How a window is made</p>
          <p className="tabular-nums">
            /{nn(step)} of {nn(last)}
          </p>
        </div>
        <h1 className="sw-h mt-6 max-w-[20ch] text-[clamp(2.2rem,4.4vw,3.5rem)] text-char">From profile to packed window.</h1>
        <p className="mt-4 max-w-xl text-[16px] leading-6 text-slate">
          Follow one PVC tilt &amp; turn window through our factory, step by step. Drag the model to look around.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
          {/* stage */}
          <div ref={stageRef} className="relative h-[56svh] min-h-[360px] overflow-hidden rounded-lg bg-white lg:h-[74svh] lg:min-h-[560px]">
            <BuildCanvas step={step} replayKey={replayKey} />
            <div className="pointer-events-none absolute left-4 top-3 flex items-center gap-2 text-[12px] font-medium text-char">
              <span className="h-1.5 w-1.5 rounded-full bg-blue" />
              {s.station}
            </div>
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              disabled={step === 0}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-char/10 bg-white px-2.5 py-1 text-[12px] text-char transition-colors hover:border-char/25 disabled:hidden"
            >
              <RotateCcw size={12} aria-hidden /> Replay step
            </button>
            <p className="pointer-events-none absolute bottom-3 left-4 hidden text-[12px] text-mute md:block">Drag to turn · double-click to reset</p>
          </div>

          {/* step card */}
          <div className="flex flex-col rounded-lg bg-white p-5 md:p-6">
            <p className="text-[13px] text-mute tabular-nums">
              Step {step + 1} of {STEPS.length}
            </p>
            <div aria-live="polite" className="min-h-[210px]">
              <h2 className="sw-h mt-2 text-[28px] leading-tight text-char">{s.title}</h2>
              <p className="mt-3 text-[15px] leading-6 text-slate">{s.text}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="In this step">
                {s.items.map((it) => (
                  <li key={it} className="rounded-full bg-blue/[0.07] px-3 py-1 text-[13px] text-blue">
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-2 lg:mt-auto">
              <button type="button" aria-label="Previous step" onClick={() => go(-1)} disabled={step === 0} className={`${arrowBtn} bg-panel text-char hover:bg-char hover:text-white`}>
                <ArrowLeft size={18} aria-hidden />
              </button>
              {step < last ? (
                <button type="button" onClick={() => go(1)} className="flex h-11 flex-1 items-center justify-between rounded-lg bg-blue px-4 text-[15px] text-white transition-colors hover:bg-char focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
                  <span className="truncate">Next: {STEPS[step + 1].title}</span>
                  <ArrowRight size={18} aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={() => setStep(0)} className="flex h-11 flex-1 items-center justify-between rounded-lg bg-char px-4 text-[15px] text-white transition-colors hover:bg-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
                  Start again
                  <RotateCcw size={16} aria-hidden />
                </button>
              )}
            </div>

            {/* progress: one tick per step */}
            <ol className="mt-4 flex gap-1" aria-label="Steps">
              {STEPS.map((st, i) => (
                <li key={st.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    aria-label={`Step ${i + 1}: ${st.title}`}
                    aria-current={i === step ? "step" : undefined}
                    className="group block w-full py-2 focus-visible:outline-2 focus-visible:outline-blue"
                  >
                    <span className={`block h-1 rounded-full transition-colors ${i <= step ? "bg-blue" : "bg-char/10 group-hover:bg-char/25"}`} />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-mute">Simplified diagram. Profile sections and proportions are indicative, not the system drawings.</p>
      </div>
    </section>
  );
}
