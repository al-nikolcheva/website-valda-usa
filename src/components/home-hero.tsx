"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  const { scrollY } = useScroll();
  // hero stays pinned while the page scrolls over it — gently zoom + dissolve as it is covered
  const scale = useTransform(scrollY, [0, 900], [1.2, 1.34]);
  const imgY = useTransform(scrollY, [0, 900], ["0%", "10%"]);
  const contentOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const contentY = useTransform(scrollY, [0, 420], ["0%", "-14%"]);

  return (
    <section className="pointer-events-none fixed inset-0 -z-10 h-[100svh] overflow-hidden bg-ink">
      <motion.div style={{ scale, y: imgY }} className="absolute inset-0">
        <video
          src="/media/hero-loop.mp4"
          poster="/images/hero-gora.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-[10%_50%]"
        />
      </motion.div>

      {/* darken shade for legibility */}
      <div className="absolute inset-0 bg-ink/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/20" />

      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="pointer-events-auto absolute inset-0 flex flex-col justify-end">
        <Container className="pb-16 md:pb-20">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="grid items-end gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-20"
          >
            {/* left — eyebrow + headline + actions */}
            <div>
              <p className="mb-7 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-bright" /> A European manufacturer, delivered worldwide
              </p>
              <h1 className="headline text-[clamp(2.7rem,6.6vw,5.6rem)] leading-[0.98] text-white">
                Windows, doors and facades, engineered in Europe.
              </h1>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Button href="/contact" variant="blue">Get a quote <ArrowRight size={16} /></Button>
                <Link href="/projects" className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/85 underline-offset-4 hover:text-white hover:underline">
                  See our projects
                </Link>
              </div>
            </div>

            {/* right — supporting line + credentials */}
            <div className="lg:pb-2">
              <p className="max-w-md text-[16px] leading-[1.7] text-white/80">
                Family-owned since 1998. High-end aluminium and PVC systems, made in our own European factories and delivered factory direct, worldwide.
              </p>
              <div className="mt-7 flex gap-10 border-t border-white/15 pt-5">
                <Stat n="26+" k="Years" />
                <Stat n="3" k="Factories" />
                <Stat n="Worldwide" k="Delivered" />
              </div>
            </div>
          </motion.div>
        </Container>
      </motion.div>
    </section>
  );
}

function Stat({ n, k }: { n: string; k: string }) {
  return (
    <div>
      <p className="headline text-[clamp(1.4rem,2.4vw,2rem)] leading-none text-white">{n}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">{k}</p>
    </div>
  );
}
