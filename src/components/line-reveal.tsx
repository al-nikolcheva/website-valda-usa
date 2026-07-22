"use client";

import { motion } from "motion/react";

/**
 * Word-by-word reveal: each word slides up from behind a mask as the element
 * enters view. Use for statement headings.
 */
export function LineReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-flex overflow-hidden align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
