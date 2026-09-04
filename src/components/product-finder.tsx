"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ProfileThumb } from "@/components/profile-thumb";
import { Button } from "@/components/ui/button";
import { PRODUCTS, navGroups, cutImage, type NavGroup, type ProductSystem } from "@/lib/products";

const materialOf = (s: ProductSystem): "Aluminium" | "PVC" => (/pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminium");

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

const MATERIALS: { key: "Aluminium" | "PVC" | "any"; label: string; desc: string }[] = [
  { key: "Aluminium", label: "Aluminium", desc: "Slimmer frames, premium finish" },
  { key: "PVC", label: "PVC", desc: "Great value and insulation" },
  { key: "any", label: "No preference", desc: "Show me what fits best" },
];

const COASTAL: { key: "yes" | "no" | "unsure"; label: string; desc: string }[] = [
  { key: "yes", label: "Yes — Florida or coastal", desc: "I need hurricane-zone approval" },
  { key: "no", label: "No", desc: "Standard location" },
  { key: "unsure", label: "Not sure", desc: "" },
];

const STEPS = ["Product", "Priorities", "Material", "Location"];

export function ProductFinder() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<NavGroup | "any" | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [material, setMaterial] = useState<"Aluminium" | "PVC" | "any" | null>(null);
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
      {/* progress */}
      {!isResults && (
        <div className="mb-10 flex items-center gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold transition-colors ${i < step ? "bg-blue text-white" : i === step ? "bg-ink text-white" : "bg-mist text-slate"}`}>
                {i < step ? <Check size={13} /> : i + 1}
              </span>
              <span className={`hidden text-[12px] font-medium sm:inline ${i === step ? "text-ink" : "text-slate"}`}>{label}</span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-mist sm:w-10" />}
            </div>
          ))}
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
            <Question title="What are you fitting?" hint="Pick the closest — you can change it later.">
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
            <Question title="Aluminium or PVC?" hint="Both are fully certified — it is mostly look and budget.">
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
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-blue-bright">Your match</p>
              <h2 className="mt-4 headline text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-ink">
                {recs.length} systems built for you.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate">Based on what matters to you. Not sure which to choose? We will help you decide.</p>

              <div className="mt-10 space-y-4">
                {recs.map(({ s, reasons }, i) => (
                  <Link
                    key={s.slug}
                    href={`/products/system/${s.slug}`}
                    className="group flex flex-col gap-5 rounded-2xl border border-mist bg-pure p-5 transition-colors hover:border-blue/30 sm:flex-row sm:items-center"
                  >
                    <div className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-mist/60 via-paper to-white sm:aspect-square sm:w-36">
                      {cutImage(s.slug) ? (
                        <Image src={cutImage(s.slug)!} alt="" fill className="object-contain p-4 [filter:drop-shadow(0_10px_20px_rgba(20,24,29,0.14))]" sizes="160px" />
                      ) : (
                        <ProfileThumb material={materialOf(s)} className="h-[70%] w-[70%]" />
                      )}
                      {i === 0 && <span className="absolute left-3 top-3 rounded-full bg-blue px-2.5 py-1 text-[10px] font-semibold text-white">Best match</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="headline text-[20px] tracking-[-0.01em] text-ink">{s.name}</h3>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{s.brand === "Valda" ? "VALDA" : s.brand}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate">{s.copy.headline}</p>
                      {reasons.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {reasons.map((r) => (
                            <span key={r} className="rounded-full bg-blue/8 px-2.5 py-1 text-[11px] font-medium text-blue">{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={18} className="hidden shrink-0 text-slate transition-all group-hover:translate-x-0.5 group-hover:text-blue sm:block" />
                  </Link>
                ))}
              </div>

              <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink p-7 text-white sm:flex-row sm:items-center">
                <div>
                  <h3 className="headline text-[20px] tracking-[-0.01em]">Still not sure? Let us help.</h3>
                  <p className="mt-1.5 text-[14px] text-white/70">Tell us about your project and we will confirm the right system.</p>
                </div>
                <Button href="/contact" variant="light">Talk to us <ArrowRight size={15} /></Button>
              </div>

              <button type="button" onClick={restart} className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium text-slate transition-colors hover:text-ink">
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
      <h2 className="headline text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.08] tracking-[-0.02em] text-ink">{title}</h2>
      {hint && <p className="mt-3 text-[14px] text-slate">{hint}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Tile({ onClick, active, title, desc, check }: { onClick: () => void; active: boolean; title: string; desc?: string; check?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-between gap-3 rounded-2xl border p-5 text-left transition-all ${active ? "border-ink bg-ink text-white" : "border-mist bg-pure hover:border-ink/40"}`}
    >
      <span>
        <span className={`block text-[15px] font-medium ${active ? "text-white" : "text-ink"}`}>{title}</span>
        {desc && <span className={`mt-0.5 block text-[12px] leading-snug ${active ? "text-white/70" : "text-slate"}`}>{desc}</span>}
      </span>
      {check ? (
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${active ? "border-white bg-white text-ink" : "border-mist text-transparent"}`}>
          <Check size={13} />
        </span>
      ) : (
        <ArrowRight size={16} className={`shrink-0 transition-transform ${active ? "text-white" : "text-slate group-hover:translate-x-0.5"}`} />
      )}
    </button>
  );
}

function Nav({ onBack, onNext, nextLabel }: { onBack: () => void; onNext?: () => void; nextLabel?: string }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[13px] font-medium text-slate transition-colors hover:text-ink">
        <ArrowLeft size={15} /> Back
      </button>
      {onNext && (
        <button type="button" onClick={onNext} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-ink px-7 text-[14px] font-medium text-white transition-colors hover:bg-blue">
          {nextLabel ?? "Continue"} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
