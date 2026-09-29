"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

/* ── Config ─────────────────────────────────────────────────── */
const HERO_IMAGE = "/images/arch-1.jpg";
const HEADLINE = "European windows and doors, built for the US.";
// Featured project in the floating card (bottom-left).
const FEATURED = {
  href: "/projects/juneau-village",
  img: "/images/project-milwaukee-1.jpg",
  year: "2025",
  name: "Juneau Village",
  location: "Milwaukee, USA",
};
/* ───────────────────────────────────────────────────────────── */

const ease = [0.22, 1, 0.36, 1] as const;

/** Frosted-glass featured-project card (bottom-left of the hero). */
export function FeaturedCard() {
  return (
    <Link
      href={FEATURED.href}
      className="group block w-[min(92vw,340px)] rounded-lg border border-white/20 bg-black/10 p-5 text-white backdrop-blur-xl transition-colors hover:bg-white/20"
    >
      <div className="flex items-center justify-between text-[13px] text-white/75">
        <span>Featured project</span>
        <span>Completed {FEATURED.year}</span>
      </div>
      <p className="sw-h mt-6 text-[26px]">{FEATURED.name}</p>
      <p className="mt-1 text-[14px] text-white/75">{FEATURED.location}</p>
      <span className="mt-5 flex items-center justify-between border-t border-white/20 pt-4 text-[14px]">
        View project
        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/** `card` swaps the bottom-left featured-project card (defaults to the current one). */
export function HomeHero({ card }: { card?: React.ReactNode } = {}) {
  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden rounded-b-lg bg-char">
      <Image src={HERO_IMAGE} alt="Modern house glazed with VALDA aluminum windows" fill priority className="object-cover" sizes="100vw" />

      {/* soft shading for the nav (top) and the headline/card (bottom) */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/45 to-transparent" />

      {/* giant wordmark */}
      <motion.p
        aria-hidden
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease }}
        className="pointer-events-none absolute inset-x-0 top-[9vh] select-none text-center font-display text-[24vw] font-normal leading-none tracking-[-0.02em] text-white/85 md:top-[7vh]"
      >
        VALDA
      </motion.p>

      <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1440px] flex-col-reverse items-start gap-6 px-5 pb-6 md:flex-row md:items-end md:justify-between md:px-10 md:pb-10">
        {/* floating featured-project card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease }}>
          {card ?? <FeaturedCard />}
        </motion.div>

        {/* headline, bottom-right */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="sw-h max-w-[440px] text-[clamp(2.4rem,4.2vw,3.5rem)] text-white"
        >
          {HEADLINE}
        </motion.h1>
      </div>
    </section>
  );
}
