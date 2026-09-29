"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    tab: "Consultation",
    title: "Consultation & estimation",
    body: "Your drawings, wind zone and performance targets in. A value-engineered schedule and a clear USD estimate back.",
    img: "/images/consultation.webp",
  },
  {
    tab: "Design",
    title: "Design & engineering",
    body: "Every junction, anchor and glazing detail resolved and aligned to the relevant Florida Product Approval.",
    img: "/images/design-office.webp",
  },
  {
    tab: "Manufacturing",
    title: "Manufacturing",
    body: "Fabrication, glazing and quality control under one roof in Europe. Every HVHZ unit checked before it ships.",
    img: "/images/manufacturing.webp",
  },
  {
    tab: "Logistics",
    title: "Logistics & delivery",
    body: "Packed for the Atlantic and shipped factory direct, coordinated to your site schedule.",
    img: "/images/logistics.webp",
  },
];

const pad = (i: number) => String(i).padStart(2, "0");

export function ProcessShowcase({ n = "05" }: { n?: string }) {
  const [active, setActive] = useState(0);
  const s = STEPS[active];

  return (
    <section className="bg-panel py-28 md:py-36">
      <Container>
        {/* header */}
        <Reveal>
          <SwHead label="How we work" n={n} layout="stacked" title="A measured process, end to end." />
          <p className="mt-6 max-w-md text-[16px] leading-6 text-slate">
            One partner from the first drawing to the installed window, and one number for warranty.
          </p>
        </Reveal>

        {/* image + active step card */}
        <div className="mt-14 grid gap-3 md:mt-20 md:grid-cols-[1.4fr_1fr]">
          <div className="relative h-[300px] overflow-hidden rounded-lg bg-white md:h-[520px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={s.img}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image src={s.img} alt={s.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 60vw" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex min-h-[260px] flex-col rounded-lg bg-white p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-1 flex-col justify-between gap-10"
              >
                <span className="text-[14px] leading-[22px] text-mute">
                  Step /{pad(active + 1)} of /{pad(STEPS.length)}
                </span>
                <div>
                  <h3 className="sw-h max-w-md text-[28px] text-char md:text-[32px]">{s.title}</h3>
                  <p className="mt-3 max-w-md text-[16px] leading-6 text-slate">{s.body}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* clickable steps */}
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {STEPS.map((st, i) => {
            const on = active === i;
            return (
              <button
                key={st.tab}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-lg p-4 text-left transition-colors duration-300 md:p-5",
                  on ? "bg-char" : "bg-white hover:bg-white/70",
                )}
              >
                <span className="flex flex-col gap-1">
                  <span className={cn("text-[14px] leading-[22px]", on ? "text-white/55" : "text-mute")}>/{pad(i + 1)}</span>
                  <span className={cn("text-[15px] font-medium leading-6 md:text-[16px]", on ? "text-white" : "text-char")}>
                    {st.tab}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    on ? "bg-white text-char" : "bg-panel text-char",
                  )}
                >
                  <Plus size={16} className={cn("transition-transform duration-300", on && "rotate-45")} />
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
