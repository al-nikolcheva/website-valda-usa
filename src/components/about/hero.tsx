"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SwButton } from "@/components/sw/button";
import { COMPANY } from "@/lib/company";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Full-screen factory film loop. The poster image is always the base layer;
 * the video only plays (and shows) when the visitor has not asked for reduced motion.
 */
export function FactoryHero() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) {
        v.pause();
        v.style.opacity = "0";
      } else {
        v.muted = true;
        v.style.opacity = "1";
        v.play().catch(() => {
          /* autoplay blocked: the poster stays visible */
        });
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden rounded-b-lg bg-char">
      <Image
        src={COMPANY.images.poster}
        alt="Inside a VALDA factory"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
        src={COMPANY.images.film}
        poster={COMPANY.images.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />

      {/* keep the top dark for the fixed white header, and the bottom for the copy */}
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1440px] px-5 pb-8 md:px-10 md:pb-14">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="text-[14px] leading-[22px] text-white/60"
        >
          About VALDA, since {COMPANY.founded}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="sw-h mt-5 max-w-[900px] text-[clamp(2.6rem,6.4vw,5.75rem)] text-white"
        >
          Two factories. Everything made in{"‑"}house.
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="mt-8 flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-[520px] text-[17px] leading-7 text-white/80 md:text-[18px]">{COMPANY.story.lead}</p>
          <SwButton href="/contact" variant="white">
            Start a project <ArrowRight size={15} />
          </SwButton>
        </motion.div>
      </div>
    </section>
  );
}
