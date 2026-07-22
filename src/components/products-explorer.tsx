"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { ProfileThumb } from "@/components/profile-thumb";
import { SYSTEMS, FAMILIES, systemDepth, type System } from "@/lib/systems";

type FacetKey = "type" | "material" | "family" | "cert";

const FACETS: { key: FacetKey; label: string; options: string[] }[] = [
  { key: "type", label: "Type", options: ["Windows", "Doors", "Sliding & Folding", "Facades"] },
  { key: "material", label: "Material", options: ["Aluminium", "PVC"] },
  { key: "family", label: "System family", options: ["VALDA", "Reynaers", "Kömmerling"] },
  { key: "cert", label: "Certification", options: ["HVHZ", "Impact", "Non-Impact"] },
];

function familyBrand(s: System) {
  return FAMILIES.find((f) => f.slug === s.family)?.brand ?? "";
}

function certsOf(s: System) {
  const t: string[] = [];
  if (s.hvhz === "Yes" || s.hvhz === "Both") t.push("HVHZ");
  if (s.impact !== "Non-Impact") t.push("Impact");
  if (s.impact === "Non-Impact" || s.hvhz === "Both") t.push("Non-Impact");
  return t;
}

const impactShort = (s: System) =>
  s.impact === "Non-Impact" ? "Non-impact" : s.impact.replace("Large & Small", "L&S").replace(" Impact", "");
const ufValue = (s: System) => (s.categories.includes("Facades") ? "1.5" : s.material === "Aluminium" ? "1.4" : "1.0");

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
        active
          ? "bg-blue text-white shadow-sm shadow-blue/25"
          : "bg-white text-ink/70 ring-1 ring-inset ring-ink/10 hover:text-ink hover:ring-blue/40"
      }`}
    >
      {children}
    </button>
  );
}

export function ProductsExplorer({ category }: { category?: string }) {
  const [filters, setFilters] = useState<Record<FacetKey, string | null>>({
    type: null,
    material: null,
    family: null,
    cert: null,
  });

  // when scoped to a type page, lock the category and hide the Type facet
  const facets = category ? FACETS.filter((f) => f.key !== "type") : FACETS;
  const base = useMemo(
    () => (category ? SYSTEMS.filter((s) => s.categories.includes(category as System["categories"][number])) : SYSTEMS),
    [category]
  );

  const set = (k: FacetKey, v: string | null) => setFilters((f) => ({ ...f, [k]: f[k] === v ? null : v }));
  const reset = () => setFilters({ type: null, material: null, family: null, cert: null });
  const anyActive = facets.some((f) => filters[f.key]);

  const list = useMemo(
    () =>
      base.filter((s) => {
        if (!category && filters.type && !s.categories.includes(filters.type as System["categories"][number])) return false;
        if (filters.material && s.material !== filters.material) return false;
        if (filters.family && familyBrand(s) !== filters.family) return false;
        if (filters.cert && !certsOf(s).includes(filters.cert)) return false;
        return true;
      }),
    [base, filters, category]
  );

  return (
    <div>
      {/* faceted filter bar */}
      <div className="rounded-3xl border border-ink/8 bg-paper/50 p-6 md:p-8">
        <div className="grid gap-5">
          {facets.map((facet) => (
            <div key={facet.key} className="grid gap-2.5 md:grid-cols-[150px_1fr] md:items-center md:gap-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate/80">{facet.label}</span>
              <div className="flex flex-wrap gap-2">
                <Chip active={!filters[facet.key]} onClick={() => set(facet.key, null)}>All</Chip>
                {facet.options.map((o) => (
                  <Chip key={o} active={filters[facet.key] === o} onClick={() => set(facet.key, o)}>{o}</Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* result count */}
      <div className="flex items-center justify-between py-6">
        <p className="caption text-slate">
          {list.length} system{list.length !== 1 ? "s" : ""}
        </p>
        {anyActive && (
          <button type="button" onClick={reset} className="text-[13px] font-medium text-blue underline-offset-4 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* grid */}
      <motion.div layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s) => (
            <motion.div
              key={s.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/products/system/${s.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-white p-4 transition-all duration-300 hover:border-blue/30 hover:shadow-[0_18px_40px_-24px_rgba(14,18,23,0.35)]"
              >
                <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-mist/70 via-paper to-white">
                  <ProfileThumb material={s.material} className="h-[80%] w-[80%]" />
                  {s.hvhz !== "No" && <span className="absolute left-3 top-3"><Badge variant="blue">HVHZ</Badge></span>}
                  <ArrowUpRight size={18} className="absolute right-3 top-3 text-slate opacity-0 transition-all duration-300 group-hover:text-blue group-hover:opacity-100" />
                </div>
                <div className="mt-4 flex-1 px-1">
                  <h3 className="headline text-lg text-ink">{s.name}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{familyBrand(s)} · {s.material}</p>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate">{s.summary}</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink/10 px-1 pt-4">
                  {([["Frame depth", systemDepth(s)], ["Uf W/m²K", ufValue(s)], ["Rating", impactShort(s)]] as const).map(([l, v]) => (
                    <div key={l}>
                      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate/70">{l}</div>
                      <div className="mt-1 text-[13px] font-medium text-ink">{v}</div>
                    </div>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink/15 py-20 text-center">
          <p className="text-[15px] text-slate">No systems match those filters.</p>
          <button type="button" onClick={reset} className="mt-3 text-[13px] font-medium text-blue underline-offset-4 hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
