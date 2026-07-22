import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { LineReveal } from "@/components/line-reveal";
import { FrostedStats } from "@/components/frosted-stats";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our History",
  description:
    "From a Bulgarian workshop in 1998 to a transatlantic manufacturer of premium windows, doors and facade systems — the VALDA story.",
};

const MILESTONES = [
  {
    year: "1998",
    title: "Two founders, one garage",
    body: "VALDA is founded in Bulgaria by two founders — one family — making windows by hand in a small garage. From day one the principle is personal accountability: our name is on every unit.",
  },
  {
    year: "2004",
    title: "The first factory",
    body: "The garage workshop outgrows itself. VALDA opens its first proper factory, moving from hand-built windows to a repeatable, engineered production line.",
  },
  {
    year: "2008",
    title: "Veliko Tarnovo",
    body: "A factory opens in Veliko Tarnovo, Bulgaria's ancient first capital, beneath the nine-century Tsarevets fortress — adding capacity across both PVC and aluminium.",
  },
  {
    year: "2012",
    title: "Three factories",
    body: "Three sites now run in parallel — two in Sofia and one in Veliko Tarnovo — a fully vertically integrated operation, still 100% family-owned with no outside investors.",
  },
  {
    year: "2016",
    title: "Into the United States",
    body: "VALDA enters the US market, adapting its European systems to American structural, thermal and code requirements.",
  },
  {
    year: "2018",
    title: "Milwaukee",
    body: "Early US project work lands, including Milwaukee — proving the systems on North American buildings, not just on paper.",
  },
  {
    year: "2020",
    title: "HVHZ certified",
    body: "VALDA systems are tested and approved for the High-Velocity Hurricane Zone — the most demanding fenestration standard in the country.",
  },
  {
    year: "2024",
    title: "Expanded Florida approvals",
    body: "The Florida Building Code approval portfolio expands across more systems and configurations, opening more of the US market to factory-direct VALDA supply.",
  },
];

const STATS = [
  ["26+", "Years · since 1998"],
  ["3", "Factories"],
  ["300+", "Production specialists"],
  ["100%", "Family-owned"],
];

export default function HistoryPage() {
  return (
    <PinnedHero
      eyebrow="About us — Our history"
      title="From a Bulgarian workshop to a transatlantic manufacturer."
      intro="Twenty-six years of building windows, doors and facade systems — and keeping the whole chain in-house."
      image="/images/arch-4.jpg"
    >
      {/* OPENING STATEMENT */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-7">
              <Reveal>
                <p className="caption text-slate"><span className="text-blue-bright">/</span> The story</p>
                <p className="mt-6 statement text-[clamp(1.6rem,3vw,2.6rem)]">
                  <LineReveal text="We started with a single workshop and one conviction — that the best window is the one whose every stage you own." />
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <Reveal delay={0.1}>
                <p className="text-[15px] leading-relaxed text-slate">
                  Twenty-six years later that conviction is a fully integrated European operation — three factories, hundreds of specialists, and systems certified for the most demanding market in the world.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* TIMELINE */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionHead label="Milestones" title="How we got here." />
          </Reveal>

          <div className="relative mt-16 md:mt-20">
            <span className="absolute left-2 top-1 h-[calc(100%-0.5rem)] w-px bg-ink/12" aria-hidden />
            <ol className="space-y-14 md:space-y-20">
              {MILESTONES.map((m, i) => (
                <Reveal key={m.title} delay={(i % 2) * 0.05}>
                  <li className="relative pl-12 md:pl-16">
                    <span className="absolute left-2 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-blue ring-4 ring-blue/15" aria-hidden />
                    <div className="font-mono text-[13px] uppercase tracking-[0.14em] text-blue">{m.year}</div>
                    <h3 className="mt-2 headline text-2xl text-ink md:text-3xl">{m.title}</h3>
                    <p className="mt-3 max-w-2xl text-[15px] leading-[1.85] text-slate">{m.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <FrostedStats
        image="/images/arch-2.jpg"
        label="By the numbers"
        title="Twenty-six years, measured."
        stats={STATS}
      />

      {/* CTA */}
      <section className="py-20 md:py-24">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl headline text-3xl tracking-[-0.01em] md:text-4xl">
            The same people who make it, stand behind it.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button href="/our-brand/credentials" variant="outline">View credentials</Button>
            <Button href="/contact" variant="blue">Get in touch <ArrowRight size={16} /></Button>
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
