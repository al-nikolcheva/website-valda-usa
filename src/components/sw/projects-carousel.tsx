"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "@/lib/projects";
import { SwHead } from "@/components/sw/head";

/* â”€â”€ Config: edit homepage projects here â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TITLE = "Our Projects";
const INTRO = "Multifamily, residential and institutional work across the USA and Europe.";
// Order of the cards in the carousel.
const SLUGS = ["juneau-village", "mona-residence", "austin-residence", "new-york-residence", "gora", "american-university-malta"];
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const ITEMS = SLUGS.map((s) => PROJECTS.find((p) => p.slug === s)).filter((p): p is Project => !!p);

export function ProjectsCarousel({ n = "02" }: { n?: string }) {
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
    const card = el.querySelector("article");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 600) + 16), behavior: "smooth" });
  };

  return (
    <section className="bg-white py-28 md:py-36">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <SwHead label="Projects" n={n} title={TITLE} />
        <div className="mt-10 flex items-end justify-between gap-6">
          <p className="max-w-md text-[16px] leading-6 text-slate">{INTRO}</p>
          <div className="flex shrink-0 gap-2">
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                onClick={() => go(d)}
                disabled={d === -1 ? edge.start : edge.end}
                aria-label={d === -1 ? "Previous project" : "Next project"}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-panel text-char transition-colors hover:bg-char hover:text-white disabled:opacity-35 disabled:hover:bg-panel disabled:hover:text-char"
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
        className="mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:scroll-px-[max(40px,calc((100vw-1360px)/2))] md:px-[max(40px,calc((100vw-1360px)/2))]"
      >
        {ITEMS.map((p) => (
          <article key={p.slug} className="w-[85vw] shrink-0 snap-start md:w-[min(62vw,860px)]">
            <Link href={`/projects/${p.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                <Image
                  src={p.img}
                  alt={`${p.name}, ${p.location}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 85vw, 860px"
                />
                <span className="absolute left-4 top-4 rounded-md bg-white px-2 py-0.5 text-[12px] text-char">Completed {p.year}</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-6">
                <div>
                  <h3 className="sw-h text-[28px] text-char md:text-[32px]">{p.name}</h3>
                  <p className="mt-1 text-[14px] text-mute">{p.location} Â· {p.market}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-char text-white transition-colors group-hover:bg-blue">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
