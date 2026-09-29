"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { SwHead } from "@/components/sw/head";

/** /02 Since 1998: one-row, snap-scrolling timeline with carousel arrows. */
export function TimelineStrip({ n = "02" }: { n?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(update, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 12), behavior: "smooth" });
  };

  const last = COMPANY.timeline.length - 1;

  return (
    <section className="bg-panel py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <SwHead label="History" n={n} title={`Since ${COMPANY.founded}`} />
        <div className="mt-10 flex items-end justify-between gap-6">
          <p className="max-w-md text-[16px] leading-6 text-slate">
            From a garage and one machine to two factories and projects across the USA.
          </p>
          <div className="flex shrink-0 gap-2">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(d)}
                disabled={d === -1 ? edge.start : edge.end}
                aria-label={d === -1 ? "Earlier" : "Later"}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-char transition-colors hover:bg-char hover:text-white disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-char"
              >
                {d === -1 ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={track}
        onScroll={update}
        data-lenis-prevent
        className="mt-10 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] snap-x snap-mandatory scroll-px-5 md:scroll-px-[max(40px,calc((100vw-1360px)/2))]"
      >
        <ol className="flex w-max gap-3 px-5 md:px-[max(40px,calc((100vw-1360px)/2))]">
          {COMPANY.timeline.map((t, i) => (
            <li
              key={t.year}
              className={`flex w-[78vw] shrink-0 snap-start flex-col rounded-lg p-6 sm:w-[320px] md:min-h-[300px] md:p-7 ${
                i === last ? "bg-char text-white" : "bg-white text-char"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[14px] leading-[22px] ${i === last ? "text-white/55" : "text-mute"}`}>
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-blue" : i === last ? "bg-white/40" : "bg-mist"}`} aria-hidden />
              </div>
              <p className="sw-h mt-10 text-[56px] leading-none md:mt-auto">{t.year}</p>
              <h3 className="sw-h mt-5 text-[20px]">{t.title}</h3>
              <p className={`mt-2 text-[15px] leading-6 ${i === last ? "text-white/65" : "text-slate"}`}>{t.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
