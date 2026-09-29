import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Download, ShieldCheck } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { Button } from "@/components/ui/button";
import { PRODUCTS, getSystem, navGroup } from "@/lib/products";
import { systemPack, type PackItem } from "@/lib/downloads";
import { packOnFile } from "@/lib/downloads-server";
import { noDash, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return PRODUCTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSystem(slug);
  if (!s) return { title: "Downloads" };
  const docs = packOnFile(s);
  const name = noDash(s.name);
  const kinds = [...new Set(docs.map((d) => (d.kind === "DWG" || d.kind === "DXF" ? "CAD sections" : d.label.toLowerCase())))];
  const list = kinds.length > 1 ? `${kinds.slice(0, -1).join(", ")} and ${kinds[kinds.length - 1]}` : kinds[0];
  const description = docs.length
    ? `Download the ${name} ${list}: a ${s.brand === "Valda" ? "VALDA" : s.brand} system, ready to specify European windows and doors on projects in the USA.`
    : `Technical documentation for ${name}. Our team can send datasheets, CAD and specifications for this system, for European windows and doors in the USA.`;
  return {
    ...pageMeta({
      title: `${name} Technical Downloads`,
      description,
      path: `/downloads/${s.slug}`,
      image: HERO_BY_GROUP[navGroup(s)],
    }),
    // Packs with nothing on file yet are thin pages: keep them out of the index until files land.
    ...(docs.length ? {} : { robots: { index: false, follow: true } }),
  };
}

const HERO_BY_GROUP: Record<string, string> = {
  Windows: "/images/arch-1.jpg",
  Doors: "/images/arch-3.jpg",
  "Sliding & Folding": "/images/arch-5.jpg",
  Facades: "/images/hero.jpg",
};

// Resolve a public href against /public and report presence + size.
function fileInfo(href: string): { exists: boolean; size?: string } {
  try {
    const abs = path.join(process.cwd(), "public", href);
    const st = fs.statSync(abs);
    if (!st.isFile()) return { exists: false };
    const mb = st.size / 1_048_576;
    return { exists: true, size: mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(st.size / 1024))} KB` };
  } catch {
    return { exists: false };
  }
}

export default async function SystemDownloadsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSystem(slug);
  if (!s) notFound();

  // Only files that actually exist are shown; no "available on request" rows.
  const pack: (PackItem & { size?: string })[] = systemPack(s)
    .map((d) => ({ ...d, ...fileInfo(d.href) }))
    .filter((d) => d.exists);
  const heroImg = HERO_BY_GROUP[navGroup(s)] ?? "/images/hero.jpg";

  return (
    <PinnedHero eyebrow="Downloads" title={s.name} intro="Technical documentation: datasheets, CAD, Florida approvals and specifications." image={heroImg}>
      {/* /01 technical pack */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <Link href={`/products/system/${s.slug}`} className="inline-flex items-center gap-2 text-[14px] leading-[22px] text-mute transition-colors hover:text-char">
            <ArrowLeft size={14} /> Back to {s.name}
          </Link>

          <SwHead
            label="Technical pack"
            n="01"
            layout="stacked"
            className="mt-10"
            title={<span className="block max-w-[720px]">Everything you need to specify, approve and install.</span>}
          />
          {pack.length > 0 && (
            <p className="mt-6 text-[16px] leading-6 text-slate">
              {pack.length} document{pack.length > 1 ? "s" : ""} ready to download.
            </p>
          )}

          {/* Florida approval: calm reassurance */}
          {s.flNumbers.length > 0 && (
            <div className="mt-14 flex flex-col gap-4 rounded-lg bg-panel p-5 sm:flex-row sm:items-center sm:justify-between md:mt-20">
              <span className="inline-flex items-center gap-3 text-[16px] font-medium leading-6 text-char">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-char">
                  <ShieldCheck size={16} />
                </span>
                Florida Product Approved
              </span>
              <div className="flex flex-wrap gap-1.5">
                {s.flNumbers.map((fl) => (
                  <span key={fl} className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">
                    {fl}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* document list: only files that exist */}
          {pack.length > 0 ? (
            <ul className={`space-y-3 ${s.flNumbers.length > 0 ? "mt-3" : "mt-14 md:mt-20"}`}>
              {pack.map((d) => (
                <li key={d.key}>
                  <a
                    href={d.href}
                    download
                    className="group flex items-center justify-between gap-4 rounded-lg bg-panel p-5"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[16px] font-medium leading-6 text-char">{d.label}</span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">{d.kind}</span>
                      </span>
                      <span className="mt-1 block text-[14px] leading-[22px] text-mute">
                        {d.desc}
                        {d.size ? ` · ${d.size}` : ""}
                      </span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                      <Download size={16} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`rounded-lg bg-panel px-6 py-14 text-center md:px-8 ${s.flNumbers.length > 0 ? "mt-3" : "mt-14 md:mt-20"}`}>
              <p className="mx-auto max-w-md text-[16px] leading-6 text-slate">
                Documentation for {s.name} is being prepared. Our team can send you datasheets, CAD, approvals and specifications directly.
              </p>
              <Button href="/contact" className="mt-8">
                Request documentation <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* /02 all resources */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="All resources" n="02" layout="stacked" title="Catalogues & Colour Charts" />
          <div className="mt-10">
            <Button href="/downloads">All downloads <ArrowRight size={16} /></Button>
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
