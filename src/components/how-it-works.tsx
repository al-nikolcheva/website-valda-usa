import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/section-head";

const STEPS = [
  {
    n: "01",
    t: "You send your project",
    d: "Drawings, opening schedule and performance targets. At any stage, from an early concept to an issued-for-tender package.",
  },
  {
    n: "02",
    t: "We engineer and quote",
    d: "We match the right aluminum or PVC systems to your wind zone and budget, then send a clear estimate in USD.",
  },
  {
    n: "03",
    t: "We manufacture",
    d: "Made on our own lines in Europe, in-house from the raw profile to the finished glazed unit, by people we employ.",
  },
  {
    n: "04",
    t: "Tested and certified",
    d: "Every unit is tested and approved for your market, from Florida Product Approvals and HVHZ to NAMI and the full ASTM battery.",
  },
  {
    n: "05",
    t: "We ship to your site",
    d: "Export-grade packaging, ocean freight, US customs and final delivery, handled end to end all the way to your jobsite.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-paper py-24 md:py-36">
      <Container>
        <SectionHead
          n="04"
          label="Process"
          title="From your drawing to your site."
          intro="One team stays accountable, factory direct, from the first quote to the day it arrives on your US site. No importer, no middleman."
        />
        <ol className="mt-16 divide-y divide-ink/10 border-t border-ink/10">
          {STEPS.map((s) => (
            <li key={s.n} className="grid gap-4 py-9 md:grid-cols-[180px_1fr] md:gap-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue">Step /{s.n}</p>
              <div className="max-w-2xl">
                <h3 className="headline text-[22px] leading-tight text-ink md:text-[26px]">{s.t}</h3>
                <p className="mt-3 text-[15px] leading-[1.75] text-slate">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
