import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { Button } from "@/components/ui/button";
const TYPES: { name: string; href: string; img: string; desc: string }[] = [
  { name: "Windows", href: "/products/windows", img: "/images/arch-1.jpg", desc: "Tilt & turn, fixed, casement and dual-action in aluminium and PVC." },
  { name: "Doors", href: "/products/doors", img: "/images/arch-3.jpg", desc: "Entrance, terrace and patio doors with slim, disappearing sightlines." },
  { name: "Sliding & Folding", href: "/products/sliding", img: "/images/arch-5.jpg", desc: "Lift & slide and minimal-frame systems that open rooms to the view." },
  { name: "Facades & Curtain Walls", href: "/products/facades", img: "/images/hero.jpg", desc: "Curtain wall and window wall systems for larger envelopes." },
];

export const metadata: Metadata = {
  title: "Products",
  description: "High-end aluminium and PVC windows, doors, sliding and facade systems, engineered and certified for the USA.",
};

export default function ProductsPage() {
  return (
    <PinnedHero
      eyebrow="Products"
      title="Systems for every opening."
      intro="High-end aluminium and PVC systems, engineered and certified for the USA. Choose the type of opening to see the systems."
      image="/images/arch-1.jpg"
    >
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHead label="The range" title="What are you building?" />
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate">
            Choose an opening type to see the systems, then narrow by material or certification.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {TYPES.map((t, i) => (
              <Reveal key={t.name} delay={(i % 2) * 0.08}>
                <Link href={t.href} className="group block">
                  <div className="relative aspect-[16/11] overflow-hidden rounded-2xl">
                    <Image src={t.img} alt={t.name} fill className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" sizes="(max-width:768px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                    <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <ArrowUpRight size={19} className="text-ink" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h2 className="headline text-2xl text-white md:text-3xl">{t.name}</h2>
                    </div>
                  </div>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate">{t.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue">Explore {t.name.toLowerCase()} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="caption text-slate"><span className="text-blue-bright">/</span> Not sure which system?</p>
            <h2 className="mt-3 max-w-xl headline text-2xl tracking-[-0.01em] md:text-3xl">Answer a few quick questions and we&apos;ll match you.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/products/finder" variant="blue">Find your system <ArrowRight size={16} /></Button>
            <Button href="/contact" variant="outline">Talk to us</Button>
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
