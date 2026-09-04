import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { HeritageTimeline } from "@/components/heritage-timeline";
import { ProcessShowcase } from "@/components/process-showcase";
import { Container, Reveal } from "@/components/primitives";
import { LineReveal } from "@/components/line-reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "VALDA is a family-owned European manufacturer of premium aluminium and PVC windows, doors and façade systems, founded in a Bulgarian garage in 1998, now two factories strong and certified for the US market.",
};

const MILESTONES = [
  { year: "1998", title: "Two founders, one machine", body: "VALDA begins in a small Bulgarian garage with two founders, a single machine, and every window made by hand.", img: "/images/tarnovo.png", pos: "center 25%" },
  { year: "2004", title: "The first factory", body: "The garage becomes a real factory, with a repeatable production line and VALDA's first proper team.", img: "/images/manufacturing.png" },
  { year: "2012", title: "Everything in-house", body: "Two factories run in parallel, backed by a smaller third. Profiles, our own glass and aluminium coating are all made under one roof in Sofia and Veliko Tarnovo.", img: "/images/hero-gora.jpg" },
  { year: "2016", title: "Into the United States", body: "VALDA enters the US market, adapting its European systems to American structural, thermal and code requirements.", img: "/images/project-milwaukee-1.jpg" },
  { year: "2020", title: "Hurricane certified", body: "VALDA systems are tested and approved for the High-Velocity Hurricane Zone, the most demanding standard in the US.", img: "/images/arch-5.jpg" },
  { year: "2026", title: "Growing across the US", body: "Expanding Florida approvals and US project work, shipping more systems factory-direct across the country.", img: "/images/project-milwaukee-2.jpg" },
];

const STATS: [string, string][] = [
  ["26+", "Years, since 1998"],
  ["2", "Factories in Bulgaria"],
  ["300+", "Production specialists"],
  ["100%", "Family-owned"],
];

const USPS = [
  { t: "Everything in-house", b: "Profiles, our own glass (cutting to impact-rated) and aluminium coating: every stage made under our own roof." },
  { t: "Family-owned since 1998", b: "Privately held, never investor-run, run by the same family. Many of our team have been here over twenty years." },
  { t: "European-made, US-certified", b: "Engineered to European standards and approved for the US market, HVHZ included, with engineering support on American ground." },
  { t: "We handle the shipping", b: "Flexible on colour, hardware and glass, and fast because we make it. We pack, document and deliver factory-direct to your site." },
];

const CERTS = [
  { name: "Florida Product Approved", img: "/images/cert/cert-florida.png" },
  { name: "NAMI", img: "/images/cert/cert-nami.png" },
  { name: "AAMA / WDMA / CSA", img: "/images/cert/cert-aama.png" },
  { name: "ISO 9001", img: "/images/cert/cert-iso.png" },
];

export default function AboutPage() {
  return (
    <PinnedHero
      eyebrow="About us"
      title="A family business that grew up."
      intro="A family-owned European manufacturer of aluminium and PVC windows, doors and façade systems, founded in 1998 and still run by the family that built it."
      image="/images/valda-facility.png"
    >
      {/* ABOUT — the story */}
      <section className="bg-white py-24 md:py-36">
        <Container>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Our story</p>
            <p className="mt-8 max-w-4xl statement text-[clamp(1.7rem,3.4vw,3rem)] leading-[1.18] text-ink">
              <LineReveal text="In 1998, two founders started VALDA in a small Bulgarian garage with one machine, and every window made by hand." />
            </p>
          </Reveal>
          <div className="mt-14 grid gap-x-16 gap-y-8 md:mt-16 md:grid-cols-2">
            <Reveal>
              <p className="text-[16px] leading-[1.9] text-slate">
                That garage became an office, then a showroom, then a factory, and today, two factories with a smaller third supporting them. Everything is still made in-house: aluminium and PVC windows, doors and façades, our own glass from laminated to impact-rated, and our own aluminium coating line, all under one roof in Sofia and Veliko Tarnovo.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[16px] leading-[1.9] text-slate">
                What hasn&apos;t changed is how we work. VALDA is still family-owned, still run by the family that started it, and much of our team has been here more than twenty years. We make every window as if our name is on it, because it is, and we stay close to every client, from the first drawing to the final delivery.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* WHY VALDA — USPs */}
      <section className="bg-paper py-20 md:py-28">
        <Container>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Why VALDA</p>
            <h2 className="mt-6 max-w-2xl headline text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.1] text-ink">
              Why architects and contractors choose us.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {USPS.map((u, i) => (
              <Reveal key={u.t} delay={(i % 4) * 0.06}>
                <div className="border-t border-ink/15 pt-5">
                  <span className="font-mono text-[12px] text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 headline text-xl text-ink">{u.t}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-slate">{u.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* HERITAGE — scroll-driven timeline over the Tsarevets fortress */}
      <HeritageTimeline milestones={MILESTONES} />

      {/* TODAY — short closing + compact figures */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:items-end md:gap-10">
            <div className="md:col-span-7">
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Today</p>
                <h2 className="mt-6 max-w-xl headline text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.08] text-ink">
                  Made in-house, shipped worldwide.
                </h2>
                <p className="mt-7 max-w-xl text-[16px] leading-[1.85] text-slate">
                  Every profile, pane and coating is made in Sofia and Veliko Tarnovo, on European machinery from LISEC, FOREL, EMMEGI, ROTOX and SCHIRMER. We pack, document and ship factory-direct to your site ourselves, so the unit that arrives is the one we&apos;re accountable for. Most of what we make leaves Bulgaria for Europe and the United States.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="md:col-span-4 md:col-start-9">
              <div className="grid grid-cols-2 gap-x-8 gap-y-9 border-t border-ink/10 pt-9">
                {STATS.map(([v, l]) => (
                  <div key={l}>
                    <div className="headline text-3xl text-ink md:text-4xl">{v}</div>
                    <div className="mt-1.5 text-[13px] leading-snug text-slate">{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* HOW WE WORK — moved from the homepage */}
      <ProcessShowcase />

      {/* TRUST — certified & accredited for the US */}
      <section className="bg-paper py-20 md:py-28">
        <Container>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Certified &amp; accredited</p>
            <h2 className="mt-6 max-w-2xl headline text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.1] text-ink">
              Approved for the United States.
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-[1.8] text-slate">
              Statewide Florida Product Approvals, clearing the HVHZ where carried, plus NAMI and the AAMA, WDMA, CSA and ASTM test battery.
            </p>
          </Reveal>
          <div className="mt-14 grid grid-cols-3 items-center gap-x-10 gap-y-10 border-t border-ink/10 pt-12 sm:grid-cols-4 lg:grid-cols-7">
            {CERTS.map(({ name, img }) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={name} src={img} alt={name} className="h-12 w-auto object-contain md:h-14" />
            ))}
          </div>
        </Container>
      </section>

      {/* FILM — full-bleed, cinematic (Simpas-style) */}
      <section className="relative overflow-hidden bg-ink">
        <video
          src="/media/valda-film.mp4"
          poster="/images/valda-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-[72vh] min-h-[440px] w-full object-cover md:h-[88vh]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/15" />
        <Container className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-10 md:pb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/65">The film</p>
          <h2 className="mt-3 headline text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] text-white">See how we make it.</h2>
        </Container>
      </section>

    </PinnedHero>
  );
}
