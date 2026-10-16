"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Building2, Camera, Check, ChevronDown, ChevronLeft, ChevronRight,
  DoorOpen, FileUp, Home, Loader2, MapPin, Minus, Moon, Palette, Plus, RotateCcw, Sun, Sunrise, Sunset, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { cutImage } from "@/lib/products";
import {
  DEFAULT_COUNTS, GLASS, KIND_GROUP, KIND_LABEL, MAX_COUNTS, STYLES, materialOf, recommend, swatchesFor, zoneFor,
  type BuildingType, type Counts, type Material, type MaterialPref, type OpeningKind, type OpeningSpec, type Pick as SystemPick, type Swatch,
} from "@/lib/build-project";
import type { Region } from "./us-map-canvas";
import { ZONE_COLOR } from "./zone-colors";
import type { CameraView, TimeOfDay } from "./house-canvas";

const UsMapCanvas = dynamic(() => import("./us-map-canvas"), { ssr: false });
const HouseCanvas = dynamic(() => import("./house-canvas"), { ssr: false });

type Edit = Partial<Pick<OpeningSpec, "style" | "color" | "interior" | "glass">>;

const STEPS = ["Location", "Project", "Openings", "Design", "Inquire"];
const KINDS: OpeningKind[] = ["window", "door", "sliding", "facade"];

const field =
  "h-[52px] w-full rounded-lg border-0 bg-panel px-4 text-[15px] text-char placeholder:text-mute focus:outline-2 focus:outline-offset-0 focus:outline-blue";

const defaultColor = () => "Anthracite Grey"; // exists in both ranges
const defaultInterior = (m: Material) => (m === "PVC" ? "White" : "Traffic White");

/** "Miami-Dade" → "Miami-Dade County"; parishes, boroughs and independent cities keep their own word. */
function countyLabel(name: string, stateId: string) {
  if (/county|parish|borough|city|municipality|census area/i.test(name)) return name;
  return `${name} ${stateId === "22" ? "Parish" : "County"}`;
}

export function ProjectBuilder() {
  const [step, setStep] = useState(0);

  // 01 location
  const [state, setState] = useState<Region | null>(null);
  const [county, setCounty] = useState<Region | null>(null);
  const [stateList, setStateList] = useState<Region[]>([]);
  const [countyList, setCountyList] = useState<Region[]>([]);
  const zone = state ? zoneFor(state.id, county?.id) : null;

  // 02 project
  const [building, setBuilding] = useState<BuildingType | null>(null);
  const [pref, setPref] = useState<MaterialPref>("any");

  // 03 openings
  const [counts, setCounts] = useState<Counts>(DEFAULT_COUNTS.house);
  const [plan, setPlan] = useState<{ name: string; status: "reading" | "read" | "manual"; note?: string } | null>(null);
  const [chosen, setChosen] = useState<Partial<Record<OpeningKind, string>>>({});

  // 04 design
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [focusId, setFocusId] = useState<string | null>(null);

  const picks = useMemo(() => {
    const out = {} as Record<OpeningKind, SystemPick[]>;
    for (const k of KINDS) out[k] = zone ? recommend(zone.key, KIND_GROUP[k], pref, 3) : [];
    return out;
  }, [zone, pref]);
  const systemFor = (k: OpeningKind) => picks[k].find((p) => p.system.slug === chosen[k]) ?? picks[k][0];

  const material: Material = pref !== "any" ? pref : picks.window[0] ? materialOf(picks.window[0].system) : "Aluminum";
  const swatches = useMemo(() => swatchesFor(material), [material]);

  // one spec per counted opening; the visitor's edits are kept by id, so changing a count
  // or the material never loses the colours already chosen
  const specs = useMemo(() => {
    const names = new Set(swatches.map((s) => s.name));
    const next: OpeningSpec[] = [];
    for (const k of KINDS)
      for (let i = 0; i < counts[k]; i++) {
        const id = `${k}-${i + 1}`;
        const e = edits[id] ?? {};
        next.push({
          id,
          kind: k,
          style: e.style ?? STYLES[k][0],
          color: e.color && names.has(e.color) ? e.color : defaultColor(),
          interior: e.interior && names.has(e.interior) ? e.interior : defaultInterior(material),
          glass: e.glass ?? (k === "facade" ? "Blue reflective" : GLASS[0].name),
        });
      }
    return next;
  }, [counts, edits, material, swatches]);
  const edit = useCallback((ids: string[], patch: Edit) => {
    setEdits((cur) => {
      const next = { ...cur };
      for (const id of ids) next[id] = { ...next[id], ...patch };
      return next;
    });
  }, []);

  const go = (n: number) => {
    setStep(n);
    if (n !== 3) window.scrollTo({ top: 0, behavior: "smooth" }); // the studio scrolls itself into view
  };
  const restart = () => {
    setEdits({});
    setStep(0); setState(null); setCounty(null); setBuilding(null); setPref("any");
    setCounts(DEFAULT_COUNTS.house); setPlan(null); setChosen({}); setFocusId(null);
  };

  const place = [county && state && countyLabel(county.name, state.id), state?.name].filter(Boolean).join(", ");

  return (
    <div>
      {step !== 3 && <Progress step={step} onJump={(i) => i < step && go(i)} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 && (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="relative h-[58vh] min-h-[380px] overflow-hidden rounded-xl bg-gradient-to-b from-[#eef2f7] to-panel lg:h-[68vh]">
                <UsMapCanvas
                  stateId={state?.id ?? null}
                  countyId={county?.id ?? null}
                  onState={(r) => { setState(r); setCounty(null); setCountyList([]); }}
                  onCounty={setCounty}
                  onStatesLoaded={setStateList}
                  onCountiesLoaded={setCountyList}
                />
                <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-1.5">
                  {state ? (
                    <button
                      type="button"
                      onClick={() => { setState(null); setCounty(null); setCountyList([]); }}
                      className="pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-white/85 px-3.5 text-[13px] text-char shadow-sm backdrop-blur transition-colors hover:bg-white"
                    >
                      <ArrowLeft size={14} /> All states
                    </button>
                  ) : (
                    <span className="rounded-full bg-white/85 px-3.5 py-2 text-[13px] text-char shadow-sm backdrop-blur">Tap your state</span>
                  )}
                </div>
                <Legend />
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="sw-h text-[clamp(1.8rem,3vw,2.4rem)] text-char">Where is your project?</h2>
                  <p className="mt-3 text-[15px] leading-6 text-slate">Pick the state, then the county. The wind code there decides which systems you can use.</p>
                </div>
                <PlainSelect
                  label="State"
                  value={state?.id ?? ""}
                  onChange={(id) => { const r = stateList.find((s) => s.id === id) ?? null; setState(r); setCounty(null); setCountyList([]); }}
                  options={[...stateList].sort((a, b) => a.name.localeCompare(b.name)).map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="Choose a state"
                />
                <PlainSelect
                  label="County"
                  value={county?.id ?? ""}
                  onChange={(id) => setCounty(countyList.find((c) => c.id === id) ?? null)}
                  options={countyList.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder={state ? (countyList.length ? "Choose a county" : "Loading…") : "Pick a state first"}
                  disabled={!state || !countyList.length}
                />

                <AnimatePresence mode="wait">
                  {zone && (
                    <motion.div
                      key={zone.key + (county?.id ?? "")}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl bg-char p-5 text-white"
                    >
                      <p className="flex items-center gap-2 text-[13px] text-white/60">
                        <MapPin size={14} /> {place || state?.name}
                      </p>
                      <h3 className="sw-h mt-3 text-[22px] leading-tight text-white">{zone.headline}</h3>
                      <p className="mt-2 text-[14px] leading-[22px] text-white/70">{zone.detail}</p>
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-[12px] uppercase tracking-wider text-white/50">We suggest</p>
                        <ul className="mt-2 space-y-1.5">
                          {(["window", "sliding", "door"] as OpeningKind[]).map((k) =>
                            picks[k][0] ? (
                              <li key={k} className="flex items-baseline justify-between gap-3 text-[14px]">
                                <span className="text-white/60">{KIND_GROUP[k]}</span>
                                <span className="text-right text-white">{picks[k][0].system.name}</span>
                              </li>
                            ) : null,
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  disabled={!state}
                  onClick={() => go(1)}
                  className="mt-auto inline-flex h-[52px] items-center justify-center gap-2 rounded-lg bg-char px-5 text-[14px] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Continue <ArrowRight size={15} />
                </button>
                <p className="text-[12px] leading-[18px] text-mute">
                  Indicative only. The exact requirement depends on your site address and local building department. We confirm it with every quote.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mx-auto max-w-4xl">
              <h2 className="sw-h text-[clamp(1.8rem,3.4vw,2.6rem)] text-char">What are you building?</h2>
              <p className="mt-3 text-[16px] leading-6 text-slate">This sets the model you will design on next.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {([
                  { key: "house", label: "A house", desc: "Single family, villa, townhouse, renovation.", icon: Home },
                  { key: "building", label: "A building", desc: "Multifamily, hotel, office, mixed use.", icon: Building2 },
                ] as const).map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => { setBuilding(b.key); setCounts(DEFAULT_COUNTS[b.key]); }}
                    aria-pressed={building === b.key}
                    className={cn(
                      "group flex min-h-[180px] flex-col justify-between rounded-xl p-6 text-left transition-colors duration-300",
                      building === b.key ? "bg-char text-white" : "bg-panel text-char hover:bg-char/10",
                    )}
                  >
                    <b.icon size={30} strokeWidth={1.4} />
                    <span>
                      <span className="sw-h block text-[26px]">{b.label}</span>
                      <span className={cn("mt-1 block text-[14px] leading-[22px]", building === b.key ? "text-white/70" : "text-slate")}>{b.desc}</span>
                    </span>
                  </button>
                ))}
              </div>

              <h3 className="sw-h mt-14 text-[24px] text-char">Aluminum or PVC?</h3>
              <p className="mt-2 text-[15px] leading-6 text-slate">Both are certified. Aluminum is slimmer, PVC insulates more for less.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(["any", "Aluminum", "PVC"] as MaterialPref[]).map((m) => (
                  <Chip key={m} active={pref === m} onClick={() => setPref(m)}>
                    {m === "any" ? "Suggest for me" : m}
                  </Chip>
                ))}
              </div>
              <StepNav onBack={() => go(0)} onNext={() => go(2)} disabled={!building} />
            </div>
          )}

          {step === 2 && building && (
            <div className="mx-auto max-w-5xl">
              <h2 className="sw-h text-[clamp(1.8rem,3.4vw,2.6rem)] text-char">How many openings?</h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-6 text-slate">
                Upload your plans and we read them for you, or type the numbers in. Rough is fine, we check everything before we quote.
              </p>

              <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <PlanUpload
                  plan={plan}
                  onPlan={setPlan}
                  onRead={(r) => {
                    if (r.buildingType === "house" || r.buildingType === "building") setBuilding(r.buildingType);
                    setCounts({ window: r.windows, door: r.entryDoors, sliding: r.slidingDoors, facade: r.curtainWallBays });
                  }}
                />
                <div className="rounded-xl bg-panel p-5 md:p-6">
                  <p className="text-[14px] text-mute">{plan?.status === "read" ? "Check what we read" : "Or enter them yourself"}</p>
                  <div className="mt-4 divide-y divide-char/[0.07]">
                    {KINDS.filter((k) => MAX_COUNTS[building][k] > 0).map((k) => (
                      <Stepper
                        key={k}
                        label={KIND_LABEL[k]}
                        value={counts[k]}
                        max={MAX_COUNTS[building][k]}
                        onChange={(v) => setCounts((c) => ({ ...c, [k]: v }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="sw-h mt-14 text-[24px] text-char">Systems for {place || state?.name}</h3>
              <p className="mt-2 text-[15px] leading-6 text-slate">{zone?.requirement}. Tap to switch.</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {KINDS.filter((k) => counts[k] > 0).map((k) => (
                  <SystemCard key={k} kind={k} picks={picks[k]} chosen={systemFor(k)?.system.slug} onChoose={(slug) => setChosen((c) => ({ ...c, [k]: slug }))} />
                ))}
              </div>
              <StepNav onBack={() => go(1)} onNext={() => go(3)} disabled={!KINDS.some((k) => counts[k] > 0)} nextLabel="Design it in 3D" />
            </div>
          )}

          {step === 3 && building && (
            <DesignStudio
              building={building}
              specs={specs}
              onEdit={edit}
              swatches={swatches}
              material={material}
              focusId={focusId}
              setFocusId={setFocusId}
              onBack={() => go(2)}
              onDone={() => { setFocusId(null); go(4); }}
            />
          )}

          {step === 4 && building && zone && state && (
            <Inquiry
              summary={{
                place: place || state.name,
                zone: `${zone.label} (${zone.requirement})`,
                building,
                material,
                plan,
                systems: KINDS.filter((k) => counts[k] > 0).map((k) => ({ kind: k, pick: systemFor(k) })),
                specs,
                swatches,
              }}
              onBack={() => go(3)}
              onRestart={restart}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── step chrome ───────────────────────── */

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between gap-6">
        <p className="text-[14px] leading-[22px] text-char">
          Step /{String(step + 1).padStart(2, "0")} <span className="text-mute">· {STEPS[step]}</span>
        </p>
        <p className="text-[14px] leading-[22px] text-mute">/{String(STEPS.length).padStart(2, "0")}</p>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {STEPS.map((label, i) => (
          <button key={label} type="button" onClick={() => onJump(i)} disabled={i >= step} className="text-left disabled:cursor-default">
            <span className={cn("block h-1 rounded-full transition-colors duration-500", i <= step ? "bg-char" : "bg-panel")} />
            <span className={cn("mt-2 hidden text-[12px] leading-[18px] sm:block", i === step ? "text-char" : "text-mute")}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepNav({ onBack, onNext, disabled, nextLabel }: { onBack: () => void; onNext: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-12 flex items-center justify-between">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[14px] text-mute transition-colors hover:text-char">
        <ArrowLeft size={15} /> Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="inline-flex h-[52px] items-center gap-2 rounded-lg bg-char px-5 text-[14px] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
      >
        {nextLabel ?? "Continue"} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function Chip({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] transition-colors",
        active ? "bg-char text-white" : "bg-panel text-char hover:bg-char/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

function PlainSelect({ label, value, onChange, options, placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string; disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] leading-[22px] text-mute">{label}</span>
      <span className="relative block">
        <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={cn(field, "cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-50")}>
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mute" />
      </span>
    </label>
  );
}

function Legend() {
  const items = [
    { c: ZONE_COLOR.hvhz, l: "HVHZ" },
    { c: ZONE_COLOR.impact, l: "Florida impact" },
    { c: ZONE_COLOR.coastal, l: "Hurricane coast" },
    { c: ZONE_COLOR.cold, l: "Cold climate" },
    { c: ZONE_COLOR.standard, l: "Standard" },
  ];
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-white/85 px-3 py-2 text-[12px] text-char shadow-sm backdrop-blur">
      {items.map((i) => (
        <span key={i.l} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.c }} /> {i.l}
        </span>
      ))}
    </div>
  );
}

/* ───────────────────────── openings ───────────────────────── */

function Stepper({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.max(0, Math.min(max, Math.round(v) || 0)));
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-[16px] text-char">{label}</span>
      <span className="flex items-center gap-1">
        <button type="button" aria-label={`Fewer ${label}`} onClick={() => set(value - 1)} className="grid h-10 w-10 place-items-center rounded-lg bg-white text-char transition-colors hover:bg-char hover:text-white">
          <Minus size={15} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={label}
          value={value}
          min={0}
          max={max}
          onChange={(e) => set(Number(e.target.value))}
          className="h-10 w-16 rounded-lg border-0 bg-white text-center text-[16px] text-char [appearance:textfield] focus:outline-2 focus:outline-blue [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button type="button" aria-label={`More ${label}`} onClick={() => set(value + 1)} className="grid h-10 w-10 place-items-center rounded-lg bg-white text-char transition-colors hover:bg-char hover:text-white">
          <Plus size={15} />
        </button>
      </span>
    </div>
  );
}

type PlanResult = { readable: boolean; buildingType: string; windows: number; entryDoors: number; slidingDoors: number; curtainWallBays: number; notes: string };

function PlanUpload({ plan, onPlan, onRead }: {
  plan: { name: string; status: "reading" | "read" | "manual"; note?: string } | null;
  onPlan: (p: { name: string; status: "reading" | "read" | "manual"; note?: string } | null) => void;
  onRead: (r: PlanResult) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const send = async (file: File) => {
    onPlan({ name: file.name, status: "reading" });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/read-plan", { method: "POST", body });
      const out = (await res.json().catch(() => ({}))) as Partial<PlanResult> & { error?: string };
      if (!res.ok || !out.readable) {
        onPlan({ name: file.name, status: "manual", note: out.error ?? "We could not read openings from that file. Enter your counts and we will check them against your plans." });
        return;
      }
      onRead(out as PlanResult);
      onPlan({ name: file.name, status: "read", note: out.notes });
    } catch {
      onPlan({ name: file.name, status: "manual", note: "Upload failed. Enter your counts and attach the plans when we reply." });
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) send(f);
      }}
      className={cn(
        "relative flex min-h-[260px] flex-col justify-between rounded-xl border-2 border-dashed p-5 transition-colors md:p-6",
        drag ? "border-blue bg-blue/5" : "border-char/10 bg-white",
      )}
    >
      <input ref={input} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) send(f); e.target.value = ""; }} />
      <div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-panel text-char">
          {plan?.status === "reading" ? <Loader2 size={20} className="animate-spin" /> : plan?.status === "read" ? <Check size={20} /> : <FileUp size={20} />}
        </span>
        <h3 className="sw-h mt-5 text-[24px] text-char">
          {plan?.status === "reading" ? "Reading your plans…" : plan?.status === "read" ? "Plans read." : "Upload your plans"}
        </h3>
        <p className="mt-2 text-[14px] leading-[22px] text-slate">
          {plan ? (
            <>
              <span className="text-char">{plan.name}</span>
              {plan.note && <><br />{plan.note}</>}
            </>
          ) : (
            "Floor plans, elevations or a window schedule. PDF or image, up to 20 MB. We count the windows and doors for you."
          )}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={plan?.status === "reading"}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-char px-4 text-[14px] text-white transition-colors hover:bg-black disabled:opacity-40"
        >
          <FileUp size={15} /> {plan ? "Choose another file" : "Choose a file"}
        </button>
        {plan && plan.status !== "reading" && (
          <button type="button" onClick={() => onPlan(null)} className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] text-mute hover:text-char">
            <X size={14} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

function SystemCard({ kind, picks, chosen, onChoose }: { kind: OpeningKind; picks: SystemPick[]; chosen?: string; onChoose: (slug: string) => void }) {
  const cur = picks.find((p) => p.system.slug === chosen) ?? picks[0];
  if (!cur) {
    return (
      <div className="rounded-xl bg-panel p-5">
        <p className="text-[14px] text-mute">{KIND_GROUP[kind]}</p>
        <h4 className="sw-h mt-2 text-[22px] text-char">Engineered to order.</h4>
        <p className="mt-2 text-[14px] leading-[22px] text-slate">No catalogue system carries this rating off the shelf. Our engineers will specify one for your project.</p>
      </div>
    );
  }
  const img = cutImage(cur.system.slug);
  return (
    <div className="flex gap-4 rounded-xl bg-panel p-5">
      <div className="relative hidden h-24 w-24 shrink-0 rounded-lg bg-white sm:block">
        {img && <Image src={img} alt="" fill sizes="96px" className="object-contain p-2 mix-blend-multiply" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] text-mute">{KIND_GROUP[kind]}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h4 className="sw-h text-[22px] text-char">{cur.system.name}</h4>
          <Link href={`/products/system/${cur.system.slug}`} target="_blank" aria-label={`Open ${cur.system.name}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-char text-white transition-colors hover:bg-blue">
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <p className="mt-1 text-[13px] text-slate">{cur.system.brand === "Valda" ? "VALDA" : cur.system.brand} · {materialOf(cur.system)} · {cur.reason}</p>
        {picks.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {picks.map((p) => (
              <button
                key={p.system.slug}
                type="button"
                onClick={() => onChoose(p.system.slug)}
                className={cn("rounded-md px-2 py-1 text-[12px] transition-colors", p.system.slug === cur.system.slug ? "bg-char text-white" : "bg-white text-char hover:bg-char/10")}
              >
                {p.system.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── 3D design studio ───────────────────────── */

type Dock = "camera" | "time" | "configure" | null;

const TIMES: { key: TimeOfDay; label: string; icon: typeof Sun }[] = [
  { key: "morning", label: "Morning", icon: Sunrise },
  { key: "noon", label: "Noon", icon: Sun },
  { key: "sunset", label: "Sunset", icon: Sunset },
  { key: "night", label: "Night", icon: Moon },
];
const VIEWS: CameraView[] = ["front", "back", "left", "right", "aerial"];

function DesignStudio({ building, specs, onEdit, swatches, material, focusId, setFocusId, onBack, onDone }: {
  building: BuildingType;
  specs: OpeningSpec[];
  onEdit: (ids: string[], patch: Edit) => void;
  swatches: Swatch[];
  material: Material;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  // phones open on the model itself; the swatch panel would cover most of it
  const [dock, setDock] = useState<Dock>(() => (window.innerWidth >= 768 ? "configure" : null));
  const [time, setTime] = useState<TimeOfDay>("noon");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ v: CameraView; k: number }>({ v: "front", k: 0 });
  const [placed, setPlaced] = useState(specs.length);

  const focused = specs.find((s) => s.id === focusId) ?? null;
  const index = focused ? specs.indexOf(focused) : -1;
  const shown = specs.slice(0, Math.max(placed, 0));

  const update = (patch: Edit, scope: "one" | "kind" | "all") =>
    onEdit(
      specs.filter((s) => scope === "all" || (scope === "kind" && focused && s.kind === focused.kind) || s.id === focusId).map((s) => s.id),
      patch,
    );

  const target = focused ?? null;
  const ref = target ?? specs[0];
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    root.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div ref={root} className="relative -mx-5 scroll-mt-[76px] h-[calc(100svh-76px)] min-h-[560px] overflow-hidden bg-[#dfe8f1] md:-mx-10 md:rounded-xl">
      <HouseCanvas
        type={building}
        specs={specs}
        swatches={swatches}
        focusId={focusId}
        onFocus={(id) => { setFocusId(id); if (id) setDock("configure"); }}
        time={time}
        open={open}
        view={view.v}
        viewKey={view.k}
        onPlaced={setPlaced}
      />

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-5">
        <button type="button" onClick={onBack} className="pointer-events-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-white/80 px-4 text-[13px] text-char shadow-sm backdrop-blur-md hover:bg-white">
          <ArrowLeft size={14} /> Openings
        </button>
        <div className={cn("pointer-events-auto hidden max-w-sm rounded-2xl bg-white/80 px-4 py-3 text-[13px] leading-5 text-char shadow-sm backdrop-blur-md", !focusId && "md:block")}>
          <span className="text-mute">Tap any window or door to zoom in and style it.</span>
          {placed < specs.length && <span className="mt-1 block text-mute">Showing {placed} of {specs.length} on the model. All {specs.length} are in your spec.</span>}
        </div>
        <button type="button" onClick={onDone} className="pointer-events-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-char px-4 text-[13px] text-white shadow-sm hover:bg-black">
          Inquire <ArrowRight size={14} />
        </button>
      </div>

      {/* dock */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-3 md:p-5">
        <AnimatePresence mode="wait">
          {dock && (
            <motion.div
              key={dock}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[640px] rounded-2xl border border-white/50 bg-white/75 p-4 text-char shadow-lg backdrop-blur-xl"
            >
              {dock === "camera" && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {VIEWS.map((v) => (
                    <DockChip key={v} active={view.v === v && !focusId} onClick={() => { setFocusId(null); setView((c) => ({ v, k: c.k + 1 })); }}>
                      {v[0].toUpperCase() + v.slice(1)}
                    </DockChip>
                  ))}
                </div>
              )}
              {dock === "time" && (
                <div className="grid grid-cols-4 gap-1.5">
                  {TIMES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTime(t.key)}
                      className={cn("flex flex-col items-center gap-1.5 rounded-xl py-3 text-[12px] transition-colors", time === t.key ? "bg-char text-white" : "hover:bg-char/5")}
                    >
                      <t.icon size={20} strokeWidth={1.5} /> {t.label}
                    </button>
                  ))}
                </div>
              )}
              {dock === "configure" && ref && (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12px] text-mute">{target ? `${KIND_LABEL[target.kind].replace(/s$/, "")} ${target.id.split("-")[1]}` : "Every opening"}</p>
                      <p className="truncate text-[15px]">{target ? target.style : `${specs.length} openings · ${material}`}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <IconBtn label="Previous opening" onClick={() => setFocusId(shown[(index - 1 + shown.length) % shown.length]?.id ?? null)}><ChevronLeft size={16} /></IconBtn>
                      <IconBtn label="Next opening" onClick={() => setFocusId(shown[(index + 1) % shown.length]?.id ?? null)}><ChevronRight size={16} /></IconBtn>
                      {target && <IconBtn label="Back to whole model" onClick={() => setFocusId(null)}><X size={16} /></IconBtn>}
                    </div>
                  </div>

                  {target && (
                    <SwatchRow label="Style">
                      {STYLES[target.kind].map((s) => (
                        <DockChip key={s} active={target.style === s} onClick={() => update({ style: s }, "one")}>{s}</DockChip>
                      ))}
                    </SwatchRow>
                  )}
                  <SwatchRow label="Outside">
                    {swatches.map((s) => (
                      <Dot key={s.name} s={s} active={ref.color === s.name} onClick={() => update({ color: s.name }, target ? "one" : "all")} />
                    ))}
                  </SwatchRow>
                  <SwatchRow label="Inside">
                    {swatches.map((s) => (
                      <Dot key={s.name} s={s} active={ref.interior === s.name} onClick={() => update({ interior: s.name }, target ? "one" : "all")} />
                    ))}
                  </SwatchRow>
                  <SwatchRow label="Glass">
                    {GLASS.map((g) => (
                      <Dot key={g.name} s={{ name: g.name, hex: g.hex }} active={ref.glass === g.name} onClick={() => update({ glass: g.name }, target ? "one" : "all")} />
                    ))}
                  </SwatchRow>
                  {target && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-char/[0.07] pt-3">
                      <button type="button" onClick={() => update({ color: target.color, interior: target.interior, glass: target.glass, style: target.style }, "kind")} className="rounded-full bg-char/5 px-3 py-1.5 text-[12px] hover:bg-char/10">
                        Apply to all {KIND_LABEL[target.kind].toLowerCase()}
                      </button>
                      <button type="button" onClick={() => update({ color: target.color, interior: target.interior }, "all")} className="rounded-full bg-char/5 px-3 py-1.5 text-[12px] hover:bg-char/10">
                        Same colours everywhere
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-mute">
                    {swatches.find((s) => s.name === ref.color)?.ral ?? ""} Screen colours are approximate. We send physical samples.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex items-center gap-0.5 rounded-full border border-white/50 bg-white/75 p-1 shadow-lg backdrop-blur-xl">
          <DockTab icon={Camera} label="Camera" active={dock === "camera"} onClick={() => setDock((d) => (d === "camera" ? null : "camera"))} />
          <DockTab icon={Sun} label="Light" active={dock === "time"} onClick={() => setDock((d) => (d === "time" ? null : "time"))} />
          <DockTab icon={DoorOpen} label={open ? "Close" : "Open"} active={open} onClick={() => setOpen((o) => !o)} />
          <DockTab icon={Palette} label="Configure" active={dock === "configure"} onClick={() => setDock((d) => (d === "configure" ? null : "configure"))} />
        </nav>
      </div>
    </div>
  );
}

function DockTab({ icon: Icon, label, active, onClick }: { icon: typeof Sun; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[13px] transition-colors sm:px-4", active ? "bg-char text-white" : "text-char hover:bg-char/5")}
    >
      <Icon size={15} strokeWidth={1.6} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function DockChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-full px-3 py-1.5 text-[13px] transition-colors", active ? "bg-char text-white" : "bg-char/5 text-char hover:bg-char/10")}>
      {children}
    </button>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-full bg-char/5 text-char hover:bg-char/10">
      {children}
    </button>
  );
}

function SwatchRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-2.5 grid grid-cols-[58px_1fr] items-center gap-2">
      <span className="text-[11px] uppercase tracking-wider text-mute">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Dot({ s, active, onClick }: { s: Swatch; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={s.ral ? `${s.name} · ${s.ral}` : s.name}
      aria-label={s.name}
      aria-pressed={active}
      className={cn("h-6 w-6 rounded-full border border-char/15 transition-transform hover:scale-110", active && "ring-2 ring-char ring-offset-1 ring-offset-white/70")}
      style={{
        background: s.wood
          ? `repeating-linear-gradient(100deg, ${s.hex} 0 3px, color-mix(in srgb, ${s.hex} 80%, black) 3px 5px)`
          : s.hex,
      }}
    />
  );
}

/* ───────────────────────── inquiry ───────────────────────── */

type Summary = {
  place: string;
  zone: string;
  building: BuildingType;
  material: Material;
  plan: { name: string; status: "reading" | "read" | "manual" } | null;
  systems: { kind: OpeningKind; pick?: SystemPick }[];
  specs: OpeningSpec[];
  swatches: Swatch[];
};

function grouped(specs: OpeningSpec[]) {
  const map = new Map<string, { spec: OpeningSpec; n: number }>();
  for (const s of specs) {
    const key = [s.kind, s.style, s.color, s.interior, s.glass].join("|");
    const g = map.get(key);
    if (g) g.n++;
    else map.set(key, { spec: s, n: 1 });
  }
  return [...map.values()];
}

function specLine(s: OpeningSpec, sw: Swatch[]) {
  const c = sw.find((x) => x.name === s.color);
  const i = sw.find((x) => x.name === s.interior);
  const name = (x: Swatch | undefined, fallback: string) => (x ? `${x.name}${x.ral ? ` (${x.ral})` : ""}` : fallback);
  return `${s.style}, ${name(c, s.color)} outside / ${name(i, s.interior)} inside, ${s.glass}`;
}

function Inquiry({ summary, onBack, onRestart }: { summary: Summary; onBack: () => void; onRestart: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<"" | "sent" | "mail">("");
  const groups = grouped(summary.specs);
  const label = (k: OpeningKind) => KIND_LABEL[k].replace(/s$/, "").toLowerCase();

  const details = [
    "BUILD YOUR PROJECT",
    `Location: ${summary.place}`,
    `Zone: ${summary.zone}`,
    `Project: ${summary.building === "house" ? "House" : "Building"} · ${summary.material}`,
    summary.plan ? `Plans: ${summary.plan.name} (${summary.plan.status === "read" ? "read automatically, please verify" : "please request the file"})` : "",
    "",
    "Systems:",
    ...summary.systems.map((s) => `- ${KIND_GROUP[s.kind]}: ${s.pick ? `${s.pick.system.name} (${s.pick.system.brand === "Valda" ? "VALDA" : s.pick.system.brand})` : "engineer to specify"}`),
    "",
    "Openings:",
    ...groups.map((g) => `- ${g.n} × ${label(g.spec.kind)}: ${specLine(g.spec, summary.swatches)}`),
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");

  async function submit(form: HTMLFormElement) {
    const f = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const data: Record<string, string> = {
      ...f,
      type: `Build your project: ${summary.building === "house" ? "house" : "building"}`,
      material: summary.material,
      location: summary.place,
      details: `${details}${f.notes ? `\n\nNotes from the client:\n${f.notes}` : ""}`,
    };
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) return setSent("sent");
      const out = (await res.json().catch(() => ({}))) as { error?: string; fallback?: boolean };
      if (!out.fallback) return setError(out.error ?? "Something went wrong. Please try again.");
    } catch {
      // network error: fall through to the email app
    } finally {
      setBusy(false);
    }
    const body = [`Name: ${data.name}`, data.company && `Company: ${data.company}`, `Email: ${data.email}`, data.phone && `Phone: ${data.phone}`, data.timeline && `Timeline: ${data.timeline}`, "", data.details].filter(Boolean).join("\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Build your project: ${data.name}`)}&body=${encodeURIComponent(body)}`;
    setSent("mail");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
      <div>
        <h2 className="sw-h text-[clamp(1.8rem,3.4vw,2.6rem)] text-char">Your project.</h2>
        <p className="mt-3 max-w-xl text-[16px] leading-6 text-slate">Send it straight to our US team. We check the code, confirm sizes and come back with a certified quote within one business day.</p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-xl bg-char/[0.07] sm:grid-cols-2">
          {[
            ["Location", summary.place],
            ["Requirement", summary.zone],
            ["Project", `${summary.building === "house" ? "House" : "Building"} · ${summary.material}`],
            ["Plans", summary.plan ? summary.plan.name : "Not uploaded"],
          ].map(([k, v]) => (
            <div key={k} className="bg-panel p-5">
              <dt className="text-[13px] text-mute">{k}</dt>
              <dd className="mt-1 text-[15px] leading-6 text-char">{v}</dd>
            </div>
          ))}
        </dl>

        <h3 className="sw-h mt-10 text-[22px] text-char">Systems</h3>
        <ul className="mt-4 space-y-2">
          {summary.systems.map((s) => (
            <li key={s.kind} className="flex items-baseline justify-between gap-4 border-b border-char/[0.07] pb-2 text-[15px]">
              <span className="text-mute">{KIND_GROUP[s.kind]}</span>
              <span className="text-right text-char">{s.pick ? s.pick.system.name : "Engineered to order"}</span>
            </li>
          ))}
        </ul>

        <h3 className="sw-h mt-10 text-[22px] text-char">Openings</h3>
        <ul className="mt-4 space-y-2">
          {groups.map((g) => {
            const c = summary.swatches.find((x) => x.name === g.spec.color);
            return (
              <li key={[g.spec.kind, g.spec.style, g.spec.color, g.spec.interior, g.spec.glass].join("|")} className="flex items-center gap-3 rounded-lg bg-panel p-3 text-[14px]">
                <span className="h-8 w-8 shrink-0 rounded-md border border-char/10" style={{ background: c?.hex }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-char">{g.n} × {label(g.spec.kind)}</span>
                  <span className="block text-[13px] text-slate">{specLine(g.spec, summary.swatches)}</span>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap gap-4">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[14px] text-mute hover:text-char"><ArrowLeft size={15} /> Back to the model</button>
          <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 text-[14px] text-mute hover:text-char"><RotateCcw size={14} /> Start over</button>
        </div>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        {sent ? (
          <div className="rounded-xl bg-char p-6 text-white md:p-8">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-char"><Check size={16} /></span>
            <h3 className="sw-h mt-6 text-[30px] text-white">Sent. Thank you.</h3>
            <p className="mt-3 text-[15px] leading-6 text-white/70">
              {sent === "sent"
                ? "Your project is with our US team. We reply within one business day."
                : <>Your email app should have opened with your project filled in. Just press send. If nothing opened, email <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</>}
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget); }}
            className="space-y-3 rounded-xl bg-char p-5 text-white md:p-6"
          >
            <h3 className="sw-h text-[26px] text-white">Inquire</h3>
            <p className="pb-2 text-[14px] leading-[22px] text-white/60">Everything you designed goes with it.</p>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <input name="name" required placeholder="Name*" aria-label="Name" className={cn(field, "bg-white/10 text-white placeholder:text-white/40")} />
            <input name="email" type="email" required placeholder="Email*" aria-label="Email" className={cn(field, "bg-white/10 text-white placeholder:text-white/40")} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="phone" type="tel" placeholder="Phone" aria-label="Phone" className={cn(field, "bg-white/10 text-white placeholder:text-white/40")} />
              <input name="company" placeholder="Company" aria-label="Company" className={cn(field, "bg-white/10 text-white placeholder:text-white/40")} />
            </div>
            <select name="timeline" defaultValue="" aria-label="Timeline" className={cn(field, "cursor-pointer bg-white/10 text-white [&>option]:text-char")}>
              <option value="">When do you need them?</option>
              <option>Within 3 months</option>
              <option>3 to 6 months</option>
              <option>6 to 12 months</option>
              <option>Just planning</option>
            </select>
            <textarea name="notes" rows={3} placeholder="Anything else? Address, sizes, deadlines." aria-label="Notes" className={cn(field, "h-auto bg-white/10 py-3 text-white placeholder:text-white/40")} />
            {error && <p className="text-[14px] text-[#ffb4a8]">{error}</p>}
            <button type="submit" disabled={busy} className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-white text-[14px] text-char transition-colors hover:bg-blue hover:text-white disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <>Send to VALDA <ArrowRight size={15} /></>}
            </button>
            {summary.plan && <p className="text-[12px] leading-[18px] text-white/50">We will ask you for {summary.plan.name} by email so our engineers can check it.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
