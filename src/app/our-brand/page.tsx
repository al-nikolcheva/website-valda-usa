import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { ParallaxImage } from "@/components/parallax-image";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { LineReveal } from "@/components/line-reveal";
import { FrostedStats } from "@/components/frosted-stats";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "VALDA is a family-owned European manufacturer of premium aluminium and PVC windows, doors and façade systems — founded in a Bulgarian garage in 1998, now three factories strong and certified for the US market.",
};

const STATS = [
  ["26+", "Years · since 1998"],
  ["3", "Factories"],
  ["300+", "Production specialists"],
  ["100%", "Family-owned"],
];

const VALUES = [
  { t: "Craftsmanship", b: "Every profile, every weld, every unit leaves to the same standard — because our name is on it." },
  { t: "Continuity", b: "Long relationships with clients, suppliers and people — many of our team have been here over twenty years." },
  { t: "Accountability", b: "Family-owned means personally accountable. The person you call has a stake in the outcome." },
  { t: "Integrity", b: "We don't oversell. We specify correctly, price transparently, and deliver what we commit to." },
  { t: "Sustainability", b: "Solar-powered factories, efficient machines, and products built for longevity — not replacement." },
];

const SUBPAGES = [
  { name: "Our History", href: "/our-brand/history", img: "/images/arch-4.jpg", desc: "From a Bulgarian garage in 1998 to three factories and the US market." },
  { name: "Credentials", href: "/our-brand/credentials", img: "/images/project-milwaukee-2.jpg", desc: "Florida Product Approvals, HVHZ, NAMI, NFRC, AAMA and ISO 9001." },
  { name: "How We Work", href: "/how-we-work", img: "/images/project-twins-1.jpg", desc: "One partner from the first drawing to the installed window." },
];

export default function OurBrandPage() {
  return (
    <PinnedHero
      eyebrow="About us"
      title="A family business that grew up."
      intro="VALDA is a family-owned European manufacturer of premium aluminium and PVC windows, doors and façade systems — founded in 1998 and still run by the family that built it."
      image="/images/arch-2.jpg"
    >
      {/* OUR STORY */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-7">
              <Reveal>
                <p className="caption text-slate"><span className="text-blue-bright">/</span> Our story</p>
                <p className="mt-6 statement text-[clamp(1.6rem,3vw,2.6rem)]">
                  <LineReveal text="It started with two founders making windows by hand in a small Bulgarian garage — and never took on an outside investor." />
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <Reveal delay={0.1}>
                <p className="text-[15px] leading-relaxed text-slate">
                  Over two and a half decades that workshop became a fully integrated manufacturer of aluminium and PVC systems — engineered to European standards, certified for the US market, and still 100% family-owned. The name on the building is the name on every unit.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* VELIKO TARNOVO — OUR ROOTS */}
      <section className="relative overflow-hidden py-28 md:py-44">
        <ParallaxImage src="/images/veliko-tarnovo.jpg" alt="Tsarevets fortress in Veliko Tarnovo, Bulgaria" brightness={0.5} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/15" />
        <Container className="relative z-10">
          <Reveal>
            <div className="max-w-2xl">
              <p className="caption text-white/70"><span className="text-blue-bright">/</span> Our roots</p>
              <h2 className="mt-4 max-w-3xl headline text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05] text-white">
                <LineReveal text="Two factories in Sofia. One beneath a nine-century fortress." />
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.85] text-white/85">
                That first workshop became three factories — two in Sofia and one in Veliko Tarnovo, Bulgaria&apos;s ancient first capital, crowned by the Tsarevets fortress that has stood for nine centuries. Still privately held, still run by the family that started it.
              </p>
              <div className="mt-9">
                <Button href="/our-brand/history" variant="light">Read our history <ArrowRight size={16} /></Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* THE FILM */}
      <section className="bg-ink py-24 text-white md:py-32">
        <Container>
          <Reveal><SectionHead label="Watch the film" title="See how we make it." light /></Reveal>
          <Reveal delay={0.05}>
            <div className="mt-12 overflow-hidden rounded-3xl shadow-2xl">
              <video
                src="/media/valda-film.mp4"
                poster="/images/valda-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="aspect-video h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* BY THE NUMBERS */}
      <FrostedStats
        image="/images/arch-2.jpg"
        label="By the numbers"
        title="Family-owned, and built to last."
        stats={STATS}
      />

      {/* WHAT WE STAND FOR */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <Reveal><SectionHead label="What we stand for" title="Five things we don't compromise on." /></Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={(i % 3) * 0.06}>
                <div className="border-t border-ink/15 pt-5">
                  <span className="caption text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 headline text-xl text-ink">{v.t}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-slate">{v.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* EXPLORE */}
      <section className="py-24">
        <Container>
          <Reveal><SectionHead label="Explore" title="Inside VALDA." /></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SUBPAGES.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <Link href={p.href} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                    <ArrowUpRight size={20} className="absolute right-5 top-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-4 headline text-xl tracking-[-0.01em]">{p.name}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate">{p.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-paper py-20">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl headline text-3xl tracking-[-0.01em] md:text-4xl">Build with a manufacturer, not a middleman.</h2>
          <Button href="/contact" variant="blue">Get in touch <ArrowRight size={16} /></Button>
        </Container>
      </section>
    </PinnedHero>
  );
}
