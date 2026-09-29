import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ArrowUpRight, Download } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { PRODUCTS, navGroup, type NavGroup, type ProductSystem } from "@/lib/products";
import { SITE_DOCS, CATALOGUE_READERS, systemPack } from "@/lib/downloads";

export const metadata: Metadata = pageMeta({
  title: "Downloads: Catalogues, Datasheets & CAD",
  description:
    "Download VALDA catalogues, datasheets and CAD sections for European aluminum and PVC windows, doors and sliding systems, or read the catalogue online.",
  path: "/downloads",
  image: "/images/project-twins-1.jpg",
});

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
    <PinnedHero eyebrow="Resources" title="Downloads" intro="Catalogues, datasheets, Florida approvals, CAD and specifications for every VALDA system." image="/images/project-twins-1.jpg">
      {/* /01 site-wide documents: only shown when files exist */}
      {docs.length > 0 && (
        <section className="bg-white py-28 md:py-36">
          <Container>
            <SwHead label="Catalogues & charts" n="01" layout="stacked" title="Catalogues & Colour Charts" />
            <div className="mt-14 grid gap-3 sm:grid-cols-2 md:mt-20 md:gap-4 lg:grid-cols-3">
              {docs.map((d) => (
                <div key={d.file} className="flex flex-col justify-between gap-8 rounded-lg bg-panel p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="sw-h text-[24px] text-char">{d.label}</h3>
                      <p className="mt-3 text-[16px] leading-6 text-slate">{d.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {d.size && <span className="text-[14px] leading-[22px] text-mute">PDF · {d.size}</span>}
                      {CATALOGUE_READERS[d.file] && (
                        <Link href={CATALOGUE_READERS[d.file]} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[12px] text-char transition-colors hover:text-blue">
                          Read online <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>
                    <a
                      href={`/downloads/${d.file}`}
                      download
                      aria-label={`Download ${d.label}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 hover:bg-blue"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* per-system packs */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="By system" n={sysNum} layout="stacked" title={<span className="block max-w-[640px]">The technical pack for every system.</span>} />

          <div className="mt-14 space-y-12 md:mt-20 md:space-y-16">
            {byGroup.map(({ group, systems }) => (
              <div key={group}>
                <p className="text-[14px] leading-[22px] text-mute">{group}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
                  {systems.map((s) => {
                    const n = availableDocs(s);
                    return (
                      <Link
                        key={s.slug}
                        href={`/downloads/${s.slug}`}
                        className="group flex items-center justify-between gap-4 rounded-lg bg-white p-5"
                      >
                        <span className="min-w-0">
                          <span className="block text-[16px] font-medium leading-6 text-char">{s.name}</span>
                          <span className="mt-0.5 block text-[14px] leading-[22px] text-mute">
                            {n > 0 ? `${n} document${n > 1 ? "s" : ""}` : s.brand}
                          </span>
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                          <ArrowUpRight size={16} />
                        </span>
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
