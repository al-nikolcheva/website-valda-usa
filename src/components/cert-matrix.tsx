"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type MatrixOpening = {
  name: string;
  ref?: string; // FL number (Florida list) or performance class (AAMA list)
  hvhz?: boolean;
  impact?: string;
  dp?: string;
  water?: string;
};

export type MatrixRow = {
  slug: string;
  name: string;
  brand: string;
  material: "Aluminum" | "PVC";
  group: string;
  types: string; // e.g. "Windows · Doors"
  florida: boolean;
  hvhz: boolean;
  impact: string | null;
  aama: boolean;
  nami: boolean;
  dp: { value: string; upTo: boolean } | null;
  holder: string | null;
  floridaOpenings: MatrixOpening[];
  aamaOpenings: MatrixOpening[];
};

const FILTERS = ["All", "Aluminum", "PVC", "Impact rated", "HVHZ"] as const;
type Filter = (typeof FILTERS)[number];

function matches(r: MatrixRow, f: Filter) {
  if (f === "All") return true;
  if (f === "Aluminum" || f === "PVC") return r.material === f;
  if (f === "Impact rated") return !!r.impact;
  return r.hvhz;
}

// Desktop column template: system | Florida | HVHZ | Impact | AAMA | NAMI | Design pressure | toggle
const COLS = "lg:grid-cols-[minmax(0,2.3fr)_repeat(2,minmax(0,0.8fr))_minmax(0,1.3fr)_repeat(2,minmax(0,0.8fr))_minmax(0,1.1fr)_40px]";

function Tick({ on, label }: { on: boolean; label: string }) {
  return on ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-char text-white">
      <Check size={13} strokeWidth={2.5} aria-hidden />
      <span className="sr-only">{label}: yes</span>
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center">
      <span className="h-1 w-1 rounded-full bg-char/20" aria-hidden />
      <span className="sr-only">{label}: no</span>
    </span>
  );
}

function Dp({ dp }: { dp: MatrixRow["dp"] }) {
  if (!dp) return null;
  return (
    <span className="text-[14px] leading-[22px] text-char tabular-nums">
      {dp.upTo && <span className="text-mute">up to </span>}
      {dp.value}
    </span>
  );
}

function OpeningList({ title, items, refLabel }: { title: string; items: MatrixOpening[]; refLabel: string }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-[13px] leading-5 text-mute">{title}</p>
      <ul className="mt-3 divide-y divide-char/[0.07] border-y border-char/[0.07]">
        {items.map((o, i) => (
          <li key={`${o.name}-${i}`} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-6">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[14px] leading-[22px] text-char">{o.name}</span>
              {o.hvhz && <span className="rounded bg-blue/10 px-1.5 py-px text-[11px] leading-4 text-blue">HVHZ</span>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] leading-5 text-slate tabular-nums">
              {o.dp && <span>{o.dp}</span>}
              {o.water && <span>Water {o.water}</span>}
              {o.ref && (
                <span className="text-mute">
                  <span className="sr-only">{refLabel} </span>
                  {o.ref}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Detail({ r }: { r: MatrixRow }) {
  return (
    <div className="grid gap-8 pb-8 pt-2 lg:max-w-[920px]">
      <OpeningList title="Florida approved configurations" items={r.floridaOpenings} refLabel="Florida approval" />
      <OpeningList title="AAMA / WDMA / CSA tested configurations" items={r.aamaOpenings} refLabel="Performance class" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        {r.holder ? (
          <p className="text-[13px] leading-5 text-mute">Florida approvals held by {r.holder}.</p>
        ) : (
          <span />
        )}
        <Link
          href={`/products/system/${r.slug}`}
          className="inline-flex items-center gap-1.5 text-[14px] leading-[22px] text-char underline-offset-4 hover:text-blue hover:underline"
        >
          View {r.name} <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export function CertMatrix({ rows, groups }: { rows: MatrixRow[]; groups: string[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<string | null>(null);

  const visible = useMemo(() => rows.filter((r) => matches(r, filter)), [rows, filter]);
  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f, rows.filter((r) => matches(r, f)).length])) as Record<Filter, number>,
    [rows],
  );

  const toggle = (slug: string) => setOpen((o) => (o === slug ? null : slug));

  return (
    <div>
      {/* filter chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter systems">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[14px] leading-[22px] transition-colors duration-200",
              filter === f ? "bg-char text-white" : "bg-panel text-char hover:bg-mist",
            )}
          >
            {f}
            <span className={cn("text-[12px] tabular-nums", filter === f ? "text-white/60" : "text-mute")}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* desktop column header */}
      <div
        className={cn(
          "mt-10 hidden border-b border-char/10 pb-3 text-[13px] leading-5 text-mute lg:grid lg:items-end lg:gap-4",
          COLS,
        )}
        aria-hidden
      >
        <span>System</span>
        <span>Florida approved</span>
        <span>HVHZ</span>
        <span>Impact rated</span>
        <span>AAMA tested</span>
        <span>NAMI</span>
        <span>Design pressure</span>
        <span />
      </div>

      {groups.map((g) => {
        const list = visible.filter((r) => r.group === g);
        if (!list.length) return null;
        return (
          <section key={g} className="mt-10 lg:mt-12" aria-label={g}>
            <div className="flex items-baseline justify-between border-b border-char/10 pb-3">
              <h3 className="sw-h text-[22px] text-char md:text-[24px]">{g}</h3>
              <span className="text-[13px] leading-5 text-mute tabular-nums">
                {list.length} {list.length === 1 ? "system" : "systems"}
              </span>
            </div>

            <ul className="mt-3 space-y-3 lg:mt-0 lg:space-y-0">
              {list.map((r) => {
                const isOpen = open === r.slug;
                const panelId = `cert-${r.slug}`;
                return (
                  <li key={r.slug} className="rounded-lg bg-panel lg:rounded-none lg:border-b lg:border-char/[0.07] lg:bg-transparent">
                    {/* ── desktop row ── */}
                    <div className={cn("hidden items-center gap-4 py-4 lg:grid", COLS)}>
                      <div className="min-w-0">
                        <Link
                          href={`/products/system/${r.slug}`}
                          className="group inline-flex items-center gap-1.5 text-[17px] leading-6 text-char hover:text-blue"
                        >
                          {r.name}
                          <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                        <p className="mt-0.5 text-[13px] leading-5 text-mute">
                          {r.brand} · {r.material} · {r.types}
                        </p>
                      </div>
                      <Tick on={r.florida} label="Florida approved" />
                      <Tick on={r.hvhz} label="HVHZ" />
                      <div className="flex items-center gap-2.5">
                        <Tick on={!!r.impact} label="Impact rated" />
                        {r.impact && <span className="text-[13px] leading-5 text-slate">{r.impact}</span>}
                      </div>
                      <Tick on={r.aama} label="AAMA tested" />
                      <Tick on={r.nami} label="NAMI certified" />
                      <Dp dp={r.dp} />
                      <button
                        type="button"
                        onClick={() => toggle(r.slug)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-label={`${isOpen ? "Hide" : "Show"} ${r.name} configurations`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-char transition-colors hover:bg-panel"
                      >
                        <Plus size={18} className={cn("transition-transform duration-300", isOpen && "rotate-45")} />
                      </button>
                    </div>

                    {/* ── mobile / tablet card ── */}
                    <div className="p-5 lg:hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/products/system/${r.slug}`} className="text-[18px] leading-6 text-char hover:text-blue">
                            {r.name}
                          </Link>
                          <p className="mt-1 text-[13px] leading-5 text-mute">
                            {r.brand} · {r.material} · {r.types}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(r.slug)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          aria-label={`${isOpen ? "Hide" : "Show"} ${r.name} configurations`}
                          className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-char transition-colors hover:bg-white"
                        >
                          <Plus size={18} className={cn("transition-transform duration-300", isOpen && "rotate-45")} />
                        </button>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                        {(
                          [
                            ["Florida approved", r.florida],
                            ["HVHZ", r.hvhz],
                            ["Impact rated", !!r.impact],
                            ["AAMA tested", r.aama],
                            ["NAMI", r.nami],
                          ] as const
                        ).map(([label, on]) => (
                          <div key={label} className="flex items-center gap-2">
                            <dt className="order-2 text-[13px] leading-5 text-slate">{label}</dt>
                            <dd className="order-1">
                              <Tick on={on} label={label} />
                            </dd>
                          </div>
                        ))}
                        {r.dp && (
                          <div className="col-span-2 flex items-baseline gap-2 border-t border-char/[0.07] pt-3 sm:col-span-3">
                            <dt className="text-[13px] leading-5 text-mute">Design pressure</dt>
                            <dd>
                              <Dp dp={r.dp} />
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {isOpen && (
                      <div id={panelId} className="px-5 lg:px-0">
                        <Detail r={r} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {!visible.length && <p className="mt-10 text-[16px] leading-6 text-slate">No systems match this filter.</p>}
    </div>
  );
}

