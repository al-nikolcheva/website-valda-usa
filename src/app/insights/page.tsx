import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { POSTS } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "How European windows are engineered and made, how VALDA exports worldwide, and how to choose systems for performance, comfort and certification in any market.",
};

export default function InsightsPage() {
  const [featured, ...rest] = POSTS;

  return (
    <PinnedHero
      eyebrow="Insights"
      title="Field notes from the factory."
      intro="How European windows are engineered and made, how we export worldwide, and how to choose the right system for any climate."
      image="/images/arch-4.jpg"
    >
      <section className="bg-pure py-20 md:py-28">
        <Container>
          {/* featured */}
          <Link href={`/insights/${featured.slug}`} className="group grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl">
              <Image src={featured.cover} alt={featured.title} fill priority className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 50vw" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-blue-bright">{featured.category} · {featured.dateLabel} · {featured.readMins} min read</p>
              <h2 className="mt-4 headline text-[clamp(1.8rem,3.4vw,2.8rem)] leading-[1.05] tracking-[-0.02em] text-ink transition-colors group-hover:text-blue">{featured.title}</h2>
              <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-slate">{featured.excerpt}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue">Read the guide <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>

          {/* the rest */}
          <div className="mt-20 grid gap-x-6 gap-y-12 md:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.08}>
                <Link href={`/insights/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={p.cover} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-bright">{p.category} · {p.dateLabel}</p>
                  <h2 className="mt-2 headline text-xl leading-snug tracking-[-0.01em] text-ink transition-colors group-hover:text-blue">{p.title}</h2>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-slate">{p.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
