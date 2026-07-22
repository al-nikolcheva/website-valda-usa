import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Production",
  description: "Three factories in Bulgaria and full control from raw profile to the installed window. CNC, welding, glazing and QC under one roof.",
};

const CAPABILITIES = [
  { t: "CNC fabrication", b: "Profiles cut, machined and prepped to tolerance on CNC lines." },
  { t: "Welding & assembly", b: "Frames welded, cleaned and assembled by trained specialists." },
  { t: "Glazing line", b: "IGU assembly and SentryGlas lamination for impact glazing." },
  { t: "Quality control", b: "Every HVHZ unit checked and signed off before it ships." },
];

const PARTNERS = [
  ["Reynaers", "Aluminium systems"],
  ["Kömmerling", "PVC profile systems"],
  ["Etem", "Aluminium profiles"],
  ["Deceuninck", "PVC profiles"],
  ["SentryGlas", "Impact glazing"],
];

export default function ProductionPage() {
  return (
    <PinnedHero
      eyebrow="Production"
      title="Designed for production. Engineered for precision."
      intro="Full control from raw profile to the installed window, across three factories in Bulgaria and the systems we build on."
      image="/images/arch-2.jpg"
    >
      {/* intro */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:gap-10">
            <SectionHead className="md:col-span-7" label="Our facilities" title="Three factories. One European standard." />
            <Reveal className="md:col-span-5 md:self-end" delay={0.1}>
              <p className="text-[16px] leading-[1.8] text-slate">
                Since 1998 VALDA has manufactured aluminium and PVC systems across three factories in Bulgaria and shipped factory direct to the USA. Fabrication, glazing and quality control happen under one roof, which is how we hold our lead times — with Florida Product Approvals in VALDA&apos;s own name for our proprietary Vista and Vision systems.
              </p>
            </Reveal>
          </div>
        </Container>
        <Reveal delay={0.05}>
          <div className="relative mt-16 h-[60vh] min-h-[360px] w-full overflow-hidden">
            <Image src="/images/arch-2.jpg" alt="VALDA production" fill className="object-cover" sizes="100vw" />
          </div>
        </Reveal>
      </section>

      {/* capabilities */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <SectionHead label="Capabilities" title="From raw profile to finished unit." />
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.t} delay={(i % 4) * 0.06}>
                <div className="border-t border-ink/15 pt-5">
                  <span className="caption text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 headline text-xl text-ink">{c.t}</h3>
                  <p className="mt-3 text-[14px] leading-[1.75] text-slate">{c.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* partners */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHead label="Systems &amp; partners" title="The systems and machinery we build on." />
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate">
            We fabricate our own proprietary systems and partner profile systems on European machinery, giving architects recognised platforms with VALDA engineering and US certification.
          </p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-mist bg-mist sm:grid-cols-2 lg:grid-cols-5">
            {PARTNERS.map(([name, kind]) => (
              <div key={name} className="bg-white p-7">
                <h3 className="headline text-xl text-ink">{name}</h3>
                <p className="mt-2 text-[13px] text-slate">{kind}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* cta */}
      <section className="bg-blue py-20 text-white">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl headline text-3xl md:text-4xl">Build with a manufacturer, not a middleman.</h2>
          <Button href="/contact" variant="light">Get a quote <ArrowRight size={16} /></Button>
        </Container>
      </section>
    </PinnedHero>
  );
}
