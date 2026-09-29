"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ProfileThumb } from "@/components/profile-thumb";
import { Button } from "@/components/ui/button";
import { PRODUCTS, navGroups, cutImage, type NavGroup, type ProductSystem } from "@/lib/products";

const materialOf = (s: ProductSystem): "Aluminum" | "PVC" => (/pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminum");

type Priority = "budget" | "security" | "slim" | "thermal" | "wood" | "spans";

const PRIORITIES: { key: Priority; label: string; desc: string }[] = [
  { key: "budget", label: "Budget-friendly", desc: "Best value for the performance" },
  { key: "security", label: "Hurricane & security", desc: "Impact-rated and built to protect" },
  { key: "slim", label: "Slim, modern look", desc: "Minimal frames, maximum glass" },
  { key: "thermal", label: "Best insulation", desc: "Warm in winter, cool in summer" },
  { key: "wood", label: "Warm, wood look", desc: "Natural wood-effect finishes" },
  { key: "spans", label: "Big & architectural", desc: "Large openings and facades" },
];

const REASON: Record<Priority, string> = {
  budget: "Great value",
  security: "Hurricane impact-rated",
  slim: "Slim, modern sightlines",
  thermal: "Excellent insulation",
  wood: "Wood-effect finishes",
  spans: "Built for big spans",
};

// Curated subjective traits per system (look / thermal / spans); budget, security
// and spans are also derived from the data at runtime.
const CURATED: Record<string, Priority[]> = {
  "conceptsystem-77": ["slim", "thermal"],
  "masterline-8": ["slim", "thermal"],
  "masterline-10": ["slim", "spans"],
  masterpatio: ["spans", "slim"],
  "conceptpatio-155": ["spans"],
  "conceptwall-50": ["spans", "slim"],
  "slimline-38": ["slim"],
  "hi-finity": ["slim", "spans"],
  "slimpatio-68": ["slim", "spans"],
  "conceptpatio-68": ["spans"],
  "conceptfolding-77": ["spans"],
  masterwall: ["spans"],
  "vision-guard": ["thermal", "wood"],
  "vista-guard": ["slim"],
  vision: ["thermal", "wood"],
  "series-76-md": ["thermal", "wood"],
  "series-76-md-hadk-hadkz": ["thermal", "wood"],
  "series-76-ad": ["wood"],
  "premidoor-88": ["spans", "wood"],
  "series-88": ["thermal", "wood"],
  "premislide-76": ["spans", "wood"],
};

function traitsOf(s: ProductSystem): Set<Priority> {
  const t = new Set<Priority>(CURATED[s.slug] ?? []);
  if (materialOf(s) === "PVC") t.add("budget");
  if (s.hvhz || s.impact) t.add("security");
  if (/slid|lift|fold|curtain|wall|patio/i.test(s.category)) t.add("spans");
  return t;
}

const CATEGORIES: { key: NavGroup | "any"; label: string }[] = [
  { key: "Windows", label: "Windows" },
  { key: "Doors", label: "Doors" },
  { key: "Sliding & Folding", label: "Sliding & Folding" },
  { key: "Facades", label: "Facades" },
  { key: "any", label: "Not sure yet" },
];

const MATERIALS: { key: "Aluminum" | "PVC" | "any"; label: string; desc: string }[] = [
  { key: "Aluminum", label: "Aluminum", desc: "Slimmer frames, premium finish" },
  { key: "PVC", label: "PVC", desc: "Great value and insulation" },
  { key: "any", label: "No preference", desc: "Show me what fits best" },
];

const COASTAL: { key: "yes" | "no" | "unsure"; label: string; desc: string }[] = [
  { key: "yes", label: "Yes, Florida or coastal", desc: "I need hurricane-zone approval" },
  { key: "no", label: "No", desc: "Standard location" },
  { key: "unsure", label: "Not sure", desc: "" },
];

const STEPS = ["Product", "Priorities", "Material", "Location"];

export function ProductFinder() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<NavGroup | "any" | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [material, setMaterial] = useState<"Aluminum" | "PVC" | "any" | null>(null);
  const [coastal, setCoastal] = useState<"yes" | "no" | "unsure" | null>(null);

  const togglePriority = (p: Priority) => setPriorities((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const recs = useMemo(() => {
    let base = PRODUCTS;
    if (category && category !== "any") base = base.filter((s) => navGroups(s).includes(category));
    const scored = base
      .map((s) => {
        const tr = traitsOf(s);
        let score = 0;
        priorities.forEach((p) => { if (tr.has(p)) score += 2; });
        if (material && material !== "any") score += materialOf(s) === material ? 1 : -1.5;
        if (coastal === "yes" && s.hvhz) score += 2;
        const reasons = priorities.filter((p) => tr.has(p)).map((p) => REASON[p]);
        if (coastal === "yes" && s.hvhz && !priorities.includes("security")) reasons.unshift("Hurricane-zone approved");
        return { s, score, reasons: reasons.slice(0, 3) };
      })
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  }, [category, priorities, material, coastal]);

  const restart = () => { setStep(0); setCategory(null); setPriorities([]); setMaterial(null); setCoastal(null); };

  const isResults = step === 4;

  return (
    <div className="mx-auto max-w-3xl">
      {/* progress: Step /01 ... /04 */}
      {!isResults && (
        <div className="mb-12">
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-[14px] leading-[22px] text-char">
              Step /{String(step + 1).padStart(2, "0")} <span className="text-mute">· {STEPS[step]}</span>
            </p>
            <p className="text-[14px] leading-[22px] text-mute">/{String(STEPS.length).padStart(2, "0")}</p>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {STEPS.map((label, i) => (
              <div key={label}>
                <span
                  className={cn(
                    "block h-1 rounded-full transition-colors duration-500",
                    i <= step ? "bg-char" : "bg-panel",
                  )}
                />
                <span className={cn("mt-2 hidden text-[12px] leading-[18px] sm:block", i === step ? "text-char" : "text-mute")}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 && (
            <Question title="What are you fitting?" hint="Pick the closest. You can change it later.">
              <div className="grid gap-3 sm:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <Tile key={c.key} onClick={() => { setCategory(c.key); setStep(1); }} active={category === c.key} title={c.label} />
                ))}
              </div>
            </Question>
          )}

          {step === 1 && (
            <Question title="What matters most to you?" hint="Choose as many as you like.">
              <div className="grid gap-3 sm:grid-cols-2">
                {PRIORITIES.map((p) => (
                  <Tile key={p.key} onClick={() => togglePriority(p.key)} active={priorities.includes(p.key)} title={p.label} desc={p.desc} check />
                ))}
              </div>
              <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Continue" />
            </Question>
          )}

          {step === 2 && (
            <Question title="Aluminum or PVC?" hint="Both are fully certified. It is mostly look and budget.">
              <div className="grid gap-3 sm:grid-cols-3">
                {MATERIALS.map((m) => (
                  <Tile key={m.key} onClick={() => { setMaterial(m.key); setStep(3); }} active={material === m.key} title={m.label} desc={m.desc} />
                ))}
              </div>
              <Nav onBack={() => setStep(1)} />
            </Question>
          )}

          {step === 3 && (
            <Question title="Are you in a hurricane zone?" hint="Florida, the coast, or a High-Velocity Hurricane Zone.">
              <div className="grid gap-3 sm:grid-cols-3">
                {COASTAL.map((c) => (
                  <Tile key={c.key} onClick={() => { setCoastal(c.key); setStep(4); }} active={coastal === c.key} title={c.label} desc={c.desc} />
                ))}
              </div>
              <Nav onBack={() => setStep(2)} />
            </Question>
          )}

          {isResults && (
            <div>
              <div className="flex items-baseline justify-between gap-6">
                <p className="text-[14px] leading-[22px] text-mute">Your match</p>
                <p className="text-[14px] leading-[22px] text-mute">/02</p>
              </div>
              <h2 className="sw-h mt-8 text-[clamp(2.2rem,4.4vw,3.5rem)] text-char">{recs.length} systems built for you.</h2>
              <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">Based on what matters to you. Not sure which to choose? We will help you decide.</p>

              <div className="mt-12 space-y-3">
                {recs.map(({ s, reasons }, i) => (
                  <Link
                    key={s.slug}
                    href={`/products/system/${s.slug}`}
                    className="group relative flex flex-col gap-5 rounded-lg bg-panel p-5 sm:flex-row sm:items-center md:p-6"
                  >
                    <div className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center rounded-md bg-white sm:aspect-square sm:w-40">
                      {cutImage(s.slug) ? (
                        <Image src={cutImage(s.slug)!} alt="" fill className="object-contain p-4 mix-blend-multiply" sizes="160px" />
                      ) : (
                        <ProfileThumb material={materialOf(s)} className="h-[70%] w-[70%]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 sm:pr-12">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[14px] leading-[22px] text-mute">/{String(i + 1).padStart(2, "0")}</span>
                        {i === 0 && <span className="rounded-md bg-char px-2 py-0.5 text-[12px] text-white">Best match</span>}
                      </div>
                      <h3 className="sw-h mt-2 text-[24px] text-char">{s.name}</h3>
                      <p className="mt-1 text-[14px] leading-[22px] text-mute">{s.brand === "Valda" ? "VALDA" : s.brand}</p>
                      <p className="mt-2 text-[14px] leading-[22px] text-slate">{s.copy.headline}</p>
                      {reasons.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {reasons.map((r) => (
                            <span key={r} className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue md:right-6 md:top-6">
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-3 flex flex-col items-start justify-between gap-6 rounded-lg bg-char p-6 text-white sm:flex-row sm:items-center md:p-8">
                <div>
                  <h3 className="sw-h text-[24px] text-white">Still not sure? Let us help.</h3>
                  <p className="mt-2 text-[14px] leading-[22px] text-white/70">Tell us about your project and we will confirm the right system.</p>
                </div>
                <Button href="/contact" variant="light" className="shrink-0">Talk to us <ArrowRight size={15} /></Button>
              </div>

              <button type="button" onClick={restart} className="mt-8 inline-flex items-center gap-2 text-[14px] text-mute transition-colors hover:text-char">
                <RotateCcw size={14} /> Start over
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="sw-h text-[clamp(1.8rem,3.4vw,2.6rem)] text-char">{title}</h2>
      {hint && <p className="mt-3 text-[16px] leading-6 text-slate">{hint}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Tile({ onClick, active, title, desc, check }: { onClick: () => void; active: boolean; title: string; desc?: string; check?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex min-h-[76px] items-center justify-between gap-3 rounded-lg p-5 text-left transition-colors duration-300",
        active ? "bg-char text-white" : "bg-panel text-char hover:bg-char/10",
      )}
    >
      <span>
        <span className={cn("block text-[16px] font-medium leading-6", active ? "text-white" : "text-char")}>{title}</span>
        {desc && <span className={cn("mt-0.5 block text-[14px] leading-[22px]", active ? "text-white/70" : "text-slate")}>{desc}</span>}
      </span>
      {check ? (
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-md transition-colors",
            active ? "bg-white text-char" : "bg-white text-transparent",
          )}
        >
          <Check size={13} />
        </span>
      ) : (
        <ArrowRight size={16} className={cn("shrink-0 transition-transform", active ? "text-white" : "text-mute group-hover:translate-x-0.5 group-hover:text-char")} />
      )}
    </button>
  );
}

function Nav({ onBack, onNext, nextLabel }: { onBack: () => void; onNext?: () => void; nextLabel?: string }) {
  return (
    <div className="mt-10 flex items-center justify-between">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[14px] text-mute transition-colors hover:text-char">
        <ArrowLeft size={15} /> Back
      </button>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-[52px] items-center gap-2 rounded-lg bg-char px-5 text-[14px] leading-[22px] text-white transition-colors duration-300 hover:bg-black"
        >
          {nextLabel ?? "Continue"} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
