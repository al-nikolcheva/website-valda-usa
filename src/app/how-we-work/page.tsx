import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "How we work" };

const STEPS = [
  { n: "01", name: "Consultation & estimation", href: "/how-we-work/consultation", img: "/images/arch-2.jpg", body: "We start with your drawings, wind zone and performance targets, and return a value-engineered system schedule and a clear estimate in USD." },
  { n: "02", name: "Design & engineering", href: "/how-we-work/design", img: "/images/arch-4.jpg", body: "Our engineers detail every junction, anchor and glazing spec, sealed where required and aligned to the relevant FL Product Approval." },
  { n: "03", name: "Manufacturing", href: "/how-we-work/manufacturing", img: "/images/project-mona-3.jpg", body: "Fabrication, glazing and QC happen under one roof in Europe. Every HVHZ unit is checked before it leaves the factory." },
  { n: "04", name: "Logistics & delivery", href: "/how-we-work/logistics", img: "/images/project-milwaukee-1.jpg", body: "We pack for the Atlantic and ship factory direct, coordinating freight and US delivery to your site schedule." },
];

export default function HowWeWorkPage() {
  return (
    <PinnedHero
      eyebrow="How we work"
      title="A measured process, end to end."
      intro="One partner from the first drawing to the installed window, and one phone number for warranty."
      image="/images/arch-5.jpg"
    >
      <section className="py-20 md:py-28">
        <Container className="space-y-20 md:space-y-28">
          {STEPS.map((s, i) => (
            <Reveal key={s.n}>
              <div className={`grid items-center gap-12 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image src={s.img} alt={s.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
                </div>
                <div>
                  <span className="font-mono text-sm text-blue-bright">/ {s.n}</span>
                  <h2 className="mt-4 headline text-3xl tracking-[-0.02em] md:text-4xl">{s.name}</h2>
                  <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate">{s.body}</p>
                  <Link href={s.href} className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-blue underline-offset-4 hover:underline">
                    Read more <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>
      <section className="bg-paper py-20">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl headline text-3xl tracking-[-0.01em] md:text-4xl">Ready to start?</h2>
          <Button href="/contact" variant="blue">Request a consultation <ArrowRight size={16} /></Button>
        </Container>
      </section>
    </PinnedHero>
  );
}
