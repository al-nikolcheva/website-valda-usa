import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check, Download } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { ProductTabs } from "@/components/product-tabs";
import { ProductSection } from "@/components/product-section";
import { ModelViewer } from "@/components/model-viewer";
import {
  SYSTEMS,
  FAMILIES,
  systemImage,
  systemFeatures,
  systemOpenings,
  systemDownloads,
  systemRender,
  systemModel,
  systemProfile,
} from "@/lib/systems";
import { PROJECTS } from "@/lib/projects";

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SYSTEMS.find((x) => x.slug === slug);
  return { title: s ? s.name : "Product" };
}

const FINISHES = ["#2b2b2b", "#6f7378", "#b8b4aa", "#33424f", "#6b4a2f", "#e9e7e2"];

export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SYSTEMS.find((x) => x.slug === slug);
  if (!s) notFound();
  const family = FAMILIES.find((f) => f.slug === s.family);
  const img = systemImage(s.slug);
  const related = PROJECTS.slice(0, 3);
  const features = systemFeatures(s);
  const openings = systemOpenings(s);
  const downloads = systemDownloads(s.slug);
  const model = systemModel(s.slug);
  const hasRealProfile = !!systemProfile(s.slug);
  const hasNonImpact = s.approvals.some((a) => a.impact === "Non-Impact");
  const certChips = [
    s.hvhz !== "No" && "HVHZ approved",
    s.impact !== "Non-Impact" && `${s.impact} impact`,
    hasNonImpact && "Non-impact options",
    "Florida Product Approved",
    "NAMI certified",
    "NFRC rated",
    "AAMA / NAFS",
  ].filter(Boolean) as string[];

  return (
    <PinnedHero eyebrow={`${family?.brand ?? ""} · ${s.material}`} title={s.name} intro={s.summary} image={img}>

      {/* CERTIFICATION CHIPS */}
      <section className="border-b border-mist bg-paper">
        <Container>
          <div className="flex flex-wrap items-center gap-2.5 py-7 md:py-8">
            {certChips.map((chip) => (
              <span key={chip} className="inline-flex items-center gap-1.5 rounded-full border border-blue/20 bg-blue/[0.06] px-4 py-1.5 text-[13px] font-medium text-blue">
                <Check size={13} /> {chip}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* OVERVIEW + FEATURES */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className={hasRealProfile ? "max-w-3xl" : "grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20"}>
            <Reveal>
              <SectionHead label="Overview" title={`Why specify ${s.name}.`} />
              <p className="mt-6 max-w-xl text-[16px] leading-[1.85] text-slate">{s.summary}</p>
              <ul className="mt-9 space-y-4">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                      <Check size={13} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-2.5">
                {openings.map((o) => (
                  <span key={o} className="rounded-full border border-mist px-4 py-1.5 text-[13px] text-ink/70">{o}</span>
                ))}
              </div>
            </Reveal>
            {!hasRealProfile && (
              <Reveal delay={0.1} className="lg:self-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-mist/50 via-paper to-white">
                  <Image src={systemRender(s)} alt={`${s.name}`} fill className="object-contain p-5" sizes="(max-width:1024px) 100vw, 42vw" />
                </div>
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      {/* INTERACTIVE CROSS-SECTION */}
      <ProductSection material={s.material === "Aluminium" ? "aluminium" : "pvc"} slug={s.slug} />

      {/* 3D MODEL */}
      {model && (
        <section className="bg-paper py-24 md:py-32">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHead label="3D model" title="Turn it over. Look inside." />
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Drag to rotate · scroll to zoom</p>
            </div>
            <div className="mt-12 h-[62vh] min-h-[440px] overflow-hidden rounded-2xl border border-mist bg-gradient-to-br from-white via-paper to-mist/40">
              <ModelViewer src={model} alt={`${s.name} 3D profile model`} />
            </div>
          </Container>
        </section>
      )}

      {/* PRODUCT DATA — TABS */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHead label="Product data" title="Specifications, performance & approvals." />
          <div className="mt-12">
            <ProductTabs system={s} />
          </div>
          <p className="mt-8 max-w-2xl text-[13px] leading-relaxed text-slate">
            Full performance data, glazing options and sealed shop drawings are available on request —{" "}
            <a href="/contact" className="text-blue underline-offset-4 hover:underline">talk to our team</a>.
          </p>
        </Container>
      </section>

      {/* FINISHES */}
      <section className="bg-white py-20 md:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-[0.6fr_1fr] md:items-center">
            <Reveal>
              <SectionHead label="Colours & finishes" title="Any RAL, anodised, or wood-effect." />
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate">
                Matched to your architecture, inside and out, including dual-colour configurations.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-4">
                {FINISHES.map((c) => (
                  <div key={c} className="h-16 w-16 rounded-lg ring-1 ring-ink/10" style={{ background: c }} />
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* DOWNLOADS */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <SectionHead label="Downloads" title="Documentation for specifiers." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {downloads.map((d, i) => (
              <a
                key={`${d.label}-${d.kind}-${i}`}
                href={d.href}
                {...(d.file ? { download: "" } : {})}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-mist bg-white p-6 transition-colors hover:border-blue/40"
              >
                <span>
                  <span className="block headline text-[15px] text-ink">{d.label}</span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-slate">
                    {d.kind}{d.file ? " · download" : ""}
                  </span>
                </span>
                <Download size={18} className="shrink-0 text-slate transition-colors group-hover:text-blue" />
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* RELATED PROJECTS */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHead label="Proof" title="Projects built with this system." />
            <Link href="/projects" className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-blue sm:inline-flex">
              All projects <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                  <h3 className="mt-4 headline text-lg tracking-[-0.01em]">{p.name}</h3>
                  <p className="mt-1 text-[14px] text-slate">{p.location}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-blue py-20 text-white">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl headline text-3xl tracking-[-0.01em] md:text-4xl">Request a quote for {s.name}</h2>
          <Button href="/contact" variant="light">Request a quote <ArrowRight size={16} /></Button>
        </Container>
      </section>
    </PinnedHero>
  );
}
