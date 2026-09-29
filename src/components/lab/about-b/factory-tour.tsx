"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { COMPANY } from "@/lib/company";
import { cn } from "@/lib/utils";

type Visual =
  | { kind: "cutout"; src: string; alt: string }
  | { kind: "photo"; src: string; alt: string }
  | { kind: "ral" };

// One visual per in-house stage, in COMPANY.inHouse order.
const VISUALS: Visual[] = [
  { kind: "cutout", src: "/products/vision.png", alt: "Cutaway of a VALDA PVC window profile" },
  { kind: "cutout", src: "/products/masterline-8.png", alt: "Cutaway of an aluminum window profile" },
  { kind: "photo", src: COMPANY.images.floor, alt: "The VALDA factory floor" },
  { kind: "ral" },
  { kind: "photo", src: COMPANY.images.facility, alt: "Aerial view of the VALDA factory" },
];

// Real RAL reference colours for the coating fan.
const RAL = [
  { code: "9016", hex: "#f1f0ea" },
  { code: "1015", hex: "#e6d2b5" },
  { code: "7035", hex: "#c5c7c4" },
  { code: "3004", hex: "#6b1c23" },
  { code: "6005", hex: "#0f4336" },
  { code: "5011", hex: "#1a2b3c" },
  { code: "8017", hex: "#45302b" },
  { code: "7016", hex: "#383e42" },
  { code: "9005", hex: "#0a0a0d" },
];

const STAGES = COMPANY.inHouse;
const pad = (i: number) => String(i + 1).padStart(2, "0");

/** A fan of RAL colour chips, built in CSS. */
function RalFan({ compact = false }: { compact?: boolean }) {
  const spread = compact ? 9 : 11;
  const mid = (RAL.length - 1) / 2;
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden bg-panel pb-[12%]">
      <div className={cn("relative", compact ? "h-[62%] w-[26%]" : "h-[64%] w-[22%]")}>
        {RAL.map((c, i) => (
          <div
            key={c.code}
            className="absolute inset-0 origin-[50%_92%] overflow-hidden rounded-lg bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]"
            style={{ transform: `rotate(${(i - mid) * spread}deg)`, zIndex: i }}
          >
            <div className="h-[78%]" style={{ background: c.hex }} />
            <p className="px-2 pt-1.5 text-[10px] leading-4 text-char md:text-[12px]">RAL {c.code}</p>
          </div>
        ))}
      </div>
      <p className="absolute left-5 top-5 text-[14px] leading-[22px] text-mute">Any RAL colour</p>
    </div>
  );
}

function StageVisual({ v, compact = false }: { v: Visual; compact?: boolean }) {
  if (v.kind === "ral") return <RalFan compact={compact} />;
  if (v.kind === "cutout") {
    return (
      <div className="absolute inset-0 bg-panel">
        <Image src={v.src} alt={v.alt} fill className="object-contain p-[10%]" sizes="(max-width:1024px) 100vw, 55vw" />
      </div>
    );
  }
  return <Image src={v.src} alt={v.alt} fill className="object-cover" sizes="(max-width:1024px) 100vw, 55vw" />;
}

/** Desktop: pinned, scroll-driven tour. Mobile: a plain stacked list. */
export function FactoryTour() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(STAGES.length - 1, Math.max(0, Math.floor(p * STAGES.length)));
    setActive((prev) => (prev === i ? prev : i));
  });

  const stage = STAGES[active];

  return (
    <>
      {/* ── desktop ─────────────────────────────── */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${STAGES.length * 90}vh` }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="grid w-full grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-16">
            {/* left: stage copy + progress */}
            <div className="flex min-h-[460px] flex-col justify-between">
              <div>
                <p className="text-[14px] leading-[22px] text-mute">
                  Stage {pad(active)} of {pad(STAGES.length - 1)}
                </p>
                <div className="relative mt-8 min-h-[190px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={stage.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h3 className="sw-h text-[clamp(2.6rem,4.6vw,4rem)] text-char">{stage.title}</h3>
                      <p className="mt-5 max-w-[420px] text-[18px] leading-7 text-slate">{stage.body}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <ol className="mt-10 space-y-0 border-t border-char/10">
                {STAGES.map((s, i) => (
                  <li
                    key={s.title}
                    className={cn(
                      "flex items-center gap-4 border-b border-char/10 py-3 text-[14px] leading-[22px] transition-colors duration-300",
                      i === active ? "text-char" : "text-mute",
                    )}
                  >
                    <span className="w-6">{pad(i)}</span>
                    <span className="flex-1">{s.title}</span>
                    <span className="relative h-px w-16 bg-char/10">
                      <span
                        className={cn(
                          "absolute inset-y-0 left-0 bg-char transition-[width] duration-500",
                          i < active ? "w-full" : i === active ? "w-1/2" : "w-0",
                        )}
                      />
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* right: crossfading visual */}
            <div className="relative aspect-[4/3.4] max-h-[78vh] w-full overflow-hidden rounded-lg bg-panel">
              {VISUALS.map((v, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.04 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden={i !== active}
                >
                  <StageVisual v={v} />
                </motion.div>
              ))}
              <span className="absolute bottom-4 left-4 z-10 rounded-md bg-white px-2 py-1 text-[12px] text-char">
                /{pad(active)} {stage.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── mobile / tablet ─────────────────────── */}
      <ol className="space-y-12 lg:hidden">
        {STAGES.map((s, i) => (
          <li key={s.title}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-panel">
              <StageVisual v={VISUALS[i]} compact />
            </div>
            <div className="mt-5 flex items-baseline gap-4">
              <span className="text-[14px] leading-[22px] text-mute">{pad(i)}</span>
              <div>
                <h3 className="sw-h text-[28px] text-char">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-6 text-slate">{s.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
