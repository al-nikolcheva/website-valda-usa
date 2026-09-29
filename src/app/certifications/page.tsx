import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { Button } from "@/components/ui/button";
import { CertMatrix, type MatrixOpening, type MatrixRow } from "@/components/cert-matrix";
import { NAV_GROUPS, PRODUCTS, navGroup, navGroups, type Brand, type Opening, type ProductSystem } from "@/lib/products";
import { FAMILIES, type FamilySlug } from "@/lib/systems";

export const metadata: Metadata = pageMeta({
  title: "Florida Product Approval & Impact Certifications",
  description:
    "Every tested VALDA window and door system and its certifications: Florida Product Approval, HVHZ, hurricane impact, AAMA/WDMA/CSA, NAMI and design pressure.",
  path: "/certifications",
  image: "/images/project-milwaukee-2.jpg",
});

/* ── Data: built from the product catalogue (src/data/valda-products.json) ── */

const FAMILY_OF: Record<Brand, FamilySlug> = { Valda: "valda", Reynaers: "reynaers", Kömmerling: "koemmerling" };
const BRAND_ORDER: Brand[] = ["Valda", "Reynaers", "Kömmerling"];

// Display-only tidy of catalogue strings: the source uses " — " as a separator.
const tidy = (s?: string) => s?.replace(/\s+—\s+/g, ", ");

function holderOf(s: ProductSystem): string | null {
  if (!s.flNumbers.length) return null;
  if (s.brand === "Valda") return "VALDA";
  return FAMILIES.find((f) => f.slug === FAMILY_OF[s.brand])?.holder ?? null;
}

function materialOf(s: ProductSystem): "Aluminum" | "PVC" {
  if (s.brand === "Reynaers") return "Aluminum";
  if (s.brand === "Kömmerling") return "PVC";
  return /pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminum";
}

// First phrase of the catalogue's impact line, e.g. "Large & small missile".
function impactShort(s: ProductSystem): string | null {
  if (!s.impact) return null;
  return s.impact.split(/\s+[—·]\s+/)[0].trim();
}

// Headline design pressure from the catalogue summary. Rated pressures only:
// downsized tests and overload figures are left out. Falls back to the
// performance class where the summary carries no psf figure.
function dpOf(s: ProductSystem): MatrixRow["dp"] {
  const raw = s.summary.designPressure;
  if (!raw) return null;
  const nums = raw
    .split("·")
    .filter((seg) => /psf/i.test(seg) && !/downsized|overload/i.test(seg))
    .flatMap((seg) => [...seg.matchAll(/\d+(?:\.\d+)?/g)].map((m) => parseFloat(m[0])));
  if (nums.length) return { value: `±${Math.max(...nums)} psf`, upTo: true };
  const cls = raw.match(/\b(?:[A-Z]{1,2}-)?PG\d+/);
  return cls ? { value: cls[0], upTo: /^up to/i.test(raw) } : null;
}

function openingOf(o: Opening): MatrixOpening {
  const water = o.waterLimited || /psf/.test(o.waterResistance ?? "") ? tidy(o.waterResistance) : undefined;
  return {
    name: tidy(o.opening)!,
    ref: o.approval && o.approval !== "Test report" && o.approval !== "System data" ? o.approval : undefined,
    hvhz: o.hvhz,
    dp: tidy(o.designPressure),
    water,
  };
}

function toRow(s: ProductSystem): MatrixRow {
  const florida = s.openings.filter((o) => o.held === "florida-approval");
  const aama = s.openings.filter((o) => o.held === "aama-tested");
  return {
    slug: s.slug,
    name: tidy(s.name)!,
    brand: s.brand === "Valda" ? "VALDA" : s.brand,
    material: materialOf(s),
    group: navGroup(s),
    types: navGroups(s).join(" · "),
    florida: s.flNumbers.length > 0,
    hvhz: s.openings.some((o) => o.hvhz),
    impact: impactShort(s),
    aama: aama.length > 0,
    nami: s.openings.some((o) => /^NI\d/.test(o.certificate ?? "")),
    dp: dpOf(s),
    holder: holderOf(s),
    floridaOpenings: florida.map(openingOf),
    aamaOpenings: aama.map(openingOf),
  };
}

const ROWS: MatrixRow[] = [...PRODUCTS]
  .sort((a, b) => BRAND_ORDER.indexOf(a.brand) - BRAND_ORDER.indexOf(b.brand))
  .map(toRow);


/* ── The standards, in plain language ─────────────────────────────── */
const STANDARDS = [
  {
    name: "Florida Product Approval",
    logo: "/images/cert/logos/florida.png",
    line: "Florida's statewide approval under the Florida Building Code, the most demanding fenestration approval in the country. Each product is independently tested before it is approved.",
  },
  {
    name: "HVHZ",
    logo: "/images/cert/logos/hvhz.png",
    line: "The High-Velocity Hurricane Zone: Miami-Dade and Broward counties. Approval here means passing large-missile impact and cyclic wind pressure tests (TAS 201, 202 and 203).",
  },
  {
    name: "NAMI",
    logo: "/images/cert/logos/nami.png",
    line: "An independent certification body. NAMI certifies a product's structural, air, water and impact performance, and inspects the factory that makes it.",
  },
  {
    name: "AAMA / WDMA / CSA",
    logo: "/images/cert/logos/aama.png",
    line: "101 / I.S.2 / A440, the North American standard for windows and doors. A tested product gets a class and grade, such as CW-PG60: the grade is the design pressure it was tested to, in psf.",
  },
  {
    name: "ISO 9001",
    logo: "/images/cert/logos/iso.png",
    line: "The international standard for quality management: how our factories plan, make and check every order.",
  },
  {
    name: "CE",
    logo: "/images/cert/logos/ce.png",
    line: "The European conformity mark for construction products, showing our windows and doors meet the requirements for sale across Europe.",
  },
];

const GLOSSARY = [
  { term: "Impact rated", def: "Tested against wind-borne debris. Large missile is the toughest level." },
  { term: "Design pressure", def: "The wind load a window or door is rated to hold, in pounds per square foot (psf). Higher is stronger." },
  { term: "Florida approved and AAMA tested", def: "Two separate routes. Some systems hold both, for different configurations. Open a row to see which." },
];

export default function CertificationsPage() {
  return (
    <PinnedHero
      eyebrow="Certifications"
      title="Approved for the USA."
      intro="Every tested VALDA system and the certifications it holds, on one page."
      image="/images/project-milwaukee-2.jpg"
    >
      {/* /01 overview matrix */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead
            label="At a glance"
            n="01"
            layout="stacked"
            title={<span className="block max-w-[720px]">Every system, every certification.</span>}
          />
          <p className="mt-6 max-w-xl text-[16px] font-medium leading-6 text-char">
            All our tested windows, doors, sliding systems and facades in one view. Open a row to see each approved configuration.
          </p>

          <div className="mt-14 md:mt-20">
            <CertMatrix rows={ROWS} groups={NAV_GROUPS} />
          </div>

          <dl className="mt-12 grid gap-6 border-t border-char/10 pt-8 md:grid-cols-3 md:gap-10">
            {GLOSSARY.map((g) => (
              <div key={g.term}>
                <dt className="text-[14px] leading-[22px] text-char">{g.term}</dt>
                <dd className="mt-1 text-[14px] leading-[22px] text-slate">{g.def}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* /02 the standards explained */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead
            label="The standards"
            n="02"
            layout="stacked"
            title={<span className="block max-w-[720px]">What each certification means.</span>}
          />
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">
            The marks you will see across our systems, explained in plain language.
          </p>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 md:mt-20 md:gap-4 lg:grid-cols-3">
            {STANDARDS.map((c, i) => (
              <Reveal key={c.name} delay={(i % 3) * 0.08} className="h-full">
                <div className="flex h-full flex-col rounded-lg bg-white p-6 md:p-7">
                  <div className="relative h-16 w-20">
                    <Image src={c.logo} alt="" fill className="object-contain object-left mix-blend-multiply" sizes="80px" />
                  </div>
                  <h3 className="sw-h mt-10 text-[24px] text-char">{c.name}</h3>
                  <p className="mt-2 text-[16px] leading-6 text-slate">{c.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* /03 how we test teaser */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="How we test" n="03" layout="stacked" title={<span className="block max-w-[720px]">Behind every tick.</span>} />
          <Link
            href="/testing"
            className="group mt-14 grid overflow-hidden rounded-lg bg-panel md:mt-20 md:grid-cols-2"
          >
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[360px]">
              <Image
                src="/images/impact-test.webp"
                alt="A window under impact testing"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-between gap-10 p-6 md:p-10">
              <p className="statement text-[clamp(1.4rem,2.4vw,2rem)] text-char">
                Missile impact, wind, water and air. See what a system goes through before it is approved.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[14px] leading-[22px] text-char group-hover:text-blue">
                How we test <ArrowUpRight size={15} />
              </span>
            </div>
          </Link>
        </Container>
      </section>

      {/* /04 certificates on request */}
      <section className="bg-white px-2 pb-2 md:px-4 md:pb-4">
        <div className="rounded-lg bg-char px-5 py-20 text-white md:px-10 md:py-28">
          <div className="mx-auto max-w-[1360px]">
            <SwHead
              label="The certificates"
              n="04"
              layout="stacked"
              dark
              title={<span className="block max-w-[720px]">Certificates and test reports on request.</span>}
            />
            <div className="mt-8 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <p className="max-w-xl text-[16px] leading-6 text-white/70">
                Tell us the system and we&apos;ll send you the approvals and test reports your project needs.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="/contact" variant="light">Request the certificates <ArrowRight size={16} /></Button>
                <Button href="/products" variant="outlineLight">Browse the systems</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PinnedHero>
  );
}
