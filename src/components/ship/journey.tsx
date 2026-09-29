"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { SHIPPING_LABEL, SHIPPING_STEPS } from "@/lib/shipping";
import { STEP_SETTLE, stepAt, type Station } from "./journey/timeline";

// three.js is loaded lazily, client only
const JourneyCanvas = dynamic(() => import("./journey/journey-canvas"), { ssr: false });

const STEPS = SHIPPING_STEPS;
const N = STEPS.length;
const PLACE: Record<Station, string> = {
  factory: "Sofia, Bulgaria",
  sea: "Atlantic crossing",
  customs: "US port",
  site: "Your site, USA",
};
/** scene progress per second while easing toward a step (a step plays in about 2 s) */
const SPEED = 0.11;
/** how long Play lingers on a settled step before moving on (ms) */
const DWELL = 900;

type LenisLike = { scrollTo: (y: number, opts?: { duration?: number }) => void };

/** Scroll the page so the pinned section sits on step i (Lenis when present, else native). */
function scrollToStep(el: HTMLElement, i: number) {
  let top = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
  const range = Math.max(0, el.offsetHeight - window.innerHeight);
  const y = Math.round(top + ((i + 0.5) / N) * range);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis && typeof lenis.scrollTo === "function") lenis.scrollTo(y, { duration: reduce ? 0 : 1.1 });
  else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}

/* small true-colour flag chips for the place label */
function Flag({ kind }: { kind: "bg" | "eu" | "us" }) {
  const cls = "h-3 w-[18px] shrink-0 overflow-hidden rounded-[2px] ring-1 ring-char/10";
  if (kind === "bg")
    return (
      <svg viewBox="0 0 18 12" className={cls} aria-label="Bulgaria">
        <rect width="18" height="4" fill="#fff" />
        <rect y="4" width="18" height="4" fill="#00966e" />
        <rect y="8" width="18" height="4" fill="#d62612" />
      </svg>
    );
  if (kind === "eu")
    return (
      <svg viewBox="0 0 18 12" className={cls} aria-label="European Union">
        <rect width="18" height="12" fill="#003399" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={(9 + 3.6 * Math.cos((i / 12) * Math.PI * 2)).toFixed(2)} cy={(6 + 3.6 * Math.sin((i / 12) * Math.PI * 2)).toFixed(2)} r="0.55" fill="#ffcc00" />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 18 12" className={cls} aria-label="USA">
      <rect width="18" height="12" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={(i * 12) / 6.5} width="18" height={12 / 13} fill="#b22234" />
      ))}
      <rect width="7.6" height="6.46" fill="#3c3b6e" />
    </svg>
  );
}
const FLAGS: Record<Station, ("bg" | "eu" | "us")[]> = { factory: ["bg", "eu"], sea: ["bg", "us"], customs: ["us"], site: ["us"] };

const ctl =
  "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-char shadow-[0_1px_2px_rgba(34,34,36,0.06)] transition-colors hover:bg-char hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:pointer-events-none disabled:opacity-35";

/**
 * The journey from Bulgaria to the USA. The scroll picks the step, and the scene eases to that step's
 * finished state at its own pace, so a fast scroll never skips a step. Play walks through all five.
 */
export function ShipJourney({ n = "02" }: { n?: string }) {
  const section = useRef<HTMLElement>(null);
  const playBtn = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const story = useMotionValue(0); // scene progress (0–1), eased toward STEP_SETTLE[target]
  const target = useRef(0);
  const scrollStep = useRef(-1);
  const kickRef = useRef<() => void>(() => {});
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // ease the scene toward the target step (passes through every step in between)
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const p = story.get();
      const goal = STEP_SETTLE[target.current];
      const d = goal - p;
      if (Math.abs(d) < 0.0006 || reduce) {
        story.set(goal);
        last = 0;
        return;
      }
      const behind = Math.abs(stepAt(goal) - stepAt(p));
      const v = SPEED * (1 + 0.9 * Math.max(0, behind - 1)) * (d < 0 ? 2.2 : 1);
      const soft = 0.25 + 0.75 * Math.min(1, Math.abs(d) / 0.05); // settle gently
      story.set(p + Math.sign(d) * Math.min(Math.abs(d), v * soft * dt));
      raf = requestAnimationFrame(tick);
    };
    kickRef.current = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    kickRef.current();
    return () => cancelAnimationFrame(raf);
  }, [story, reduce]);

  const setTarget = useCallback((i: number) => {
    target.current = Math.max(0, Math.min(N - 1, i));
    kickRef.current();
  }, []);

  // the scroll only chooses the step
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const k = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    if (k !== scrollStep.current) {
      scrollStep.current = k;
      setTarget(k);
    }
  });
  useMotionValueEvent(story, "change", (p) => setStep(stepAt(p)));

  const goTo = useCallback(
    (i: number) => {
      setTarget(i);
      if (section.current) scrollToStep(section.current, Math.max(0, Math.min(N - 1, i)));
    },
    [setTarget],
  );

  // Play: move on once a step has settled and been on screen for a moment
  useEffect(() => {
    if (!playing) return;
    let settledAt = 0;
    const id = window.setInterval(() => {
      const k = target.current;
      const settled = Math.abs(story.get() - STEP_SETTLE[k]) < 0.002;
      if (!settled) {
        settledAt = 0;
        return;
      }
      if (!settledAt) settledAt = performance.now();
      if (performance.now() - settledAt < DWELL) return;
      if (k >= N - 1) {
        setPlaying(false);
        return;
      }
      settledAt = 0;
      goTo(k + 1);
    }, 120);
    // pause when the visitor takes over, or the section leaves the screen
    const stop = (e: Event) => {
      if (playBtn.current && e.target instanceof Node && playBtn.current.contains(e.target)) return;
      setPlaying(false);
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && setPlaying(false), { threshold: 0.2 });
    if (section.current) io.observe(section.current);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      io.disconnect();
    };
  }, [playing, goTo, story]);

  // ← / → step through the story while the pinned section is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > 1 || r.bottom < window.innerHeight - 1) return;
      const next = target.current + (e.key === "ArrowRight" ? 1 : -1);
      if (next < 0 || next >= N) return;
      e.preventDefault();
      goTo(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  const atEnd = step === N - 1 && !playing;
  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (target.current >= N - 1) goTo(0);
    else if (section.current) scrollToStep(section.current, target.current); // bring the story into view
    setPlaying(true);
  };
  const station = STEPS[step].station;

  return (
    <section ref={section} className="relative h-[280svh] bg-panel">
      <div className="sticky top-0 h-[100svh] overflow-hidden pt-[76px]">
        <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col px-5 md:grid md:grid-cols-[0.62fr_1fr] md:items-center md:gap-12 md:px-10">
          {/* scene */}
          <div className="relative order-1 h-[42svh] w-full shrink-0 md:order-2 md:h-[calc(100svh-124px)]">
            <JourneyCanvas progress={story} />

            <div className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 rounded-full bg-white/85 py-1 pl-2 pr-3 text-[12px] font-medium text-char backdrop-blur-sm">
              <span className="flex items-center gap-1">
                {FLAGS[station].map((k) => (
                  <Flag key={k} kind={k} />
                ))}
              </span>
              {PLACE[station]}
            </div>
            <p className="pointer-events-none absolute bottom-0 right-0 hidden items-center gap-2 text-[12px] text-mute md:flex">
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
                <path d="M4 1 1 5l3 4M14 1l3 4-3 4M1 5h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Drag to look around
            </p>
          </div>

          {/* story */}
          <div className="order-2 mt-3 md:order-1 md:mt-0">
            <div className="flex items-baseline justify-between text-[14px] text-mute md:max-w-md">
              <p>{SHIPPING_LABEL}</p>
              <p>/{n}</p>
            </div>

            {/* captions: stacked in one cell and crossfaded, so the area is never empty */}
            <div className="mt-2 grid md:mt-10" aria-live="polite">
              {STEPS.map((s, i) => {
                const on = i === step;
                return (
                  <div
                    key={s.label}
                    aria-hidden={!on}
                    className="col-start-1 row-start-1 transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : i < step ? -12 : 12}px)`, pointerEvents: on ? "auto" : "none", transitionDuration: on ? "450ms" : "180ms", transitionDelay: on ? "180ms" : "0ms" }}
                  >
                    <p className="text-[14px] text-mute">{s.label}</p>
                    <h2 className="sw-h mt-1.5 text-[clamp(1.5rem,4vw,3.25rem)] text-char md:mt-3">{s.title}</h2>
                    <p className="mt-2 max-w-md text-[14px] leading-[1.45] text-slate md:mt-4 md:text-[16px] md:leading-6">{s.body}</p>
                  </div>
                );
              })}
            </div>

            {/* step segments */}
            <nav aria-label="Journey steps" className="mt-3 md:mt-8 md:max-w-md">
              <ol className="flex gap-1.5">
                {STEPS.map((s, i) => (
                  <li key={s.label} className="flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPlaying(false);
                        goTo(i);
                      }}
                      title={s.title}
                      aria-label={`${s.label}: ${s.title}`}
                      aria-current={i === step ? "step" : undefined}
                      className="group block w-full rounded-sm pb-1 pt-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
                    >
                      <span className="block h-[3px] overflow-hidden rounded-full bg-char/10 transition-colors group-hover:bg-char/20">
                        <span className={`block h-full bg-char transition-[width] duration-500 ${i <= step ? "w-full" : "w-0"}`} />
                      </span>
                      <span className={`mt-1.5 block text-[12px] tabular-nums transition-colors ${i === step ? "text-char" : "text-mute group-hover:text-char"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            {/* watch it without scrolling */}
            <div className="mt-3 flex items-center gap-2 md:mt-6 md:max-w-md">
              {!reduce && (
                <button
                  ref={playBtn}
                  type="button"
                  onClick={togglePlay}
                  aria-pressed={playing}
                  className="flex h-11 items-center gap-2 rounded-lg bg-blue px-4 text-[14px] font-medium text-white transition-colors hover:bg-char focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                >
                  {playing ? <Pause size={16} aria-hidden /> : atEnd ? <RotateCcw size={16} aria-hidden /> : <Play size={16} aria-hidden />}
                  {playing ? "Pause" : atEnd ? "Replay" : "Play the journey"}
                </button>
              )}
              <button
                type="button"
                aria-label="Previous step"
                disabled={step === 0}
                onClick={() => {
                  setPlaying(false);
                  goTo(target.current - 1);
                }}
                className={ctl}
              >
                <ArrowLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                disabled={step === N - 1}
                onClick={() => {
                  setPlaying(false);
                  goTo(target.current + 1);
                }}
                className="flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-[14px] font-medium text-char shadow-[0_1px_2px_rgba(34,34,36,0.06)] transition-colors hover:bg-char hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:pointer-events-none disabled:opacity-35"
              >
                Next step
                <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
