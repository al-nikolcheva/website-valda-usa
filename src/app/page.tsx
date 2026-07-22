import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { HomeHero } from "@/components/home-hero";
import { ParallaxImage } from "@/components/parallax-image";
import { ProjectsScroll } from "@/components/projects-scroll";
import { ProcessAccordion } from "@/components/process-accordion";
import { Marquee } from "@/components/marquee";
import { LineReveal } from "@/components/line-reveal";
import { VideoSection } from "@/components/video-section";

const PRODUCTS = [
  { name: "Windows", href: "/products/windows", img: "/images/arch-1.jpg", desc: "Tilt & turn, fixed and casement in aluminium and PVC." },
  { name: "Doors", href: "/products/doors", img: "/images/arch-3.jpg", desc: "Entrance, terrace and patio doors with slim sightlines." },
  { name: "Sliding & Folding", href: "/products/sliding", img: "/images/arch-5.jpg", desc: "Lift & slide and minimal-frame systems." },
  { name: "Facade Systems", href: "/products/facades", img: "/images/hero.jpg", desc: "Curtain wall and window wall for larger envelopes." },
];

const CERTS = [
  { name: "NAMI", img: "/images/cert/cert-nami.png" },
  { name: "NFRC", img: "/images/cert/cert-nfrc.png" },
  { name: "Florida Product Approved", img: "/images/cert/cert-florida.png" },
  { name: "AAMA", img: "/images/cert/cert-aama.png" },
  { name: "HVHZ — Miami-Dade NOA", img: "/images/cert/cert-hvhz.png" },
  { name: "Energy Star", img: "/images/cert/cert-energystar.png" },
  { name: "ISO 9001", img: "/images/cert/cert-iso.png" },
];

export default function Home() {
  return (
    <>
      <HomeHero />

      {/* spacer reveals the pinned hero; content below scrolls up over it */}
      <div className="h-[100svh]" aria-hidden />

      <div className="relative z-10">
      {/* WHAT WE PRODUCE */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead index="01" label="What we produce" title="Windows, doors, sliding &amp; facade systems." />
            <Link href="/products" className="group inline-flex items-center gap-2 text-[13px] font-medium text-blue">
              All products <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
        <div className="mt-14 grid grid-cols-2 gap-4 px-6 md:grid-cols-4 md:gap-5 md:px-10">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.name} delay={(i % 4) * 0.08}>
              <Link href={p.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
                  <ArrowUpRight size={20} className="absolute right-5 top-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <h3 className="headline text-xl text-white md:text-2xl">{p.name}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">{p.desc}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHO WE ARE — cinematic */}
      <section className="relative overflow-hidden py-28 md:py-44">
        <ParallaxImage src="/images/arch-2.jpg" alt="" brightness={0.42} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/20" />
        <Container className="relative z-10">
          <Reveal>
            <div className="max-w-2xl">
              <p className="caption text-white/70"><span className="text-blue-bright">/</span> 02 — Who we are</p>
              <h2 className="mt-4 max-w-3xl headline text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05] text-white">
                <LineReveal text="A European manufacturer, built for the USA." />
              </h2>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.85] text-white/80">
                VALDA is a European manufacturer with three factories in Bulgaria, producing premium PVC and aluminium windows, doors and facade systems since 1998 — fully accredited and engineered for the US market.
              </p>
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-7">
                {[["1998", "Since"], ["3", "Factories · Bulgaria"], ["Full", "US accreditation"]].map(([n, l]) => (
                  <div key={l}><div className="headline text-3xl text-white md:text-4xl">{n}</div><div className="mt-1.5 text-[13px] text-white/60">{l}</div></div>
                ))}
              </div>
              <div className="mt-9"><Button href="/our-brand" variant="light">About us <ArrowRight size={16} /></Button></div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* CERTIFICATIONS */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <SectionHead index="03" label="Fully accredited" title="Certified &amp; approved for the USA." />
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate">
            Every VALDA system is tested and Florida Product Approved for the US market — our Vista and Vision systems in VALDA&apos;s own name, our Reynaers and Kömmerling platforms under their manufacturers&apos; approvals.
          </p>
        </Container>
        <div className="mt-14 [--marquee-fade:var(--color-paper)]">
          <Marquee durationSec={40}>
            {CERTS.map(({ name, img }) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={name} src={img} alt={name} className="mr-16 h-16 w-auto shrink-0 object-contain md:mr-24 md:h-20" />
            ))}
          </Marquee>
        </div>
        <Container className="mt-12 text-center">
          <Button href="/our-brand/credentials" variant="outline">View certifications <ArrowRight size={16} /></Button>
        </Container>
      </section>

      {/* BRAND FILM */}
      <VideoSection />

      {/* HOW WE WORK */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHead index="04" label="How we work" title="A measured process, end to end." />
          <div className="mt-14"><ProcessAccordion /></div>
        </Container>
      </section>

      {/* SELECTED WORK */}
      <ProjectsScroll />

      {/* GET A QUOTE */}
      <section className="relative flex min-h-[72vh] items-center overflow-hidden">
        <ParallaxImage src="/images/project-mona-2.jpg" alt="" brightness={0.4} />
        <div className="absolute inset-0 bg-ink/55" />
        <Container className="relative z-10 text-center">
          <Reveal>
            <p className="caption text-white/70"><span className="text-blue-bright">/</span> 06 — Start a project</p>
            <h2 className="mx-auto mt-6 max-w-3xl headline text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[1.04] text-white">Let&apos;s build something that lasts.</h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/75">Send your wind zone, opening schedule and performance targets. We respond within one business day.</p>
            <div className="mt-9 flex justify-center"><Button href="/contact" variant="light">Get a quote <ArrowRight size={16} /></Button></div>
          </Reveal>
        </Container>
      </section>
      </div>
    </>
  );
}
