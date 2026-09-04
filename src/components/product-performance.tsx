"use client";

import { useState } from "react";
import { ChevronDown, Check, ShieldCheck } from "lucide-react";
import { type Opening, type ProductSystem, groupedOpenings } from "@/lib/products";
import { SYM } from "@/components/openings";
import type { OpeningType } from "@/components/openings";

// A real, quotable water figure — never the "limited / covered" placeholder.
const realWater = (o: Opening): string | null =>
  o.waterResistance && !o.waterLimited && !/limit|cover/i.test(o.waterResistance) ? o.waterResistance : null;

// Strip cautionary suffixes the data bakes into opening names (e.g.
// "ADA low sill inswing door — limited water rating").
const cleanOpening = (name: string) =>
  name.replace(/\s*[—–-]\s*(limited water rating|(for\s+)?covered(\s+openings?)?)\s*$/i, "").trim();

/* ─────────────────────────  shared helpers  ───────────────────────── */

// Classify a data opening string into a homeowner-friendly family.
type Family = { key: OpeningType; name: string; desc: string };
function family(label: string): Family {
  const t = label.toLowerCase();
  if (/lift.*slide/.test(t)) return { key: "liftslide", name: "Lift & slide", desc: "Large glass panels lift onto their track and glide aside." };
  if (/slid/.test(t)) return { key: "sliding", name: "Sliding", desc: "Panels slide horizontally to open the wall to the outside." };
  if (/tilt.*turn|turn.*tilt|dual.?action/.test(t)) return { key: "tt", name: "Tilt & turn", desc: "Tilts in at the top to vent safely, or swings fully open like a door." };
  if (/awning/.test(t)) return { key: "awning", name: "Awning", desc: "Top-hinged and opens outward, so it can stay open in the rain." };
  if (/casement/.test(t)) return { key: "casement", name: "Casement", desc: "Side-hinged and swings wide open for maximum fresh air." };
  if (/fixed|picture/.test(t)) return { key: "fixed", name: "Fixed / picture", desc: "A sealed window that doesn't open — all glass, slim frame, best views." };
  if (/balcony|door|entry|hinged|fold/.test(t)) return { key: "door", name: "Doors", desc: "Hinged terrace, balcony and entrance doors." };
  return { key: "fixed", name: label, desc: "" };
}

const FRAC: Record<string, string> = { "½": ".5", "¼": ".25", "¾": ".75", "⅜": ".375", "⅝": ".625", "⅛": ".125", "⅞": ".875", "⅓": ".333", "⅔": ".667" };
function toFeet(size?: string): string | null {
  if (!size) return null;
  let s = size;
  for (const [k, v] of Object.entries(FRAC)) s = s.split(k).join(v);
  const m = s.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const r = (n: number) => (n / 12).toFixed(1).replace(/\.0$/, "");
  return `${r(parseFloat(m[1]))} × ${r(parseFloat(m[2]))} ft`;
}
function areaIn(size?: string): number {
  if (!size) return 0;
  let s = size;
  for (const [k, v] of Object.entries(FRAC)) s = s.split(k).join(v);
  const m = s.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) * parseFloat(m[2]) : 0;
}

/* ─────────────────────────  AT A GLANCE (homeowner)  ───────────────────────── */

function GlanceCards({ system }: { system: ProductSystem }) {
  // group openings by family, keep the biggest tested size per family
  const map = new Map<string, { fam: Family; impact: boolean; hvhz: boolean; sealed: boolean; big?: string }>();
  for (const o of system.openings) {
    const fam = family(o.opening);
    const cur = map.get(fam.key) ?? { fam, impact: false, hvhz: false, sealed: false, big: undefined };
    if (o.impact) cur.impact = true;
    if (o.hvhz) cur.hvhz = true;
    if (realWater(o)) cur.sealed = true;
    if (o.testedSize && (!cur.big || areaIn(o.testedSize) > areaIn(cur.big))) cur.big = o.testedSize;
    map.set(fam.key, cur);
  }
  const cards = [...map.values()];

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ fam, impact, hvhz, sealed, big }) => {
          const feet = toFeet(big);
          const chips: { label: string; tone: "impact" | "size" | "seal" }[] = [];
          if (impact) chips.push({ label: hvhz ? "Hurricane impact rated" : "Impact rated", tone: "impact" });
          if (feet) chips.push({ label: `Opens up to ${feet}`, tone: "size" });
          if (sealed) chips.push({ label: "Weather-sealed", tone: "seal" });
          return (
            <div key={fam.key} className="flex flex-col rounded-2xl border border-mist bg-white p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-paper">
                  <svg viewBox="0 0 52 60" className="h-7 w-7 [&_line.dash]:stroke-blue [&_line]:stroke-ink [&_path]:stroke-ink [&_rect]:stroke-ink" fill="none" strokeWidth={2.4} dangerouslySetInnerHTML={{ __html: SYM[fam.key] }} />
                </span>
                <h4 className="headline text-[18px] text-ink">{fam.name}</h4>
              </div>
              {fam.desc && <p className="mt-4 text-[14px] leading-relaxed text-slate">{fam.desc}</p>}
              <ul className="mt-5 flex flex-col gap-2">
                {chips.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-[13px] text-ink">
                    {c.tone === "impact" ? <ShieldCheck size={14} className="shrink-0 text-blue" /> : <Check size={13} className="shrink-0 text-blue" />}
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-[13px] leading-relaxed text-slate">
        Sizes shown are the largest tested. Switch to the full specification for exact figures, or ask us for a size and pressure check on your openings.
      </p>
    </div>
  );
}

/* ─────────────────────────  FULL SPECIFICATION (technical)  ───────────────────────── */

const DETAIL_FIELDS: { key: keyof Opening; label: string }[] = [
  { key: "structuralTest", label: "Structural test" },
  { key: "airInfiltration", label: "Air infiltration" },
  { key: "forcedEntry", label: "Forced entry" },
  { key: "sashSize", label: "Sash size" },
  { key: "glass", label: "Glass" },
  { key: "profiles", label: "Profiles" },
  { key: "testReport", label: "Test report" },
  { key: "certificate", label: "Certificate" },
];
const has = (o: Opening, k: keyof Opening) => o[k] != null && o[k] !== "";
const detailsOf = (o: Opening) => DETAIL_FIELDS.filter((f) => has(o, f.key));

function SpecRow({ o, cols }: { o: Opening; cols: { water: boolean; size: boolean } }) {
  const [open, setOpen] = useState(false);
  const details = detailsOf(o);
  const expandable = details.length > 0;
  const colCount = 3 + (cols.water ? 1 : 0) + (cols.size ? 1 : 0);
  return (
    <>
      <tr onClick={() => expandable && setOpen((v) => !v)} className={`border-t border-mist ${expandable ? "cursor-pointer transition-colors hover:bg-paper/70" : ""}`}>
        <td className="py-4 pr-6 text-[15px] text-ink">
          <span className="flex items-center gap-2">
            {expandable && <ChevronDown size={13} className={`shrink-0 text-slate/60 transition-transform ${open ? "rotate-180" : ""}`} />}
            {cleanOpening(o.opening)}
            {o.hvhz && <span className="rounded-full bg-blue/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-blue">HVHZ</span>}
          </span>
        </td>
        <td className="py-4 pr-6 font-mono text-[13px]">
          <span className="text-slate">{o.approval ?? ""}</span>
        </td>
        <td className="py-4 pr-6 font-mono text-[13px] text-ink">{o.designPressure ?? ""}</td>
        {cols.water && <td className="py-4 pr-6 font-mono text-[13px] text-slate">{realWater(o) ?? ""}</td>}
        {cols.size && <td className="py-4 font-mono text-[13px] text-slate">{o.testedSize ?? ""}</td>}
      </tr>
      {open && expandable && (
        <tr className="bg-paper/60">
          <td colSpan={colCount} className="px-4 pb-6 pt-1 sm:px-6">
            <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {details.map((f) => (
                <div key={f.key}>
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate/70">{f.label}</dt>
                  <dd className="mt-1 font-mono text-[12px] text-ink">{String(o[f.key])}</dd>
                </div>
              ))}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

function HeldBadge({ label }: { label: string }) {
  const florida = label === "Florida approved";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-tight ring-1 ${florida ? "bg-blue/10 text-blue ring-blue/25" : "bg-slate/10 text-slate ring-slate/25"}`}>
      <ShieldCheck size={13} strokeWidth={2.4} /> {label}
    </span>
  );
}

function SpecTable({ rows, label }: { rows: Opening[]; label: string }) {
  if (!rows.length) return null;
  const florida = label === "Florida approved";
  const cols = { water: rows.some((r) => realWater(r)), size: rows.some((r) => has(r, "testedSize")) };
  return (
    <div className="mt-6">
      <HeldBadge label={label} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">
              <th className="py-3 pr-6 font-medium">Configuration</th>
              <th className="py-3 pr-6 font-medium">{florida ? "FL approval" : "Class"}</th>
              <th className="py-3 pr-6 font-medium">Design pressure</th>
              {cols.water && <th className="py-3 pr-6 font-medium">Water</th>}
              {cols.size && <th className="py-3 font-medium">Tested size</th>}
            </tr>
          </thead>
          <tbody>{rows.map((r, i) => <SpecRow key={i} o={r} cols={cols} />)}</tbody>
        </table>
      </div>
    </div>
  );
}

function SpecGroup({ label, count, florida, aama, collapsible }: { label: string; count: number; florida: Opening[]; aama: Opening[]; collapsible: boolean }) {
  const [open, setOpen] = useState(!collapsible);
  if (count === 0) return null;
  return (
    <div className="border-t border-mist pt-8">
      <button type="button" onClick={() => collapsible && setOpen((v) => !v)} className={`flex w-full items-center justify-between ${collapsible ? "group" : "cursor-default"}`}>
        <h3 className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink">{label} <span className="text-slate/60">· {count}</span></h3>
        {collapsible && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-blue transition-colors group-hover:text-blue-bright">
            {open ? "Hide" : `Show all ${count}`}
            <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        )}
      </button>
      {open && (
        <>
          <SpecTable rows={florida} label="Florida approved" />
          <SpecTable rows={aama} label="AAMA tested" />
        </>
      )}
    </div>
  );
}

function FullSpec({ system }: { system: ProductSystem }) {
  const g = groupedOpenings(system);
  return (
    <div>
      <p className="text-[13px] leading-relaxed text-slate">Tap any row for the full test detail.</p>
      <div className="mt-8 space-y-10">
        <SpecGroup label="Impact rated" count={g.impactCount} florida={g.impact.florida} aama={g.impact.aama} collapsible={false} />
        <SpecGroup label="Non-impact" count={g.nonImpactCount} florida={g.nonImpact.florida} aama={g.nonImpact.aama} collapsible={false} />
      </div>
    </div>
  );
}

/* ─────────────────────────  switch  ───────────────────────── */

export function ProductPerformance({ system }: { system: ProductSystem }) {
  return (
    <div>
      <p className="max-w-2xl text-[15px] leading-relaxed text-slate">
        Every configuration below is individually tested and certified, with its Florida approval number, design
        pressure and tested size. Tap a row for the full test detail and document references.
      </p>
      <div className="mt-8">
        <FullSpec system={system} />
      </div>
    </div>
  );
}
