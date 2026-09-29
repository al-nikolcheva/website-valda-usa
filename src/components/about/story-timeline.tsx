"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { cn } from "@/lib/utils";

const ITEMS = COMPANY.timeline;
const FIRST = Number(ITEMS[0].year);
const LAST = Number(ITEMS[ITEMS.length - 1].year);
const EASE = [0.22, 1, 0.36, 1] as const;

/** Position on a true time scale, so the gaps between years read honestly. */
function pos(year: string) {
  return ((Number(year) - FIRST) / (LAST - FIRST)) * 100;
}

/**
 * Timeline for About A.
 * Desktop: a single horizontal line with years placed on a real time scale;
 * click a year (or use the arrows / arrow keys) and its story opens below.
 * Mobile: a quiet vertical list.
 */
export function StoryTimeline() {
  const [active, setActive] = useState(0);
  const item = ITEMS[active];
  const go = (i: number) => setActive(Math.max(0, Math.min(ITEMS.length - 1, i)));

  return (
    <>
      {/* ── Desktop ─────────────────────────────── */}
      <div
        className="hidden md:block"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
      >
        <div className="relative px-6 pb-2 pt-10">
          {/* base line + progress */}
          <div className="relative h-px bg-char/15">
            <motion.div
              className="absolute inset-y-0 left-0 bg-char"
              animate={{ width: `${pos(item.year)}%` }}
              transition={{ duration: 0.7, ease: EASE }}
            />
            {ITEMS.map((t, i) => {
              const on = i === active;
              const passed = i <= active;
              return (
                <button
                  key={t.year}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  aria-label={`${t.year}: ${t.title}`}
                  className="group absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center p-2"
                  style={{ left: `${pos(t.year)}%` }}
                >
                  <span
                    className={cn(
                      "absolute bottom-[26px] left-1/2 -translate-x-1/2 text-[15px] leading-[22px] tabular-nums transition-colors duration-300",
                      on ? "text-char" : "text-mute group-hover:text-char",
                    )}
                  >
                    {t.year}
                  </span>
                  <span
                    className={cn(
                      "block rounded-full border transition-all duration-300",
                      on
                        ? "h-3.5 w-3.5 border-char bg-char"
                        : passed
                          ? "h-2.5 w-2.5 border-char bg-char"
                          : "h-2.5 w-2.5 border-char/30 bg-white group-hover:border-char",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* active story */}
        <div className="mt-16 grid grid-cols-[1fr_auto] items-end gap-10 lg:mt-20">
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
              >
                <p className="sw-h text-[clamp(4.5rem,9vw,8.5rem)] leading-[0.9] text-char tabular-nums">{item.year}</p>
                <div className="max-w-[560px] self-end">
                  <h3 className="sw-h text-[clamp(1.5rem,2.2vw,2rem)] text-char">{item.title}</h3>
                  <p className="mt-4 text-[17px] leading-7 text-slate">{item.body}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-3 text-[14px] leading-[22px] text-mute tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(ITEMS.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous year"
              className="grid h-[52px] w-[52px] place-items-center rounded-lg border border-char/15 text-char transition-colors hover:bg-char hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              disabled={active === ITEMS.length - 1}
              aria-label="Next year"
              className="grid h-[52px] w-[52px] place-items-center rounded-lg bg-char text-white transition-colors hover:bg-black disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────── */}
      <ol className="relative ml-1.5 border-l border-char/15 md:hidden">
        {ITEMS.map((t, i) => (
          <motion.li
            key={t.year}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.04 * i, ease: EASE }}
            className="relative pb-10 pl-7 last:pb-0"
          >
            <span className="absolute -left-[5px] top-[9px] h-2.5 w-2.5 rounded-full bg-char" />
            <p className="text-[14px] leading-[22px] text-mute tabular-nums">{t.year}</p>
            <h3 className="sw-h mt-1 text-[22px] text-char">{t.title}</h3>
            <p className="mt-2 text-[16px] leading-6 text-slate">{t.body}</p>
          </motion.li>
        ))}
      </ol>
    </>
  );
}
