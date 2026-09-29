"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Milestone = { year: string; title: string; body: string; img: string; pos?: string };

/**
 * Year-by-year heritage slider on an inset dark panel (Scandiwest style).
 * Background photo crossfades per milestone; years along the bottom are clickable.
 */
export function HeritageTimeline({ milestones, n = "03" }: { milestones: Milestone[]; n?: string }) {
  const [active, setActive] = useState(0);
  const count = milestones.length;
  const m = milestones[active];
  const go = (d: number) => setActive((a) => Math.min(count - 1, Math.max(0, a + d)));

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-lg bg-white text-char transition-colors duration-300 hover:bg-white/85 disabled:pointer-events-none disabled:opacity-30";

  return (
    <section id="history" className="bg-white px-2 pt-2 md:px-4 md:pt-4">
      <div className="relative min-h-[82svh] overflow-hidden rounded-lg bg-char text-white">
        {/* per-year background, crossfades */}
        <AnimatePresence>
          <motion.div
            key={m.img}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image src={m.img} alt="" fill className="object-cover" style={{ objectPosition: m.pos ?? "center" }} sizes="100vw" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[82svh] w-full max-w-[1360px] flex-col justify-between px-5 pb-6 pt-20 md:px-8 md:pb-8 md:pt-28">
          <div className="flex items-baseline justify-between text-[14px] leading-[22px] text-white/55">
            <p>Our history</p>
            <p>/{n}</p>
          </div>

          <div className="mt-12 min-h-[300px] max-w-2xl md:min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="sw-h text-[clamp(4rem,11vw,8rem)] leading-[0.9] text-white">{m.year}</p>
                <h3 className="sw-h mt-5 text-[28px] text-white md:text-[32px]">{m.title}</h3>
                <p className="mt-3 max-w-xl text-[16px] leading-6 text-white/75">{m.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* slider controls */}
          <div className="mt-12 flex flex-col gap-4 rounded-lg bg-white/10 p-3 backdrop-blur-md md:flex-row md:items-center md:gap-6 md:p-4">
            <div className="grid flex-1 grid-cols-6 gap-1">
              {milestones.map((mm, i) => {
                const on = i === active;
                return (
                  <button
                    key={mm.year}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${mm.year}, ${mm.title}`}
                    aria-pressed={on}
                    className={cn(
                      "rounded-md py-2 text-center text-[13px] leading-[22px] transition-colors duration-300 md:text-[14px]",
                      on ? "bg-white text-char" : "text-white/55 hover:text-white",
                    )}
                  >
                    {mm.year}
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-2 md:justify-end">
              <span className="text-[14px] text-white/55 md:hidden">
                /{String(active + 1).padStart(2, "0")} of /{String(count).padStart(2, "0")}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous year" className={arrow}>
                  <ArrowLeft size={16} />
                </button>
                <button type="button" onClick={() => go(1)} disabled={active === count - 1} aria-label="Next year" className={arrow}>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
