import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { PROJECTS, getProject } from "@/lib/projects";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p ? p.name : "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const others = PROJECTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const facts: [string, string][] = [
    ["Location", p.location],
    ["Type", p.market],
    ["Year", p.year],
    ["Systems", p.systems],
  ];

  return (
    <PinnedHero eyebrow={`${p.market} · ${p.year}`} title={p.name} intro={p.summary} image={p.img}>

      {/* facts + description */}
      <section className="bg-white py-20 md:py-28">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:gap-10">
            <Reveal className="md:col-span-4">
              <div className="flex flex-col gap-5">
                {facts.map(([k, v]) => (
                  <div key={k} className="border-t border-ink/15 pt-3">
                    <p className="caption">{k}</p>
                    <p className="mt-1.5 text-[15px] text-ink">{v}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal className="md:col-span-7 md:col-start-6" delay={0.1}>
              <p className="statement text-[clamp(1.25rem,2vw,1.7rem)] text-ink">{p.description[0]}</p>
              {p.description.slice(1).map((d, i) => (
                <p key={i} className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate">{d}</p>
              ))}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* gallery */}
      <section className="bg-ink pb-4">
        {p.gallery.map((g, i) => (
          <Reveal key={i}>
            <div className="relative h-[64vh] min-h-[380px] w-full overflow-hidden">
              <Image src={g} alt={`${p.name} ${i + 1}`} fill className="object-cover" sizes="100vw" />
            </div>
            {i < p.gallery.length - 1 && <div className="h-4" />}
          </Reveal>
        ))}
      </section>

      {/* other projects */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHead label="More projects" title="Continue exploring." />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 0.08}>
                <Link href={`/projects/${o.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={o.img} alt={o.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <h3 className="headline text-lg text-ink">{o.name}</h3>
                    <ArrowUpRight size={16} className="text-slate transition-colors group-hover:text-blue" />
                  </div>
                  <p className="mt-1 caption">{o.location}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* cta */}
      <section className="bg-ink py-20 text-white">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl headline text-3xl md:text-4xl">Start a project like this</h2>
          <Button href="/contact" variant="light">Request a quote <ArrowRight size={16} /></Button>
        </Container>
      </section>
    </PinnedHero>
  );
}
