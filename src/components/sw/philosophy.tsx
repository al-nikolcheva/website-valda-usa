"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { SwHead } from "@/components/sw/head";

/* ── Config ─────────────────────────────────────────────────── */
const QUOTE =
  "“We don’t start with a product. We start with your building, your climate and the way it needs to perform.”";
const WHO = "The VALDA family";
const ROLE = "Family-owned since 1998";
/* ───────────────────────────────────────────────────────────── */

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

export function Philosophy() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.3"] });
  const words = QUOTE.split(" ");

  return (
    <section className="bg-white py-28 md:py-40">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <SwHead label="Team" n="06" title="Our Philosophy" layout="centered" />

        <p ref={ref} className="sw-h mx-auto mt-14 max-w-4xl text-center text-[clamp(1.7rem,3.2vw,2.6rem)] text-char">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Word>
          ))}
        </p>

        <div className="mt-14 flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/valda-logo-ink.svg" alt="" className="h-8 w-auto" />
          </span>
          <p className="mt-4 text-[16px] font-medium text-char">{WHO}</p>
          <p className="mt-0.5 text-[14px] text-mute">{ROLE}</p>
        </div>
      </div>
    </section>
  );
}
