import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Download, FileText, ShieldCheck } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { PRODUCTS, getSystem, navGroup } from "@/lib/products";
import { systemPack, type PackItem } from "@/lib/downloads";

export function generateStaticParams() {
  return PRODUCTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSystem(slug);
  return { title: s ? `${s.name} — Downloads` : "Downloads" };
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

  // Only files that actually exist are shown — no "available on request" rows.
  const pack: (PackItem & { size?: string })[] = systemPack(s)
    .map((d) => ({ ...d, ...fileInfo(d.href) }))
    .filter((d) => d.exists);
  const heroImg = HERO_BY_GROUP[navGroup(s)] ?? "/images/hero.jpg";

  return (
    <PinnedHero eyebrow="Downloads" title={s.name} intro="Technical documentation — datasheets, CAD, Florida approvals and specifications." image={heroImg}>
      <section className="bg-pure pt-16 md:pt-20">
        <Container>
          <Link href={`/products/system/${s.slug}`} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate transition-colors hover:text-ink">
            <ArrowLeft size={14} /> Back to {s.name}
          </Link>

          <div className="mt-10 flex flex-col gap-6 border-t border-mist pt-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-slate">
                <span className="tabular-nums text-blue-bright">01</span>
                <span className="h-px w-8 bg-slate/30" /> Technical pack
              </p>
              <h2 className="mt-6 max-w-2xl headline text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.03] tracking-[-0.01em] text-ink">
                Everything you need to specify, approve and install.
              </h2>
            </div>
            {pack.length > 0 && (
              <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
                {pack.length} document{pack.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* FL approval callout */}
          {s.flNumbers.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-blue/20 bg-blue/[0.05] p-6">
              <span className="inline-flex items-center gap-1.5 font-semibold tracking-tight text-blue">
                <ShieldCheck size={16} strokeWidth={2.4} /> Florida Product Approved
              </span>
              <div className="flex flex-wrap gap-2">
                {s.flNumbers.map((fl) => (
                  <span key={fl} className="rounded-full bg-white px-3 py-1 font-mono text-[11px] tracking-tight text-blue ring-1 ring-blue/20">
                    {fl}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* document list — only files that exist */}
          {pack.length > 0 ? (
            <ul className="mt-10 divide-y divide-mist overflow-hidden rounded-2xl border border-mist">
              {pack.map((d) => (
                <li key={d.key} className="flex flex-col gap-4 bg-pure p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
                      <FileText size={17} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[15px] font-medium text-ink">{d.label}</span>
                        <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-slate">{d.kind}</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate">{d.desc}</p>
                    </div>
                  </div>
                  <a
                    href={d.href}
                    download
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-blue sm:self-auto"
                  >
                    <Download size={15} /> Download{d.size ? <span className="font-mono text-[11px] text-white/60">{d.size}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 rounded-2xl border border-mist bg-paper px-8 py-14 text-center">
              <p className="mx-auto max-w-md text-[15px] leading-relaxed text-slate">
                Documentation for {s.name} is being prepared. Our team can send you datasheets, CAD, approvals and specifications directly.
              </p>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-blue">
                Request documentation <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </Container>
      </section>

      <section className="bg-paper py-20 md:py-24">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">All resources</p>
              <h2 className="mt-4 headline text-[clamp(1.5rem,3vw,2.2rem)] tracking-[-0.01em] text-ink">Catalogues & colour charts</h2>
            </div>
            <Button href="/downloads" variant="outline">All downloads</Button>
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
