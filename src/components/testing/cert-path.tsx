"use client";

import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, ClipboardCheck, Factory, FileText, FlaskConical, Tag, type LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FlaskConical,
    title: "Independent lab",
    body: "An accredited, independent lab tests full-size specimens: impact, cycling, air, water and structural load.",
  },
  {
    icon: FileText,
    title: "Test report",
    body: "The lab issues a signed report describing exactly what was tested: sizes, glass, anchors and results.",
  },
  {
    icon: ClipboardCheck,
    title: "Evaluation",
    body: "An evaluation entity or Florida-registered engineer checks the reports against the Florida Building Code.",
  },
  {
    icon: BadgeCheck,
    title: "Approval",
    body: "The product gets a Florida Product Approval (an FL number), or a Miami-Dade NOA for the HVHZ. It fixes the maximum size, the design pressure and the installation drawings.",
  },
  {
    icon: Factory,
    title: "Factory audits",
    body: "A third-party quality assurance agency audits the factory, so every unit matches the one that was tested. For VALDA's own systems, that agency is NAMI.",
  },
  {
    icon: Tag,
    title: "On site",
    body: "Each unit is labelled and installed to the approved drawings, and the building inspector checks it against the approval.",
  },
];

export function CertPath() {
  const reduce = useReducedMotion();
  return (
    <ol className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-x-3">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        return (
          <li key={s.title} className="flex flex-col">
            <div className="relative mb-6 h-px bg-char/10">
              <motion.span
                className="absolute inset-0 origin-left bg-blue"
                initial={{ scaleX: reduce ? 1 : 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: reduce ? 0 : 0.35 * i, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full bg-blue"
                initial={{ opacity: reduce ? 1 : 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.3, delay: reduce ? 0 : 0.35 * i }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-char">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <span className="text-[14px] leading-[22px] text-mute tabular-nums">/{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-5 text-[18px] font-medium leading-6 text-char">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-slate">{s.body}</p>
          </li>
        );
      })}
    </ol>
  );
}
