"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PROJECTS, type Project } from "@/lib/projects";

const FILTERS = ["All", "Residential", "Multifamily", "Institutional"] as const;

function bucket(market: string) {
  const m = market.toLowerCase();
  if (m.includes("institutional")) return "Institutional";
  if (m.includes("multifamily") || m.includes("mixed")) return "Multifamily";
  return "Residential";
}

function Meta({ p, i, light = false }: { p: Project; i: number; light?: boolean }) {
  return (
    <div className={`mt-4 flex items-start justify-between gap-4 border-t pt-4 ${light ? "border-white/20" : "border-ink/12"}`}>
      <div>
        <p className={`caption ${light ? "text-white/65" : "text-slate"}`}>
          {String(i + 1).padStart(2, "0")} · {p.market}
        </p>
        <h3 className={`mt-1.5 headline text-[clamp(1.3rem,2.4vw,1.9rem)] leading-[1.05] ${light ? "text-white" : "text-ink"}`}>
          {p.name}
        </h3>
      </div>
      <p className={`shrink-0 text-right text-[13px] ${light ? "text-white/70" : "text-slate"}`}>
        {p.location}
        <span className={`mt-0.5 block font-mono text-[11px] ${light ? "text-white/50" : "text-slate/70"}`}>{p.year}</span>
      </p>
    </div>
  );
}

function Card({ p, i, ratio }: { p: Project; i: number; ratio: string }) {
  return (
    <Link href={`/projects/${p.slug}`} className="group block">
      <div className={`relative ${ratio} overflow-hidden rounded-2xl`}>
        <Image
          src={p.img}
          alt={p.name}
          fill
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          sizes="(max-width:768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight size={18} className="text-ink" />
        </span>
      </div>
      <Meta p={p} i={i} />
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
  const left = rest.filter((_, i) => i % 2 === 0);
  const right = rest.filter((_, i) => i % 2 === 1);

  return (
    <div>
      {/* filter tabs */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-ink/10 pb-8">
        {FILTERS.map((f) => {
          const active = filter === f;
          const count = f === "All" ? PROJECTS.length : PROJECTS.filter((p) => bucket(p.market) === f).length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
                active ? "bg-blue text-white" : "border border-mist text-slate hover:border-blue/40 hover:text-ink"
              }`}
            >
              {f}
              <span className={`ml-1.5 font-mono text-[10px] ${active ? "text-white/70" : "text-slate/60"}`}>{count}</span>
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
          {/* featured */}
          {featured && (
            <Link href={`/projects/${featured.slug}`} className="group mt-12 block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:aspect-[16/8]">
                <Image
                  src={featured.img}
                  alt={featured.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.03]"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 md:p-12">
                  <div className="flex max-w-5xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="caption text-white/70">Featured · {featured.market}</p>
                      <h2 className="mt-3 headline text-[clamp(2rem,5vw,4rem)] leading-[1.02] text-white">{featured.name}</h2>
                      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">{featured.summary}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-ink transition-transform group-hover:translate-x-1">
                      View project <ArrowUpRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* staggered asymmetric grid */}
          <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 md:gap-y-20">
            <div className="space-y-14 md:space-y-20">
              {left.map((p, i) => (
                <Card key={p.slug} p={p} i={list.indexOf(p)} ratio={i % 2 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"} />
              ))}
            </div>
            <div className="space-y-14 md:mt-28 md:space-y-20">
              {right.map((p, i) => (
                <Card key={p.slug} p={p} i={list.indexOf(p)} ratio={i % 2 === 0 ? "aspect-[4/3]" : "aspect-[4/5]"} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
