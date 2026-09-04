import type { Metadata } from "next";
import { ArrowRight, DoorClosed, Droplets, Gauge, ShieldCheck, Wind } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Every VALDA system is certified for the US market — Florida Product Approved, cleared for the High-Velocity Hurricane Zone, and independently tested for impact, wind, water and air.",
};

// Trust marks shown as a simple strip.
const LOGOS = [
  { name: "Florida Product Approved", img: "/images/cert/cert-florida.png" },
  { name: "HVHZ", img: "/images/cert/cert-hvhz.png" },
  { name: "NAMI", img: "/images/cert/cert-nami.png" },
  { name: "AAMA / WDMA / CSA", img: "/images/cert/cert-aama.png" },
  { name: "ISO 9001", img: "/images/cert/cert-iso.png" },
];

// What we're certified for — plain, reassuring, no numbers.
const CERTIFIED = [
  { name: "Florida Product Approval", img: "/images/cert/cert-florida.png", line: "Approved statewide under the Florida Building Code — the most demanding in the country." },
  { name: "High-Velocity Hurricane Zone", img: "/images/cert/cert-hvhz.png", line: "Cleared for the toughest zone in the US: Miami-Dade and Broward." },
  { name: "NAMI certified", img: "/images/cert/cert-nami.png", line: "Independently certified, with our factories inspected and audited." },
  { name: "AAMA / WDMA / CSA", img: "/images/cert/cert-aama.png", line: "Meets the North American performance standard for windows and doors." },
];

// What we test for — the tests, in plain language.
const TESTS = [
  { icon: ShieldCheck, name: "Hurricane impact", line: "Withstands large- and small-missile impact." },
  { icon: Gauge, name: "Wind & structural", line: "Holds up to high design pressures." },
  { icon: Droplets, name: "Water tightness", line: "No water penetration in driving rain." },
  { icon: Wind, name: "Air infiltration", line: "Sealed against draughts and air leakage." },
  { icon: DoorClosed, name: "Forced entry", line: "Resists attempted break-ins." },
];

export default function CertificationsPage() {
  return (
    <PinnedHero
      eyebrow="Certifications"
      title="Approved for the United States."
      intro="Every VALDA system is certified for the US market, and tested to the strictest standards in the country."
      image="/images/project-milwaukee-2.jpg"
    >
      {/* ── TRUST STRIP ──────────────────────────────────── */}
      <section className="bg-pure pt-20 md:pt-28">
        <Container>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-8 border-y border-mist py-10">
            {LOGOS.map(({ name, img }) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={name} src={img} alt={name} title={name} className="h-11 w-auto object-contain opacity-80 transition-opacity hover:opacity-100 md:h-12" />
            ))}
          </div>
        </Container>
      </section>

      {/* ── WHAT WE'RE CERTIFIED FOR ─────────────────────── */}
      <section className="bg-pure py-20 md:py-28">
        <Container>
          <Band n="01" label="Certified" title="What we're certified for." sub="Every system carries the approvals a US project needs, at every level." />
          <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {CERTIFIED.map((c) => (
              <div key={c.name} className="flex items-start gap-5 border-t border-mist pt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt="" className="h-14 w-14 shrink-0 object-contain" />
                <div>
                  <h3 className="headline text-[20px] tracking-[-0.01em] text-ink">{c.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{c.line}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── WHAT WE TEST FOR ─────────────────────────────── */}
      <section className="bg-paper py-20 md:py-28">
        <Container>
          <Band n="02" label="Tested" title="What every system is tested for." sub="Independently tested and certified across the performance that matters for the US climate." />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTS.map((t) => (
              <div key={t.name} className="flex flex-col gap-3 rounded-2xl border border-mist bg-pure p-7">
                <t.icon size={22} strokeWidth={1.6} className="text-blue" />
                <h3 className="mt-1 headline text-[18px] tracking-[-0.01em] text-ink">{t.name}</h3>
                <p className="text-[14px] leading-relaxed text-slate">{t.line}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── REQUEST THE DOCUMENTS ────────────────────────── */}
      <section className="bg-ink py-20 text-white md:py-28">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">The certificates</p>
              <h2 className="mt-6 max-w-2xl headline text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-[-0.01em]">Need the certificates for your project?</h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">Tell us the system and we'll send you the approvals and test reports you need — no forms, no digging.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/contact" variant="light">Request the certificates <ArrowRight size={16} /></Button>
              <Button href="/products" variant="outlineLight">Browse the systems</Button>
            </div>
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
