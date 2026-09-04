"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Plus, MousePointerClick } from "lucide-react";
import { Container, Reveal } from "@/components/primitives";

const STEPS = [
  {
    tab: "Consultation",
    title: "Consultation & estimation",
    body: "Your drawings, wind zone and performance targets in. A value-engineered schedule and a clear USD estimate back.",
    img: "/images/consultation.png",
  },
  {
    tab: "Design",
    title: "Design & engineering",
    body: "Every junction, anchor and glazing detail resolved and aligned to the relevant Florida Product Approval.",
    img: "/images/design-office.png",
  },
  {
    tab: "Manufacturing",
    title: "Manufacturing",
    body: "Fabrication, glazing and quality control under one roof in Europe. Every HVHZ unit checked before it ships.",
    img: "/images/manufacturing.png",
  },
  {
    tab: "Logistics",
    title: "Logistics & delivery",
    body: "Packed for the Atlantic and shipped factory direct, coordinated to your site schedule.",
    img: "/images/logistics.png",
  },
];

export function ProcessShowcase() {
  const [active, setActive] = useState(0);
  const s = STEPS[active];

  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        {/* header */}
        <Reveal>
          <div className="grid items-end gap-6 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">How we work</p>
              <h2 className="mt-6 headline text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.08] text-ink">
                A measured process, end to end.
              </h2>
            </div>
            <p className="max-w-md text-[16px] leading-[1.8] text-slate md:justify-self-end">
              One partner from the first drawing to the installed window, and one number for warranty.
            </p>
          </div>
        </Reveal>

        {/* image + active step text */}
        <div className="mt-12 grid items-stretch gap-10 md:mt-14 md:grid-cols-2 md:gap-16">
          <div className="relative h-[340px] overflow-hidden rounded-2xl bg-mist md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={s.img}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image src={s.img} alt={s.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-mono text-[12px] tracking-wide text-blue">0{active + 1} / 04</span>
                <h3 className="mt-4 max-w-md headline text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.1] text-ink">
                  {s.title}
                </h3>
                <p className="mt-6 max-w-md text-[16px] leading-[1.85] text-slate">{s.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* clickable steps */}
        <div className="mt-14">
          <div className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate">
            <MousePointerClick size={13} className="text-blue" />
            Select a stage
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STEPS.map((st, i) => (
              <button
                key={st.tab}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={`group flex items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-200 ${
                  active === i
                    ? "border-blue bg-blue/[0.06] shadow-[0_10px_30px_-18px_rgba(31,78,140,0.6)]"
                    : "border-ink/12 hover:-translate-y-0.5 hover:border-ink/30 hover:bg-paper"
                }`}
              >
                <span className="flex flex-col gap-1.5">
                  <span className={`font-mono text-[11px] transition-colors ${active === i ? "text-blue" : "text-slate"}`}>
                    0{i + 1}
                  </span>
                  <span className={`text-[15px] font-medium transition-colors ${active === i ? "text-ink" : "text-slate group-hover:text-ink"}`}>
                    {st.tab}
                  </span>
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                    active === i ? "bg-blue text-white" : "bg-ink/[0.05] text-ink/40 group-hover:bg-ink/10 group-hover:text-ink"
                  }`}
                >
                  <Plus size={14} className={`transition-transform duration-300 ${active === i ? "rotate-45" : ""}`} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
