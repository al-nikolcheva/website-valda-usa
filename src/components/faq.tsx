"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Plus, ArrowRight } from "lucide-react";
import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";

export const FAQS: { q: string; a: string }[] = [
  {
    q: "How do you ship windows and doors to the USA?",
    a: "We ship factory direct from Europe by sea freight to your nearest US port, with full export documentation. There is no distributor or middleman in between — the units leave our line in Bulgaria and arrive on your project.",
  },
  {
    q: "How are the units packed and protected?",
    a: "Every order is packed in custom timber crates engineered for the Atlantic crossing. Frames and insulated glass are protected and braced separately, with edge protection and moisture control, so units arrive on site in the same condition they left the factory.",
  },
  {
    q: "What are typical lead times?",
    a: "As a guide, expect roughly 10–14 weeks from approved shop drawings to delivery, depending on the system, finishes and volume. We confirm a firm schedule with your estimate and hold to it because fabrication, glazing and QC all happen under one roof.",
  },
  {
    q: "Who handles US customs and final delivery?",
    a: "We coordinate freight, customs clearance and delivery to your site schedule, with one point of contact from the factory to the installed window. You are not left managing a freight forwarder on your own.",
  },
  {
    q: "Is there a minimum order?",
    a: "No fixed minimum — we quote from a single opening to a full-building facade package. Pricing is project-based and quoted in USD.",
  },
  {
    q: "What certification documents do you provide?",
    a: "We supply Florida Product Approvals, Miami-Dade NOAs and the supporting ASTM/TAS test reports needed for permitting. Our proprietary Vista and Vision systems are approved in VALDA's own name; our Reynaers and Kömmerling systems carry their manufacturers' approvals — all ready for your permit set.",
  },
  {
    q: "How does pricing and payment work?",
    a: "You send your wind zone, opening schedule and performance targets; we return a transparent, value-engineered estimate in USD with no hidden distributor markup. Payment terms are agreed per project.",
  },
  {
    q: "What about warranty and after-sales support?",
    a: "Our systems carry a manufacturer warranty, and you get a single US point of contact for support and spares — not an overseas inbox.",
  },
];

export function FaqAccordion({ items = FAQS }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-ink/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-ink/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className={`headline text-[clamp(1.05rem,2vw,1.35rem)] transition-colors ${isOpen ? "text-blue" : "text-ink"}`}>
                {item.q}
              </span>
              <Plus
                size={20}
                className={`shrink-0 text-slate transition-transform duration-300 ${isOpen ? "rotate-45 text-blue" : ""}`}
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
                  <p className="max-w-2xl pb-7 text-[15px] leading-[1.8] text-slate">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function FaqSection({ index }: { index?: string }) {
  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <div>
            <SectionHead index={index} label="Common questions" title="Shipping, lead times & the practical bits." />
            <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-slate">
              Still have a question about a specific project?
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-blue underline-offset-4 hover:underline"
            >
              Talk to our team <ArrowRight size={15} />
            </Link>
          </div>
          <FaqAccordion />
        </div>
      </Container>
    </section>
  );
}
