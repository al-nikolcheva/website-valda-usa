"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives";

/**
 * A hero that stays pinned to the viewport while the page content scrolls up
 * and over it (Archform-style). The image gently zooms and the text dissolves
 * as it is covered. All page content must be passed as children so it renders
 * on the layer above the pinned hero.
 */
export function PinnedHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image: string;
  children: React.ReactNode;
}) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 460], [1, 0]);
  const contentY = useTransform(scrollY, [0, 460], ["0%", "-12%"]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.12]);
  const imgY = useTransform(scrollY, [0, 1000], ["0%", "8%"]);

  return (
    <>
      <section className="sticky top-0 flex h-[100svh] min-h-[560px] items-end overflow-hidden">
        <motion.div style={{ scale, y: imgY }} className="absolute inset-0">
          <Image src={image} alt="" fill priority className="object-cover brightness-[0.8]" sizes="100vw" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/10" />
        <motion.div style={{ opacity, y: contentY }} className="relative z-10 w-full">
          <Container className="pb-20 pt-32">
            <p className="caption text-white/75"><span className="text-blue-bright">/</span> {eyebrow}</p>
            <h1 className="mt-5 max-w-4xl headline text-[clamp(2.4rem,5.2vw,4.4rem)] text-white">{title}</h1>
            {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{intro}</p>}
          </Container>
        </motion.div>
      </section>

      <div className="relative z-10 bg-pure">{children}</div>
    </>
  );
}
