"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/primitives";

type Milestone = { year: string; title: string; body: string; img: string; pos?: string };

export function HeritageTimeline({ milestones }: { milestones: Milestone[] }) {
  const [active, setActive] = useState(0);
  const n = milestones.length;
  const m = milestones[active];
  const go = (d: number) => setActive((a) => Math.min(n - 1, Math.max(0, a + d)));

  return (
    <section id="history" className="relative min-h-[82vh] overflow-hidden bg-ink text-white">
      {/* per-year background — crossfades */}
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
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/30 to-transparent" />

      <Container className="relative z-10 flex min-h-[82vh] flex-col justify-center py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Our story</p>

        <div className="mt-8 min-h-[300px] max-w-2xl md:min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="headline text-[clamp(4rem,12vw,9rem)] leading-[0.85] text-white">{m.year}</div>
              <h3 className="mt-4 headline text-2xl text-white md:text-4xl">{m.title}</h3>
              <p className="mt-5 max-w-xl text-[16px] leading-[1.85] text-white/80 md:text-[17px]">{m.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* slider controls */}
        <div className="mt-12 flex items-center gap-6 border-t border-white/15 pt-6">
          <div className="flex flex-1 justify-between">
            {milestones.map((mm, i) => (
              <button
                key={mm.year}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${mm.year} — ${mm.title}`}
                className="group flex flex-col items-center gap-2.5"
              >
                <span className={`font-mono text-[12px] tracking-wide transition-colors md:text-[13px] ${i === active ? "text-white" : "text-white/40 group-hover:text-white/80"}`}>
                  {mm.year}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === active ? "scale-125 bg-blue-bright" : "bg-white/25 group-hover:bg-white/50"}`} />
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={active === 0}
              aria-label="Previous year"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={active === n - 1}
              aria-label="Next year"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
