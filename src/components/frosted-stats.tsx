"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";

/**
 * A frosted-glass stat card that rises and sharpens over a blurred background
 * image as the section scrolls into view.
 */
export function FrostedStats({
  image,
  stats,
  label,
  title,
  index,
}: {
  image: string;
  stats: string[][];
  label: string;
  title: string;
  index?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const blurPx = useTransform(scrollYProgress, [0, 1], [18, 2]);
  const bgFilter = useMotionTemplate`blur(${blurPx}px)`;
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const cardY = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden py-28 md:py-40">
      <motion.div style={{ filter: bgFilter }} className="absolute inset-0 scale-110">
        <Image src={image} alt="" fill className="object-cover brightness-[0.55]" sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-ink/40" />

      <Container className="relative z-10">
        <SectionHead index={index} label={label} title={title} light />
        <motion.div
          style={{ scale, y: cardY, opacity: cardOpacity }}
          className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl md:p-12"
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            {stats.map(([n, l]) => (
              <div key={l}>
                <div className="headline text-4xl text-white md:text-5xl">{n}</div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
