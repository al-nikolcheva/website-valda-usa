"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { FAQS } from "@/lib/faqs";

export function FaqAccordion({ items = FAQS }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="border-t border-ink/12">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-ink/12">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex w-full items-center justify-between gap-8 py-7 text-left md:py-8"
            >
              <span className={`headline text-[clamp(1.1rem,1.8vw,1.4rem)] leading-snug transition-colors ${isOpen ? "text-blue" : "text-ink group-hover:text-blue"}`}>
                {item.q}
              </span>
              <ChevronDown
                size={22}
                className={`shrink-0 text-ink transition-transform duration-300 ${isOpen ? "rotate-180 text-blue" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-8 text-[15px] leading-[1.85] text-slate">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto w-full max-w-3xl px-6">
        <FaqAccordion />
        <div className="mt-16 text-center">
          <p className="text-[15px] text-slate">Still have a question about a specific project?</p>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium text-ink underline-offset-4 hover:text-blue"
          >
            Talk to our team <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
