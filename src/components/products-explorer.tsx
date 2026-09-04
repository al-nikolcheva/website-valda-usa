"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ProfileThumb } from "@/components/profile-thumb";
import { PRODUCTS, navGroups, groupOfType, cutImage, type NavGroup, type ProductSystem } from "@/lib/products";

// Design pressure already reads "Up to …" on some systems — don't double it.
const dpLabel = (dp: string) => (/^up to/i.test(dp.trim()) ? dp : `Up to ${dp}`);

const materialOf = (s: ProductSystem): "Aluminium" | "PVC" =>
  /pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminium";

const impactShort = (s: ProductSystem) =>
  s.impact ? s.impact.split("—")[0].split("·")[0].trim() : "Non-impact";

function certsOf(s: ProductSystem) {
  const t: string[] = [];
  if (s.hvhz) t.push("HVHZ");
  if (s.impact) t.push("Impact");
  else t.push("Non-impact");
  return t;
}

// Opening families — matched against a system's opening types, so a category
// only ever shows the openings it actually has.
const OPENINGS: { label: string; re: RegExp }[] = [
  { label: "Fixed", re: /fixed|picture/i },
  { label: "Casement", re: /casement/i },
  { label: "Tilt & turn", re: /tilt|turn|dual.?action/i },
  { label: "Awning", re: /awning|hopper/i },
  { label: "Sliding", re: /slid|lift/i },
  { label: "Folding", re: /fold/i },
  { label: "Door", re: /door|entry|balcony|hinged|terrace|swing|sidelite/i },
];
// Scope openings to the current category so e.g. the Windows page never lists
// "Door" just because a window system also carries a door configuration.
const openingsOf = (s: ProductSystem, group?: NavGroup) => {
  const types = group ? s.openingTypes.filter((t) => groupOfType(t) === group) : s.openingTypes;
  return OPENINGS.filter((o) => types.some((t) => o.re.test(t))).map((o) => o.label);
};

type FilterKey = "brand" | "cert" | "opening";
const FILTERS: { key: FilterKey; label: string; options: string[] }[] = [
  { key: "brand", label: "Brand", options: ["Reynaers", "Valda", "Kömmerling"] },
  { key: "cert", label: "Certification", options: ["HVHZ", "Impact", "Non-impact"] },
  { key: "opening", label: "Opening", options: OPENINGS.map((o) => o.label) },
];

const brandLabel = (b: string) => (b === "Valda" ? "VALDA" : b);

export function ProductsExplorer({ group }: { group?: NavGroup }) {
  const [material, setMaterial] = useState<"All" | "Aluminium" | "PVC">("All");
  const [filters, setFilters] = useState<Record<FilterKey, string | null>>({ brand: null, cert: null, opening: null });
  const [open, setOpen] = useState(false);

  const base = useMemo(() => (group ? PRODUCTS.filter((s) => navGroups(s).includes(group)) : PRODUCTS), [group]);

  const set = (k: FilterKey, v: string | null) => setFilters((f) => ({ ...f, [k]: f[k] === v ? null : v }));
  const reset = () => { setMaterial("All"); setFilters({ brand: null, cert: null, opening: null }); };
  const filterCount = FILTERS.reduce((n, f) => n + (filters[f.key] ? 1 : 0), 0);
  const anyActive = material !== "All" || filterCount > 0;

  // Only offer material tabs / filter options that exist in this category.
  const materials = useMemo(() => {
    const present = new Set(base.map(materialOf));
    return (["Aluminium", "PVC"] as const).filter((m) => present.has(m));
  }, [base]);
  const availableFilters = useMemo(() => {
    return FILTERS.map((f) => {
      const present = new Set<string>();
      base.forEach((s) => {
        const vals = f.key === "brand" ? [s.brand] : f.key === "cert" ? certsOf(s) : openingsOf(s, group);
        vals.forEach((v) => present.add(v));
      });
      return { ...f, options: f.options.filter((o) => present.has(o)) };
    }).filter((f) => f.options.length > 1 || (f.key !== "brand" && f.options.length > 0));
  }, [base, group]);

  const list = useMemo(
    () =>
      base.filter((s) => {
        if (material !== "All" && materialOf(s) !== material) return false;
        if (filters.brand && s.brand !== filters.brand) return false;
        if (filters.cert && !certsOf(s).includes(filters.cert)) return false;
        if (filters.opening && !openingsOf(s, group).includes(filters.opening)) return false;
        return true;
      }),
    [base, material, filters, group],
  );

  return (
    <div>
      {/* material tab (left) + filters (right) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 rounded-full border border-mist bg-paper p-1">
          {(["All", ...materials] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMaterial(m)}
              className={`rounded-full px-6 py-2.5 text-[14px] font-medium transition-colors ${material === m ? "bg-ink text-white" : "text-slate hover:text-ink"}`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[14px] font-medium transition-colors ${open || filterCount ? "border-ink bg-ink text-white" : "border-mist text-ink hover:border-ink/40"}`}
          >
            <SlidersHorizontal size={15} /> Filters
            {filterCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-semibold text-ink">{filterCount}</span>
            )}
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-3 w-[min(88vw,360px)] rounded-2xl border border-mist bg-pure p-6 shadow-[0_24px_60px_-24px_rgba(14,18,23,0.4)]">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate">Filters</p>
                  <button type="button" onClick={() => setOpen(false)} className="text-slate transition-colors hover:text-ink" aria-label="Close filters">
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-5 space-y-6">
                  {availableFilters.map((facet) => (
                    <div key={facet.key}>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">{facet.label}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Chip active={!filters[facet.key]} onClick={() => set(facet.key, null)}>All</Chip>
                        {facet.options.map((o) => (
                          <Chip key={o} active={filters[facet.key] === o} onClick={() => set(facet.key, o)}>
                            {facet.key === "brand" ? brandLabel(o) : o}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-mist pt-4">
                  <button type="button" onClick={reset} disabled={!anyActive} className="text-[12px] font-medium text-blue underline-offset-4 hover:underline disabled:pointer-events-none disabled:text-slate/50">Clear all</button>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">{list.length} system{list.length === 1 ? "" : "s"}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <motion.div layout className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s) => (
            <motion.div
              key={s.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/products/system/${s.slug}${group ? `?category=${encodeURIComponent(group)}` : ""}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-all duration-300 hover:border-blue/30 hover:shadow-[0_18px_40px_-24px_rgba(14,18,23,0.35)]"
              >
                <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-gradient-to-br from-mist/70 via-paper to-white">
                  {cutImage(s.slug) ? (
                    <Image
                      src={cutImage(s.slug)!}
                      alt={`${s.name} section`}
                      fill
                      className="object-contain p-7 transition-transform duration-500 group-hover:scale-[1.04] [filter:drop-shadow(0_14px_28px_rgba(20,24,29,0.16))]"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  ) : (
                    <ProfileThumb material={materialOf(s)} className="h-[78%] w-[78%]" />
                  )}
                  {s.hvhz && <span className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.16em] text-blue">HVHZ</span>}
                  <ArrowUpRight size={18} className="absolute right-4 top-4 text-slate opacity-0 transition-all duration-300 group-hover:text-blue group-hover:opacity-100" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="headline text-lg text-ink">{s.name}</h3>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{brandLabel(s.brand)}</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate/70">{s.category}</p>
                  <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate">{s.copy.headline}</p>
                  <div className="mt-auto flex flex-wrap gap-x-7 gap-y-3 border-t border-ink/10 pt-4">
                    <Spec label="Impact" value={impactShort(s)} />
                    {s.summary.designPressure && <Spec label="Design pressure" value={dpLabel(s.summary.designPressure)} />}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-ink/15 py-20 text-center">
          <p className="text-[15px] text-slate">No systems match those filters.</p>
          <button type="button" onClick={reset} className="mt-3 text-[13px] font-medium text-blue underline-offset-4 hover:underline">Clear filters</button>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${active ? "bg-ink text-white" : "text-slate hover:text-ink"}`}
    >
      {children}
    </button>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate/70">{label}</div>
      <div className="mt-1 text-[13px] font-medium text-ink">{value}</div>
    </div>
  );
}
