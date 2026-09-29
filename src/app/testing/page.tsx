import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { SwButton } from "@/components/sw/button";
import { HeroBand } from "@/components/pinned-hero";
import { TestStage } from "@/components/testing";
import { CertPath } from "@/components/testing/cert-path";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "How Hurricane Impact Windows Are Tested",
  description:
    "How impact windows are tested: laminated glass, large and small missile impacts, 9,000 pressure cycles, air, water and structural tests, and Florida approval.",
  path: "/testing",
  image: "/images/impact-test.webp",
});

const GLASS = [
  {
    name: "Annealed glass",
    body: "Ordinary float glass. It breaks into large, sharp pieces that fall out of the frame.",
  },
  {
    name: "Tempered glass",
    body: "Heat-treated and about four times stronger. It breaks into small granules, but once it breaks the opening is empty.",
  },
  {
    name: "Laminated glass",
    body: "Two lites bonded to a tough PVB or ionoplast (SentryGlas) interlayer. It can crack, but the pieces stay stuck to the interlayer and the opening stays closed.",
    accent: true,
  },
];

const MISSILE_FACTS = [
  { k: "Large missile", v: "A 9 lb timber 2x4 at 50 ft/s, about 34 mph" },
  { k: "Where it hits", v: "Near the centre of the glass and near a corner" },
  { k: "Small missile", v: "2 g steel balls at 130 ft/s, for glazing more than 30 ft above ground" },
  { k: "To pass", v: "No penetration. Then straight on to the pressure cycles" },
];

const PERF = [
  {
    name: "Air",
    std: "ASTM E283",
    body: "Measures how much air leaks through the joints at 1.57 psf, roughly a 25 mph wind.",
  },
  {
    name: "Water",
    std: "ASTM E547 / E331",
    body: "Water is sprayed on the outside at 5 US gallons per square foot per hour while the chamber pulls air. The rating is the highest pressure with no water getting in.",
  },
  {
    name: "Structural",
    std: "ASTM E330",
    body: "Loaded in both directions to the design pressure, then to 150% of it. Nothing may break, and only a small permanent bend is allowed.",
  },
  {
    name: "The rating",
    std: "NAFS",
    body: "The results add up to a class and grade, such as CW-PG65: a commercial window rated for ±65 psf. That is the rating on VALDA's own impact windows.",
    accent: true,
  },
];

const OTHER = [
  { k: "Forced entry", v: "AAMA 1302.5 / ASTM F588, where required" },
  { k: "Energy", v: "NFRC ratings for U-factor and solar heat gain (SHGC)" },
  { k: "Europe", v: "CE marking to EN 14351-1, with its own air, water and wind classes" },
];

const STANDARDS = [
  { test: "Missile impact", usa: "ASTM E1886 / E1996", hvhz: "TAS 201" },
  { test: "Cyclic pressure", usa: "ASTM E1886 / E1996", hvhz: "TAS 203" },
  { test: "Air leakage", usa: "ASTM E283 (NAFS)", hvhz: "TAS 202" },
  { test: "Water penetration", usa: "ASTM E547 / E331 (NAFS)", hvhz: "TAS 202" },
  { test: "Structural load", usa: "ASTM E330 (NAFS)", hvhz: "TAS 202" },
  { test: "Forced entry", usa: "AAMA 1302.5 / ASTM F588", hvhz: "TAS 202" },
];

function Facts({ items }: { items: { k: string; v: string }[] }) {
  return (
    <dl className="border-t border-char/10">
      {items.map((f) => (
        <div key={f.k} className="grid gap-1 border-b border-char/10 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
          <dt className="text-[14px] leading-[22px] text-mute">{f.k}</dt>
          <dd className="text-[16px] leading-6 text-char">{f.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function TestingPage() {
  return (
    <>
      <HeroBand
        eyebrow="How we test"
        title="Built to take a hurricane."
        intro="Before an impact window can carry a Florida Product Approval, it is hit with a timber missile, pushed and pulled 9,000 times, soaked and overloaded at an independent lab. Here is how that works."
        image="/images/impact-test.webp"
        imagePosition="center 45%"
      />

      {/* ── /01 IMPACT VS ORDINARY GLASS ─────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Impact glass" n="01" layout="stacked" title="The glass stays in the frame." />
          <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <p className="text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.35] text-char">
                In a hurricane, one broken window can be enough. Once the opening is breached, wind gets inside and pushes on the roof and walls from within. Impact glass is made so the opening stays closed, even when the glass breaks.
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-12 md:mt-16">
            <TestStage kind="compare" />
          </Reveal>

          <div className="mt-12 grid gap-3 md:grid-cols-3 md:gap-4">
            {GLASS.map((g, i) => (
              <Reveal key={g.name} delay={0.06 * i}>
                <div className={cn("h-full rounded-lg p-6 md:p-7", g.accent ? "bg-char text-white" : "bg-panel")}>
                  <h3 className={cn("sw-h text-[clamp(1.4rem,2vw,1.75rem)]", g.accent ? "text-white" : "text-char")}>{g.name}</h3>
                  <p className={cn("mt-3 text-[15px] leading-6", g.accent ? "text-white/75" : "text-slate")}>{g.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 max-w-[720px] text-[15px] leading-6 text-slate">
            Impact units are often insulated glass with one laminated lite, usually the inner one. The interlayer is thicker than in everyday safety glass: around 0.090 in (2.3 mm) is common for large-missile glass. Our impact systems are glazed in the same build-up that passed the test.
          </p>
        </Container>
      </section>

      {/* ── /02 MISSILE IMPACT ─────────────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="Missile impact" n="02" layout="stacked" title="A 2x4 at 34 mph." />
          <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="text-[17px] font-medium leading-7 text-char">
                The hurricane test follows ASTM E1886 and E1996, and TAS 201 in Miami-Dade and Broward, the High Velocity Hurricane Zone (HVHZ).
              </p>
              <p className="mt-4 text-[16px] leading-6 text-slate">
                The window is built exactly as it will be sold, anchored into a test buck, and an air cannon fires a timber 2x4 at the glass. Three identical specimens are tested. Every impact system we supply carries a Florida Product Approval built on this test.
              </p>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
              <Facts items={MISSILE_FACTS} />
            </Reveal>
          </div>
          <Reveal className="mt-12 md:mt-16">
            <TestStage kind="missile" className="bg-white" />
          </Reveal>
        </Container>
      </section>

      {/* ── /03 CYCLIC PRESSURE ────────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Cyclic pressure" n="03" layout="stacked" title="Then 9,000 gusts." />
          <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="text-[17px] font-medium leading-7 text-char">
                A hurricane does not push once. It gusts for hours. So the same cracked specimen goes onto a pressure chamber and is cycled 9,000 times.
              </p>
            </Reveal>
            <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.08}>
              <p className="text-[16px] leading-6 text-slate">
                First 4,500 cycles push inward, building up to the full test pressure. Then the pressure reverses for 4,500 cycles of suction, starting at full pressure and easing off. The window passes only if the glass stays in the frame, with no tear longer than 5 in and no opening a 3 in ball could pass through. In the HVHZ this is TAS 203.
              </p>
            </Reveal>
          </div>
          <Reveal className="mt-12 md:mt-16">
            <TestStage kind="cyclic" />
          </Reveal>
        </Container>
      </section>

      {/* ── /04 PERFORMANCE TESTS ──────────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="Performance" n="04" layout="stacked" title="Air, water and wind load." />
          <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-6">
              <p className="text-[17px] font-medium leading-7 text-char">
                Impact or not, a window for the US market is rated to the North American Fenestration Standard, AAMA/WDMA/CSA 101/I.S.2/A440 (NAFS). These tests tell you how it behaves on an ordinary windy, rainy day.
              </p>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
              <p className="text-[16px] leading-6 text-slate">
                The window is sealed onto a chamber, and the chamber changes the air pressure behind it. In the HVHZ, TAS 202 covers the same ground.
              </p>
            </Reveal>
          </div>
          <Reveal className="mt-12 md:mt-16">
            <TestStage kind="performance" className="bg-white" />
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {PERF.map((p, i) => (
              <Reveal key={p.name} delay={0.06 * i}>
                <div className={cn("h-full rounded-lg p-6", p.accent ? "bg-char" : "bg-white")}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className={cn("sw-h text-[1.5rem]", p.accent ? "text-white" : "text-char")}>{p.name}</h3>
                    <span className={cn("text-[12px] leading-5", p.accent ? "text-white/55" : "text-mute")}>{p.std}</span>
                  </div>
                  <p className={cn("mt-3 text-[15px] leading-6", p.accent ? "text-white/75" : "text-slate")}>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-12">
            <p className="text-[14px] leading-[22px] text-mute lg:col-span-3">Also tested where it applies</p>
            <div className="lg:col-span-9">
              <Facts items={OTHER} />
            </div>
          </div>
        </Container>
      </section>

      {/* ── /05 STANDARDS AT A GLANCE ─────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Standards" n="05" title="Which standard covers what" />
          <Reveal className="mt-14 md:mt-20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-t border-char/10 text-left">
                <thead>
                  <tr className="border-b border-char/10 text-[14px] leading-[22px] text-mute">
                    <th className="py-4 pr-4 font-normal">Test</th>
                    <th className="py-4 pr-4 font-normal">USA</th>
                    <th className="py-4 font-normal">HVHZ (Miami-Dade, Broward)</th>
                  </tr>
                </thead>
                <tbody>
                  {STANDARDS.map((s) => (
                    <tr key={s.test} className="border-b border-char/10 text-[16px] leading-6">
                      <td className="py-4 pr-4 text-char">{s.test}</td>
                      <td className="py-4 pr-4 text-slate">{s.usa}</td>
                      <td className="py-4 text-slate">{s.hvhz}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── /06 HOW CERTIFICATION WORKS ───────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="Certification" n="06" layout="stacked" title="From test rig to your wall." />
          <p className="mt-8 max-w-[640px] text-[16px] leading-6 text-slate">
            Passing the tests is only the start. This is how a result becomes an approval you can build with.
          </p>
          <div className="mt-14 md:mt-20">
            <CertPath />
          </div>
        </Container>
      </section>

      {/* ── /07 DOCUMENTS + CTA ──────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <div className="rounded-lg bg-char p-8 md:p-14">
            <p className="text-[14px] leading-[22px] text-white/55">/07</p>
            <h2 className="sw-h mt-6 max-w-[720px] text-[clamp(2rem,4vw,3.25rem)] text-white">Certificates and test reports on request.</h2>
            <p className="mt-5 max-w-[560px] text-[16px] leading-6 text-white/70">
              Tell us about your project and we will send the approvals, test reports and installation drawings for the systems you are looking at.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <SwButton href="/contact" variant="white" className="self-start">
                Request documents <ArrowRight size={15} />
              </SwButton>
              <Link
                href="/certifications"
                className="inline-flex items-center gap-1.5 text-[14px] leading-[22px] text-white underline-offset-4 hover:underline"
              >
                See certifications <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
