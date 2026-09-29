import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { SwHead } from "@/components/sw/head";
import { ProductPerformance } from "@/components/product-performance";
import { Openings, type OpeningType } from "@/components/openings";
import { PRODUCTS, getSystem, navGroup, cutImage, isNavGroup, systemInGroup, systemModel } from "@/lib/products";
import { SystemVisual } from "@/components/system-visual";
import { PROJECTS } from "@/lib/projects";
import { JsonLd } from "@/components/json-ld";
import { abs, brandLabel, breadcrumbLd, noDash, pageMeta, systemDescription, systemKind, systemTitle } from "@/lib/seo";

export function generateStaticParams() {
  return PRODUCTS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSystem(slug);
  if (!s) return { title: "Product" };
  return pageMeta({
    title: systemTitle(s),
    description: systemDescription(s),
    path: `/products/system/${s.slug}`,
    image: HERO_BY_GROUP[navGroup(s)],
    imageAlt: `${noDash(s.name)} by ${brandLabel(s)}`,
  });
}

// Category landing page for each nav group (breadcrumb middle step).
const GROUP_PATH: Record<string, string> = {
  Windows: "/products/windows",
  Doors: "/products/doors",
  "Sliding & Folding": "/products/sliding",
  Facades: "/products/facades",
};

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

// Product data may contain em-dashes; never render them.
const nd = (t: string) => t.replace(/\s*—\s*/g, ", ");

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
  const model = systemModel(s.slug);
  const visual = cut || model;
  const openTypes = animationTypes(view.openingTypes, s.category);
  const impactShort = s.impact ? s.impact.split("—")[0].split("·")[0].trim() : null;

  // At-a-glance facts: the fastest answer to "is this system a candidate".
  const glance: { k: string; v: string }[] = [];
  if (s.flNumbers.length) glance.push({ k: "Florida approval", v: s.flNumbers.length === 1 ? s.flNumbers[0] : `${s.flNumbers.length} approvals` });
  if (impactShort) glance.push({ k: "Impact", v: impactShort });
  glance.push({ k: "HVHZ", v: s.hvhz ? "Yes" : "No" });
  if (s.summary.designPressure) glance.push({ k: "Design pressure", v: /^up to/i.test(s.summary.designPressure) ? s.summary.designPressure : `Up to ${s.summary.designPressure}` });
  if (s.summary.largestOpening) glance.push({ k: "Max opening", v: s.summary.largestOpening });
  if (s.summary.waterResistance) glance.push({ k: "Water resistance", v: s.summary.waterResistance });

  // Sequential section numbers + alternating surfaces (configurations is optional).
  const hasOpenings = openTypes.length > 0;
  const order = ["overview", ...(hasOpenings ? ["openings"] : []), "perf", "colours", "proof"];
  const sec = (key: string) => {
    const i = order.indexOf(key);
    const odd = i % 2 === 0;
    return { n: String(i + 1).padStart(2, "0"), bg: odd ? "bg-white" : "bg-panel", card: odd ? "bg-panel" : "bg-white" };
  };
  const secOverview = sec("overview");
  const secOpenings = sec("openings");
  const secPerf = sec("perf");
  const secColours = sec("colours");
  const secProof = sec("proof");

  // Structured data: product facts from the catalogue only. No offers, ratings or reviews.
  const path = `/products/system/${s.slug}`;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: noDash(s.name),
    brand: { "@type": "Brand", name: brandLabel(s) },
    manufacturer: { "@type": "Organization", name: "VALDA", url: abs("/") },
    category: systemKind(s),
    description: s.copy?.paragraph ? nd(s.copy.paragraph) : systemDescription(s),
    image: abs(cut ?? heroImg),
    url: abs(path),
  };
  const crumbsLd = breadcrumbLd([
    ["Home", "/"],
    ["Products", "/products"],
    [group, GROUP_PATH[group] ?? "/products"],
    [noDash(s.name), path],
  ]);

  return (
    <PinnedHero eyebrow={`${s.brand} · ${s.category}`} title={s.name} image={heroImg}>
      <JsonLd data={[productLd, crumbsLd]} />
      {/* ── OVERVIEW ─────────────────────────────────────── */}
      <section className={`${secOverview.bg} py-28 md:py-36`}>
        <Container>
          <div className="flex items-baseline justify-between">
            <p className="text-[14px] leading-[22px] text-mute">Overview</p>
            <p className="text-[14px] leading-[22px] text-mute">/{secOverview.n}</p>
          </div>

          <div className={`mt-8 grid items-center gap-x-16 gap-y-12 ${visual ? "lg:grid-cols-[1.05fr_0.95fr]" : ""}`}>
            <div className={visual ? "" : "max-w-3xl"}>
              <h2 className="sw-h text-[clamp(2.2rem,4.4vw,3.5rem)] text-char">{s.copy?.headline ? nd(s.copy.headline) : s.name}</h2>

              {/* trust chips */}
              {(s.flNumbers.length > 0 || impactShort) && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {s.flNumbers.length > 0 && (
                    <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-panel px-4 text-[14px] text-char">
                      <ShieldCheck size={15} className="text-blue" /> Florida Product Approved
                    </span>
                  )}
                  {impactShort && (
                    <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-panel px-4 text-[14px] text-char">
                      <ShieldCheck size={15} className="text-mute" /> {s.hvhz ? "Hurricane impact rated" : impactShort}
                    </span>
                  )}
                </div>
              )}

              {s.copy?.paragraph && <p className="mt-8 max-w-xl text-[16px] font-medium leading-6 text-char">{nd(s.copy.paragraph)}</p>}

              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="/contact" variant="ink">Talk to us about a project <ArrowRight size={15} /></Button>
                <Button href="/products" variant="outline">Browse all systems</Button>
              </div>
            </div>

            {visual && <SystemVisual name={s.name} cut={cut} model={model} />}
          </div>

          {/* key facts */}
          {glance.length > 0 && (
            <div className="mt-16 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {glance.map((g) => (
                <div key={g.k} className="rounded-lg bg-panel p-5">
                  <p className="text-[14px] leading-[22px] text-mute">{g.k}</p>
                  <p className="sw-h mt-6 break-words text-[22px] tabular-nums text-char md:text-[28px]">{nd(g.v)}</p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── CONFIGURATIONS (animation) ───────────────────── */}
      {hasOpenings && (
        <section id="openings" className={`scroll-mt-24 ${secOpenings.bg} py-28 md:py-36`}>
          <Container>
            <SwHead layout="stacked" label="Configurations" n={secOpenings.n} title="How this system opens." />
            <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">Tap a unit to watch how it opens.</p>
            <div className="mt-14">
              <Openings types={openTypes} />
            </div>
          </Container>
        </section>
      )}

      {/* ── PERFORMANCE & APPROVALS ──────────────────────── */}
      <section id="data" className={`scroll-mt-24 ${secPerf.bg} py-28 md:py-36`}>
        <Container>
          <SwHead layout="stacked" label="Performance & approvals" n={secPerf.n} title="Certified for Florida, configuration by configuration." />
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">Every FL approval number, on the page: the one thing no competitor selling these systems publishes.</p>
          <div className="mt-14">
            <ProductPerformance system={view} />
          </div>
        </Container>
      </section>

      {/* ── COLOURS & FINISHES ───────────────────────────── */}
      <section className={`${secColours.bg} py-28 md:py-36`}>
        <Container>
          <SwHead layout="stacked" label="Colours & finishes" n={secColours.n} title="Any RAL, anodised, or wood-effect." />
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">Matched to your architecture, inside and out, including dual-colour configurations.</p>
          <div className="mt-14 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {FINISHES.map((f) => (
              <div key={f.n} className={`group rounded-lg ${secColours.card} p-2 pb-4`}>
                <div className="aspect-square w-full rounded-md ring-1 ring-char/10 transition-transform duration-500 group-hover:scale-[0.98]" style={{ background: f.c }} />
                <p className="mt-4 px-2 text-[14px] leading-[22px] text-char">{f.n}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-xl text-[14px] leading-[22px] text-slate">
            A selection. The full RAL range, anodised and wood-effect foils are available on request.{" "}
            <Link href="/contact" className="text-char underline underline-offset-4 transition-colors hover:text-blue">Ask for a colour match</Link>.
          </p>
        </Container>
      </section>

      {/* ── PROOF ────────────────────────────────────────── */}
      <section className={`${secProof.bg} py-28 md:py-36`}>
        <Container>
          <SwHead layout="stacked" label="Proof" n={secProof.n} title="Built with our systems." />
          <div className="mt-14 grid gap-x-2 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-panel">
                    <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                  <h3 className="sw-h mt-5 text-[24px] text-char transition-colors group-hover:text-blue">{p.name}</h3>
                  <p className="mt-1 text-[14px] leading-[22px] text-mute">{p.location}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <Link href="/projects" className="mt-12 inline-flex items-center gap-2 text-[14px] text-char underline-offset-4 transition-colors hover:text-blue hover:underline">
            All projects <ArrowRight size={14} />
          </Link>
        </Container>
      </section>
    </PinnedHero>
  );
}
