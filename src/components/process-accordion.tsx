"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";

const STEPS = [
  { n: "01", title: "Consultation & estimation", href: "/how-we-work/consultation", img: "/images/arch-2.jpg", body: "Your drawings, wind zone and performance targets become a value-engineered system schedule and a clear estimate in USD." },
  { n: "02", title: "Design & engineering", href: "/how-we-work/design", img: "/images/arch-4.jpg", body: "Every junction, anchor and glazing spec is detailed and sealed to the relevant Florida Product Approval." },
  { n: "03", title: "Manufacturing", href: "/how-we-work/manufacturing", img: "/images/project-mona-3.jpg", body: "Fabrication, glazing and quality control happen under one European roof. Every HVHZ unit is checked before it ships." },
  { n: "04", title: "Logistics & delivery", href: "/how-we-work/logistics", img: "/images/project-milwaukee-1.jpg", body: "We pack for the Atlantic and ship factory direct, coordinating freight and US delivery to your site schedule." },
];

export function ProcessAccordion() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, Math.floor(p * STEPS.length * 0.999)));
    setActive(i);
  });

  const goToStep = (i: number) => {
    setActive(i);
    const el = ref.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const t = (i + 0.5) / STEPS.length;
    window.scrollTo({ top: el.offsetTop + t * scrollable, behavior: "smooth" });
  };

  const current = STEPS[active];

  return (
    <div ref={ref} className="relative md:h-[300vh]">
      <div className="md:sticky md:top-[92px]">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {/* left — media that swaps per active step */}
          <div className="flex flex-col md:order-1">
            <div className="relative h-[46vh] overflow-hidden rounded-2xl bg-mist md:h-[62vh]">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.05 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={s.img} alt={s.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 45vw" />
                </motion.div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <span className="font-mono text-[12px] tracking-[0.12em] text-white/70">{current.n} / 0{STEPS.length}</span>
                <h3 className="mt-1 headline text-2xl text-white md:text-3xl">{current.title}</h3>
              </div>
              {/* progress bar */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                <motion.div
                  className="h-full bg-blue-bright"
                  animate={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>

          {/* right — steps */}
          <div className="flex flex-col md:order-2 md:justify-center">
            {STEPS.map((s, i) => {
              const isActive = active === i;
              return (
                <div key={s.n} className="border-b border-ink/15 first:border-t">
                  <button onClick={() => goToStep(i)} className="flex w-full items-center gap-6 py-6 text-left">
                    <span className={`caption shrink-0 transition-colors ${isActive ? "text-blue" : "text-slate/60"}`}>{s.n}/</span>
                    <span className={`headline flex-1 text-[clamp(1.3rem,2.4vw,1.9rem)] transition-colors duration-300 ${isActive ? "text-ink" : "text-ink/35"}`}>
                      {s.title}
                    </span>
                    <Plus size={24} className={`shrink-0 transition-all duration-300 ${isActive ? "rotate-45 text-blue" : "text-ink/35"}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pl-[3.1rem]">
                          <p className="max-w-md text-[15px] leading-[1.8] text-slate">{s.body}</p>
                          <Link href={s.href} className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-blue underline-offset-4 hover:underline">
                            Read more <ArrowRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            <div className="mt-9">
              <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full bg-blue px-7 text-[14px] font-medium text-white transition-colors hover:bg-blue-bright">
                Start your next project <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
