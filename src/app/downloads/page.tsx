import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Download, FileText } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { PRODUCTS, navGroup, type NavGroup, type ProductSystem } from "@/lib/products";
import { SITE_DOCS, CATALOGUE_READERS, systemPack } from "@/lib/downloads";

export const metadata: Metadata = { title: "Downloads" };

function fileExists(file: string): { exists: boolean; size?: string } {
  try {
    const st = fs.statSync(path.join(process.cwd(), "public", "downloads", file));
    if (!st.isFile()) return { exists: false };
    const mb = st.size / 1_048_576;
    return { exists: true, size: mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(st.size / 1024))} KB` };
  } catch {
    return { exists: false };
  }
}

const GROUP_ORDER: NavGroup[] = ["Windows", "Doors", "Sliding & Folding", "Facades"];

// How many of a system's documents are actually on file (drives the honest count).
function availableDocs(s: ProductSystem): number {
  return systemPack(s).filter((d) => {
    try {
      return fs.statSync(path.join(process.cwd(), "public", d.href)).isFile();
    } catch {
      return false;
    }
  }).length;
}

export default function DownloadsPage() {
  // Only site-wide files that actually exist are shown (no "on request").
  const docs = SITE_DOCS.map((d) => ({ ...d, ...fileExists(d.file) })).filter((d) => d.exists);
  const sysNum = docs.length > 0 ? "02" : "01";

  // Systems grouped by primary category for the index.
  const byGroup = GROUP_ORDER.map((g) => ({
    group: g,
    systems: PRODUCTS.filter((s) => navGroup(s) === g).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((x) => x.systems.length);

  return (
    <PinnedHero eyebrow="Resources" title="Downloads" intro="Catalogues, datasheets, Florida approvals, CAD and specifications — for every VALDA system." image="/images/project-twins-1.jpg">
      {/* site-wide documents — only shown when files exist */}
      {docs.length > 0 && (
        <section className="bg-pure pt-20 md:pt-28">
          <Container>
            <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-slate">
              <span className="tabular-nums text-blue-bright">01</span>
              <span className="h-px w-8 bg-slate/30" /> Catalogues & charts
            </p>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-mist bg-mist sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((d) => (
                <div key={d.file} className="flex flex-col justify-between gap-6 bg-pure p-6">
                  <div>
                    <FileText size={20} className="text-slate" />
                    <h3 className="mt-4 text-[16px] font-medium text-ink">{d.label}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate">{d.desc}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {CATALOGUE_READERS[d.file] && (
                      <Link href={CATALOGUE_READERS[d.file]} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue underline-offset-4 hover:underline">
                        Read online <ArrowRight size={13} />
                      </Link>
                    )}
                    <a href={`/downloads/${d.file}`} download className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue">
                      <Download size={14} /> Download {d.size && <span className="font-mono text-[11px] text-white/60">{d.size}</span>}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* per-system packs */}
      <section className={`bg-paper py-20 md:py-28 ${docs.length > 0 ? "" : "mt-4"}`}>
        <Container>
          <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-slate">
            <span className="tabular-nums text-blue-bright">{sysNum}</span>
            <span className="h-px w-8 bg-slate/30" /> By system
          </p>
          <h2 className="mt-6 max-w-2xl headline text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.04] tracking-[-0.01em] text-ink">
            The technical pack for every system.
          </h2>

          <div className="mt-12 space-y-12">
            {byGroup.map(({ group, systems }) => (
              <div key={group}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate">{group}</p>
                <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {systems.map((s) => {
                    const n = availableDocs(s);
                    return (
                      <Link
                        key={s.slug}
                        href={`/downloads/${s.slug}`}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-mist bg-pure px-5 py-4 transition-colors hover:border-blue/30"
                      >
                        <span>
                          <span className="text-[15px] font-medium text-ink">{s.name}</span>
                          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-slate">
                            {n > 0 ? `${n} document${n > 1 ? "s" : ""}` : s.brand}
                          </span>
                        </span>
                        <ArrowRight size={16} className="shrink-0 text-slate transition-all group-hover:translate-x-0.5 group-hover:text-blue" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
