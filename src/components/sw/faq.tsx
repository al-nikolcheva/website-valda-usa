"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SwButton } from "@/components/sw/button";
import { AskRow } from "@/components/sw/ask-row";

export function SwFaq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <div className="border-t border-char/10">
        {items.map((it, i) => {
          const on = open === i;
          return (
            <div key={it.q} className="border-b border-char/10">
              <button
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="text-[18px] font-medium leading-7 text-char md:text-[20px]">{it.q}</span>
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-char transition-transform duration-300", on && "rotate-45")}>
                  <Plus size={16} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-7 text-[15px] leading-6 text-char/65">{it.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <AskRow />
      </div>

      {/* ask-a-question card */}
      <div className="mt-10 max-w-[560px] rounded-lg bg-white p-6 md:p-8">
        <p className="text-[18px] font-medium text-char">Still have a question?</p>
        <p className="mt-2 text-[15px] leading-6 text-char/65">
          Tell us about your project, your openings or the performance you need, and we will come back within one business day.
        </p>
        <SwButton href="/contact" className="mt-6">Ask a question</SwButton>
      </div>
    </div>
  );
}
