import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Phone, Mail, Check } from "lucide-react";
import { Container, Reveal } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { HomeHero } from "@/components/home-hero";
import { ImmersiveBand } from "@/components/immersive-band";
import { ProjectsScroll } from "@/components/projects-scroll";
import { CountUp } from "@/components/count-up";
import { FaqAccordion } from "@/components/faq";
import { FAQS } from "@/lib/faqs";

const PRODUCTS = [
  { name: "Windows", href: "/products/windows", img: "/images/product-windows.png", desc: "Tilt & turn, fixed and casement in aluminium and PVC." },
  { name: "Doors", href: "/products/doors", img: "/images/door-slatted.png", desc: "Entrance, terrace and patio doors with slim sightlines." },
  { name: "Sliding & Folding", href: "/products/sliding", img: "/images/sliding-deck.png", desc: "Lift & slide and minimal-frame systems." },
  { name: "Facade Systems", href: "/products/facades", img: "/images/facade-stone.png", desc: "Curtain wall and window wall for larger envelopes." },
];

const WHO_STATS = [
  { value: 26, suffix: "+", label: "Years" },
  { value: 300, suffix: "+", label: "Specialists" },
  { value: 2, suffix: "", label: "Factories" },
];

const CONSULT_POINTS = [
  "A system recommendation for your wind zone and budget",
  "US certification guidance: Florida approvals, HVHZ and NFRC",
  "Freight, customs and delivery, walked through end to end",
  "A clear estimate in USD to follow",
];

const FAQ_CERTS = [
  { name: "Florida Product Approved", img: "/images/cert/cert-florida.png" },
  { name: "NAMI", img: "/images/cert/cert-nami.png" },
  { name: "AAMA / WDMA / CSA", img: "/images/cert/cert-aama.png" },
];

const CERTS = [
  { name: "Florida Product Approved", img: "/images/cert/cert-florida.png" },
  { name: "NAMI", img: "/images/cert/cert-nami.png" },
  { name: "AAMA / WDMA / CSA", img: "/images/cert/cert-aama.png" },
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
      <section className="bg-white py-28 md:py-40">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">What we produce</p>
              <h2 className="mt-6 max-w-2xl headline text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.08] text-ink">
                Windows, doors, sliding &amp; facade systems.
              </h2>
            </div>
            <Link href="/products" className="group inline-flex items-center gap-2 text-[13px] font-medium text-ink underline-offset-4 hover:text-blue">
              All products <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 px-6 md:grid-cols-4 md:gap-x-6 md:px-10">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.name} delay={(i % 4) * 0.08}>
              <Link href={p.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]" sizes="(max-width:768px) 50vw, 25vw" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="headline text-lg text-ink md:text-xl">{p.name}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate">{p.desc}</p>
                  </div>
                  <ArrowUpRight size={18} className="mt-1 shrink-0 text-slate transition-colors group-hover:text-blue" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* OUR FACTORIES — image-led */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-mist lg:aspect-[4/5]">
              <Image src="/images/manufacturing.png" alt="Inside a VALDA production facility" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/55 to-transparent" />
              <p className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/90">Sofia · Veliko Tarnovo</p>
            </div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Our factories</p>
              <h2 className="mt-6 headline text-[clamp(2rem,3.8vw,3.2rem)] leading-[1.04] text-ink">
                Two factories.<br />One standard.
              </h2>
              <p className="mt-7 max-w-md text-[16px] leading-[1.8] text-slate">
                Family-owned since 1998, with 300+ specialists across our own European factories. One team accountable from the first drawing to delivery on your site.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/10 pt-8 md:gap-8">
                {WHO_STATS.map((s) => (
                  <div key={s.label}>
                    <div className="headline text-4xl text-ink md:text-5xl">
                      <CountUp value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* CERTIFIED — slim trust strip */}
      <section className="border-y border-ink/10 bg-paper py-14 md:py-16">
        <Container>
          <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:justify-between md:gap-16">
            <div className="max-w-sm">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Certified for the US</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">
                Every system is tested and approved for the US market, from Florida Product Approvals and HVHZ to NAMI and the full ASTM battery.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
              {CERTS.map(({ name, img }) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={name} src={img} alt={name} className="h-11 w-auto object-contain opacity-90 md:h-12" />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* PROJECTS — carousel */}
      <ProjectsScroll />

      {/* FAQ — compact */}
      <section className="bg-paper py-28 md:py-40">
        <Container>
          <div className="grid gap-14 md:grid-cols-[0.42fr_1fr] md:gap-20">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">FAQ</p>
              <h2 className="mt-6 headline text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.05] text-ink">
                Frequently asked questions.
              </h2>
              <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-slate">
                Where we make it, how it&apos;s certified, and how it gets to you.
              </p>
              <Link href="/faq" className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-ink underline-offset-4 hover:text-blue">
                View all FAQs <ArrowRight size={14} />
              </Link>
              <div className="mt-12 border-t border-ink/10 pt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Certified for the US</p>
                <div className="mt-6 grid grid-cols-3 items-center gap-x-6 gap-y-6">
                  {FAQ_CERTS.map((c) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={c.img} src={c.img} alt={c.name} className="h-10 w-auto object-contain md:h-12" />
                  ))}
                </div>
              </div>
            </div>
            <FaqAccordion items={FAQS.slice(0, 5)} />
          </div>
        </Container>
      </section>

      {/* CONSULTATION */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-20">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Consultation</p>
              <h2 className="mt-6 max-w-md headline text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.08] text-ink">
                Talk to a specialist before you spec.
              </h2>
              <p className="mt-7 max-w-lg text-[16px] leading-[1.8] text-slate">
                Book a free 30-minute call or video consultation. Tell us about the project and we&apos;ll help you choose the right system, hit your performance targets, and map out US certification and delivery. No obligation.
              </p>
              <ul className="mt-9 grid max-w-md gap-4">
                {CONSULT_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink/80">{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-[24px] bg-ink text-white shadow-[0_40px_80px_-40px_rgba(14,18,23,0.5)]">
                <div className="p-8 md:p-10">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/80">
                    Free · 30 min · Phone or video
                  </p>
                  <h3 className="mt-6 headline text-[26px] leading-tight text-white md:text-[32px]">Book a consultation</h3>
                  <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/65">
                    Send a few details about your project and we&apos;ll confirm a time within one business day.
                  </p>
                  <div className="mt-8">
                    <Button href="/contact" variant="light">Book a consultation <ArrowRight size={16} /></Button>
                  </div>
                </div>
                <div className="space-y-4 border-t border-white/10 px-8 py-7 md:px-10">
                  <a href={`tel:${SITE.phones[0].number.replace(/\s/g, "")}`} className="group flex items-center gap-3.5 text-[15px] text-white/85 transition-colors hover:text-white">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors group-hover:bg-white group-hover:text-ink">
                      <Phone size={15} />
                    </span>
                    {SITE.phones[0].number}
                    <span className="text-[12px] text-white/45">· {SITE.phones[0].region}</span>
                  </a>
                  <a href={`mailto:${SITE.email}`} className="group flex items-center gap-3.5 text-[15px] text-white/85 transition-colors hover:text-white">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors group-hover:bg-white group-hover:text-ink">
                      <Mail size={15} />
                    </span>
                    {SITE.email}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* GET A QUOTE — immersive band */}
      <ImmersiveBand
        image="/images/arch-5.jpg"
        eyebrow="Start a project"
        intro="Send your wind zone, opening schedule and performance targets. We respond within one business day."
        headline={<>Let&apos;s build something that lasts.</>}
        link={{ label: "Get a quote", href: "/contact" }}
        minH="min-h-[78vh]"
      />
      </div>
    </>
  );
}
