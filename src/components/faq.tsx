"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { FAQS } from "@/lib/faqs";
import { cn } from "@/lib/utils";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { SwButton } from "@/components/sw/button";
import { AskRow } from "@/components/sw/ask-row";

/** Scandiwest accordion: question rows with a round plus that rotates open. Built for a bg-panel section. */
export function FaqAccordion({ items = FAQS }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-char/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-char/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="text-[18px] font-medium leading-7 text-char md:text-[20px]">{item.q}</span>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-char transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              >
                <Plus size={16} />
              </span>
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
                  <p className="max-w-2xl pb-7 text-[15px] leading-6 text-char/65">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <AskRow />
    </div>
  );
}

export function FaqSection({ n = "02" }: { n?: string }) {
  return (
    <section className="bg-panel py-28 md:py-36">
      <Container>
        <Reveal>
          <SwHead label="Questions" n={n} layout="stacked" title="The practical side of buying factory direct." />
        </Reveal>
        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {/* ask-a-question card */}
          <div className="order-2 lg:order-1">
            <div className="rounded-lg bg-white p-6 md:p-8 lg:sticky lg:top-28">
              <p className="text-[18px] font-medium text-char">Still have a question?</p>
              <p className="mt-2 text-[15px] leading-6 text-char/65">
                Tell us about your project, your openings or the performance you need, and we will come back within one business day.
              </p>
              <SwButton href="/contact" className="mt-6">Talk to our team</SwButton>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <FaqAccordion />
          </div>
        </div>
      </Container>
    </section>
  );
}
