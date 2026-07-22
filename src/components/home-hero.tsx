"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  const { scrollY } = useScroll();
  // hero stays pinned while the page scrolls over it — gently zoom + dissolve as it is covered
  const scale = useTransform(scrollY, [0, 900], [1, 1.14]);
  const imgY = useTransform(scrollY, [0, 900], ["0%", "10%"]);
  const contentOpacity = useTransform(scrollY, [0, 420], [1, 0]);
  const contentY = useTransform(scrollY, [0, 420], ["0%", "-14%"]);

  return (
    <section className="pointer-events-none fixed inset-0 -z-10 h-[100svh] overflow-hidden">
      <motion.div style={{ scale, y: imgY }} className="absolute inset-0">
        <Image src="/images/hero.jpg" alt="VALDA glazed facade" fill priority className="object-cover object-center brightness-[0.78]" sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/45 to-transparent" />

      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="pointer-events-auto absolute inset-0 flex flex-col justify-end">
        <Container className="pb-24 md:pb-28">
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <p className="caption text-white/80"><span className="text-blue-bright">/</span> Premium fenestration · Est. 1998</p>
            <h1 className="mt-5 max-w-3xl headline text-[clamp(2.4rem,5.6vw,4.8rem)] leading-[1.02] text-white">Windows, doors &amp; facade systems</h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/80">European-engineered, US-certified systems, delivered factory direct.</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button href="/contact" variant="blue">Get a quote <ArrowRight size={16} /></Button>
              <Link href="/projects" className="text-[14px] font-medium text-white/85 underline-offset-4 hover:text-white hover:underline">View projects</Link>
            </div>
          </motion.div>
        </Container>
      </motion.div>
    </section>
  );
}
