"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

export function ParallaxImage({
  src,
  alt,
  className = "",
  brightness = 1,
}: {
  src: string;
  alt: string;
  className?: string;
  brightness?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[12%] h-[124%]">
        <Image src={src} alt={alt} fill className="object-cover" style={{ filter: `brightness(${brightness})` }} sizes="100vw" />
      </motion.div>
    </div>
  );
}
