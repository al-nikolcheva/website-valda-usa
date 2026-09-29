"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LayoutGrid, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PROJECTS, type Project } from "@/lib/projects";

const FILTERS = ["All", "Residential", "Multifamily", "Institutional"] as const;

function bucket(market: string) {
  const m = market.toLowerCase();
  if (m.includes("institutional")) return "Institutional";
  if (m.includes("multifamily") || m.includes("mixed")) return "Multifamily";
  return "Residential";
}

function Chips({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-block rounded-md bg-panel px-2 py-0.5 text-[12px] text-char">Completed {p.year}</span>
      <span className="inline-block rounded-md bg-panel px-2 py-0.5 text-[12px] text-char">{p.market}</span>
    </div>
  );
}

// Grid card: white card holding a rounded photo and the project info.
function Card({ p }: { p: Project }) {
  return (
    <Link href={`/projects/${p.slug}`} className="group flex h-full flex-col rounded-lg bg-white p-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={p.img}
          alt={p.name}
          fill
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 50vw"
        />
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <Chips p={p} />
        <h3 className="sw-h mt-4 text-[24px] text-char md:text-[28px]">{p.name}</h3>
        <p className="mt-3 flex items-center gap-2 text-[14px] text-char/80">
          <MapPin size={15} className="shrink-0 text-mute" /> {p.location}
        </p>
        <p className="mt-1.5 flex items-start gap-2 text-[14px] text-char/80">
          <LayoutGrid size={15} className="mt-[3px] shrink-0 text-mute" /> {p.systems}
        </p>
      </div>
    </Link>
  );
}

export function ProjectsIndex() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const list = useMemo(
    () => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => bucket(p.market) === filter)),
    [filter]
  );

  const [featured, ...rest] = list;

  return (
    <div>
      {/* filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          const count = f === "All" ? PROJECTS.length : PROJECTS.filter((p) => bucket(p.market) === f).length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className={`inline-flex h-10 items-center rounded-lg px-4 text-[14px] transition-colors duration-300 ${
                active ? "bg-char text-white" : "bg-white text-char hover:text-blue"
              }`}
            >
              {f}
              <span className={`ml-2 text-[12px] ${active ? "text-white/55" : "text-mute"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* featured: large photo with floating white info card */}
          {featured && (
            <Link
              href={`/projects/${featured.slug}`}
              className="group relative mt-8 block h-[78svh] min-h-[560px] overflow-hidden rounded-lg md:mt-10 md:max-h-[760px]"
            >
              <Image
                src={featured.img}
                alt={`${featured.name}, ${featured.location}`}
                fill
                priority
                className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 1360px"
              />
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue md:right-6 md:top-6">
                <ArrowUpRight size={16} />
              </span>
              <div className="absolute bottom-3 left-3 w-[min(calc(100%-24px),380px)] rounded-lg bg-white p-6 md:bottom-6 md:left-6 md:p-7">
                <Chips p={featured} />
                <h2 className="sw-h mt-5 text-[28px] text-char md:text-[32px]">{featured.name}</h2>
                <p className="mt-3 text-[16px] leading-6 text-slate">{featured.summary}</p>
                <p className="mt-4 flex items-center gap-2 text-[14px] text-char/80">
                  <MapPin size={15} className="shrink-0 text-mute" /> {featured.location}
                </p>
                <p className="mt-2 flex items-start gap-2 text-[14px] text-char/80">
                  <LayoutGrid size={15} className="mt-[3px] shrink-0 text-mute" /> {featured.systems}
                </p>
                <span className="mt-6 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-char px-5 text-[14px] text-white transition-colors duration-300 group-hover:bg-black">
                  View project <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          )}

          {/* grid */}
          {rest.length > 0 && (
            <div className="mt-3 grid gap-3 md:mt-4 md:grid-cols-2 md:gap-4">
              {rest.map((p) => (
                <Card key={p.slug} p={p} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
