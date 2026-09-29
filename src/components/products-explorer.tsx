"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ProfileThumb } from "@/components/profile-thumb";
import { cn } from "@/lib/utils";
import { PRODUCTS, navGroups, groupOfType, cutImage, type NavGroup, type ProductSystem } from "@/lib/products";

// Design pressure already reads "Up to …" on some systems — don't double it.
const dpLabel = (dp: string) => (/^up to/i.test(dp.trim()) ? dp : `Up to ${dp}`);

const materialOf = (s: ProductSystem): "Aluminum" | "PVC" =>
  /pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminum";

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
  const [material, setMaterial] = useState<"All" | "Aluminum" | "PVC">("All");
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
    return (["Aluminum", "PVC"] as const).filter((m) => present.has(m));
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

  const countLabel = `${list.length} system${list.length === 1 ? "" : "s"}`;

  return (
    <div>
      {/* material segments (left) + filters (right) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["All", ...materials] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMaterial(m)}
              aria-pressed={material === m}
              className={cn(
                "h-10 rounded-lg px-4 text-[14px] leading-[22px] transition-colors duration-300",
                material === m ? "bg-char text-white" : "bg-panel text-char hover:bg-char/10",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[14px] leading-[22px] transition-colors duration-300",
              open || filterCount ? "bg-char text-white" : "bg-panel text-char hover:bg-char/10",
            )}
          >
            <SlidersHorizontal size={15} /> Filters
            {filterCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-md bg-white px-1 text-[12px] text-char">{filterCount}</span>
            )}
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-[min(calc(100vw-40px),360px)] rounded-lg bg-white p-6 shadow-[0_16px_40px_-20px_rgba(34,34,36,0.25)]">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] leading-[22px] text-mute">Filters</p>
                  <button type="button" onClick={() => setOpen(false)} className="text-mute transition-colors hover:text-char" aria-label="Close filters">
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-5 space-y-6">
                  {availableFilters.map((facet) => (
                    <div key={facet.key}>
                      <p className="text-[14px] leading-[22px] text-char">{facet.label}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
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

                <div className="mt-6 flex items-center justify-between rounded-lg bg-panel px-4 py-3">
                  <button
                    type="button"
                    onClick={reset}
                    disabled={!anyActive}
                    className="text-[14px] text-char underline-offset-4 transition-colors hover:text-blue hover:underline disabled:pointer-events-none disabled:text-mute"
                  >
                    Clear all
                  </button>
                  <span className="text-[14px] text-mute">{countLabel}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-[14px] leading-[22px] text-mute">{countLabel}</p>

      <motion.div layout className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group flex h-full flex-col rounded-lg bg-panel p-5 md:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">{materialOf(s)}</span>
                    {s.hvhz && <span className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">HVHZ</span>}
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                <div className="relative my-4 flex aspect-[16/11] items-center justify-center">
                  {cutImage(s.slug) ? (
                    <Image
                      src={cutImage(s.slug)!}
                      alt={`${s.name} section`}
                      fill
                      className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  ) : (
                    <ProfileThumb material={materialOf(s)} className="h-[78%] w-[78%]" />
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="sw-h text-[24px] text-char">{s.name}</h3>
                  <p className="mt-1 text-[14px] leading-[22px] text-mute">
                    {brandLabel(s.brand)} · {s.category}
                  </p>
                  <p className="mt-3 line-clamp-2 text-[14px] leading-[22px] text-slate">{s.copy.headline}</p>
                  <div className="mt-auto flex flex-wrap gap-x-8 gap-y-3 pt-5">
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
        <div className="mt-4 rounded-lg bg-panel py-20 text-center">
          <p className="text-[16px] leading-6 text-slate">No systems match those filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-[14px] text-char underline-offset-4 transition-colors hover:text-blue hover:underline"
          >
            Clear filters
          </button>
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
      aria-pressed={active}
      className={cn(
        "h-9 rounded-lg px-3 text-[14px] transition-colors duration-300",
        active ? "bg-char text-white" : "bg-panel text-char hover:bg-char/10",
      )}
    >
      {children}
    </button>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] leading-[18px] text-mute">{label}</div>
      <div className="mt-0.5 text-[14px] leading-[22px] text-char">{value}</div>
    </div>
  );
}
