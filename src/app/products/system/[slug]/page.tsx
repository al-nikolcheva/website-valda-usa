import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { ProductPerformance } from "@/components/product-performance";
import { Openings, type OpeningType } from "@/components/openings";
import { PRODUCTS, getSystem, navGroup, cutImage, isNavGroup, systemInGroup } from "@/lib/products";
import { PROJECTS } from "@/lib/projects";

export function generateStaticParams() {
  return PRODUCTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSystem(slug);
  return { title: s ? s.name : "Product" };
}

const HERO_BY_GROUP: Record<string, string> = {
  Windows: "/images/arch-1.jpg",
  Doors: "/images/arch-3.jpg",
  "Sliding & Folding": "/images/arch-5.jpg",
  Facades: "/images/hero.jpg",
};

const FINISHES = [
  { c: "#2b2b2b", n: "Jet black" },
  { c: "#6f7378", n: "Window grey" },
  { c: "#b8b4aa", n: "Sand" },
  { c: "#33424f", n: "Slate blue" },
  { c: "#6b4a2f", n: "Walnut" },
  { c: "#e9e7e2", n: "Chalk" },
];

// Map the data's opening-type strings onto the animated figures we have.
function animationTypes(openingTypes: string[], category = ""): OpeningType[] {
  const out: OpeningType[] = [];
  const add = (t: OpeningType) => { if (!out.includes(t)) out.push(t); };
  const scan = (t: string) => {
    if (/lift.*slide/.test(t)) add("liftslide");
    else if (/fold|bi.?fold|leaf|leaves/.test(t)) add("folding");
    else if (/slid/.test(t)) add("sliding");
    else if (/tilt.*turn|turn.*tilt|dual.?action/.test(t)) add("tt");
    else if (/hopper/.test(t)) add("hopper");
    else if (/awning/.test(t)) add("awning");
    else if (/casement/.test(t)) add("casement");
    else if (/fixed|picture/.test(t)) add("fixed");
    else if (/door|entry|balcony|hinged|terrace|swing|sidelite/.test(t)) add("door");
  };
  for (const raw of openingTypes) scan(raw.toLowerCase());
  // Fallback: if nothing matched (e.g. an opening labelled only "Up to 8 leaves"),
  // read the category so folding / sliding systems still get their figure.
  if (out.length === 0 && category) scan(category.toLowerCase());
  return out;
}

export default async function SystemPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ category?: string }> }) {
  const { slug } = await params;
  const { category } = await searchParams;
  const s = getSystem(slug);
  if (!s) notFound();

  // When reached from a category (e.g. Doors), show only that category's openings.
  const activeGroup = isNavGroup(category) ? category : null;
  const scoped = activeGroup ? systemInGroup(s, activeGroup) : s;
  const view = scoped.openings.length ? scoped : s;

  const group = navGroup(s);
  const heroImg = HERO_BY_GROUP[activeGroup ?? group] ?? "/images/hero.jpg";
  const related = PROJECTS.slice(0, 3);
  const cut = cutImage(s.slug);
  const openTypes = animationTypes(view.openingTypes, s.category);
  const impactShort = s.impact ? s.impact.split("—")[0].split("·")[0].trim() : null;

  // At-a-glance strip — the fastest answer to "is this system a candidate".
  const glance: { k: string; v: string }[] = [];
  if (s.flNumbers.length) glance.push({ k: "Florida approval", v: s.flNumbers.join(" · ") });
  if (impactShort) glance.push({ k: "Impact", v: impactShort });
  glance.push({ k: "HVHZ", v: s.hvhz ? "Yes" : "No" });
  if (s.summary.designPressure) glance.push({ k: "Design pressure", v: /^up to/i.test(s.summary.designPressure) ? s.summary.designPressure : `Up to ${s.summary.designPressure}` });
  if (s.summary.largestOpening) glance.push({ k: "Max opening", v: s.summary.largestOpening });
  if (s.summary.waterResistance) glance.push({ k: "Water resistance", v: s.summary.waterResistance });

  return (
    <PinnedHero eyebrow={`${s.brand} · ${s.category}`} title={s.name} image={heroImg}>
      {/* ── OVERVIEW ─────────────────────────────────────── */}
      <section className="bg-pure pt-24 md:pt-32">
        <Container>
          <div className={`grid items-center gap-x-20 gap-y-14 ${cut ? "lg:grid-cols-[1.05fr_0.95fr]" : ""}`}>
            <div className={cut ? "" : "max-w-2xl"}>
              <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-slate">
                <span className="tabular-nums text-blue-bright">01</span>
                <span className="h-px w-8 bg-slate/30" /> {s.brand} · {s.category}
              </p>
              <h1 className="mt-8 headline text-[clamp(2.2rem,4.8vw,3.9rem)] leading-[1.0] tracking-[-0.025em] text-ink">
                {s.copy.headline}
              </h1>

              {/* trust stickers */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {s.flNumbers.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue/10 px-3.5 py-1.5 text-[12px] font-semibold tracking-tight text-blue ring-1 ring-blue/25">
                    <ShieldCheck size={14} strokeWidth={2.4} /> Florida Product Approved
                  </span>
                )}
                {impactShort && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-tight text-ink ring-1 ring-ink/10">
                    <ShieldCheck size={14} strokeWidth={2.4} /> {s.hvhz ? "Hurricane impact rated" : impactShort}
                  </span>
                )}
              </div>

              <p className="mt-8 max-w-xl text-[18px] leading-[1.75] text-slate">{s.copy.paragraph}</p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="/contact" variant="ink">Talk to us about a project <ArrowRight size={15} /></Button>
                <Button href="/products" variant="outline">Browse all systems</Button>
              </div>
            </div>

            {cut && (
              <div className="relative">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_42%,rgba(31,78,140,0.10),transparent_72%)]" />
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-mist/80 bg-gradient-to-b from-white via-paper to-mist/40 shadow-[0_50px_90px_-50px_rgba(20,24,29,0.4)]">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70" />
                  <Image src={cut} alt={`${s.name} section cut`} fill className="object-contain p-10 md:p-14 [filter:drop-shadow(0_28px_48px_rgba(20,24,29,0.2))]" sizes="(max-width:1024px) 90vw, 520px" />
                  <span className="absolute bottom-5 left-6 font-mono text-[10px] uppercase tracking-[0.16em] text-slate/70">Profile section</span>
                </div>
              </div>
            )}
          </div>

          {/* at-a-glance strip */}
          {glance.length > 0 && (
            <div className="mt-20 grid grid-cols-2 gap-x-10 gap-y-9 border-t border-mist pt-10 sm:grid-cols-3 lg:grid-cols-6">
              {glance.map((g) => (
                <div key={g.k}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">{g.k}</p>
                  <p className="mt-2.5 headline text-[18px] leading-[1.15] tracking-[-0.01em] text-ink">{g.v}</p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── CONFIGURATIONS (animation) ───────────────────── */}
      {openTypes.length > 0 && (
        <section id="openings" className="scroll-mt-24 bg-paper py-24 md:py-32">
          <Container>
            <Band n="02" label="Configurations" title="How this system opens." sub="Hover or tap a unit to see the real opening motion." />
            <div className="mt-14">
              <Openings types={openTypes} />
            </div>
          </Container>
        </section>
      )}

      {/* ── PERFORMANCE & APPROVALS (architect / engineer) ── */}
      <section id="data" className="scroll-mt-24 bg-pure py-24 md:py-32">
        <Container>
          <Band n="03" label="Performance & approvals" title="Certified for Florida, configuration by configuration." sub="Every FL approval number, on the page — the one thing no competitor selling these systems publishes." />
          <div className="mt-12">
            <ProductPerformance system={view} />
          </div>
        </Container>
      </section>

      {/* ── COLOURS & FINISHES ───────────────────────────── */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <Band n="04" label="Colours & finishes" title="Any RAL, anodised, or wood-effect." sub="Matched to your architecture, inside and out, including dual-colour configurations." />
          <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {FINISHES.map((f) => (
              <div key={f.n} className="group">
                <div className="aspect-square w-full rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-ink/10 transition-transform duration-300 group-hover:scale-[1.03]" style={{ background: f.c }} />
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{f.n}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-xl text-[14px] leading-relaxed text-slate">A selection — the full RAL range, anodised and wood-effect foils are available on request. <Link href="/contact" className="text-blue underline-offset-4 hover:underline">Ask for a colour match</Link>.</p>
        </Container>
      </section>

      {/* ── PROOF ────────────────────────────────────────── */}
      <section className="bg-pure py-24 md:py-32">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <Band n="05" label="Proof" title="Built with our systems." />
            <Link href="/projects" className="hidden shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-blue hover:text-blue-bright sm:inline-flex">All projects <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[20px]">
                    <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                  <h3 className="mt-4 headline text-[19px] tracking-[-0.01em] text-ink">{p.name}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{p.location}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

    </PinnedHero>
  );
}

function Band({ n, label, title, sub }: { n?: string; label: string; title: string; sub?: string }) {
  return (
    <div className="border-t border-mist pt-8">
      <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
        {n && <span className="tabular-nums text-blue-bright">{n}</span>}
        {label}
      </p>
      <h2 className="mt-6 max-w-3xl headline text-[clamp(1.9rem,3.8vw,3.1rem)] leading-[1.03] tracking-[-0.01em] text-ink">{title}</h2>
      {sub && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate">{sub}</p>}
    </div>
  );
}
