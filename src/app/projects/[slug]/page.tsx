import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { Button } from "@/components/ui/button";
import { PROJECTS, getProject, type Project } from "@/lib/projects";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Project" };
  return pageMeta({
    title: projectTitle(p),
    description: projectDescription(p),
    path: `/projects/${p.slug}`,
    image: p.img,
    imageAlt: `${p.name}, ${p.location}`,
  });
}

function projectTitle(p: Project): string {
  const long = `${p.name}, ${p.market} Project in ${p.location}`;
  return long.length <= 52 ? long : `${p.name}, ${p.location}`;
}

// Built from the project record only: summary, type, location and the systems used.
function projectDescription(p: Project): string {
  const parts = p.systems.split(/\s*·\s*/).map((x) => x.toLowerCase());
  const sys = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  const candidates = [
    `${p.summary} ${p.market} project in ${p.location}, glazed with VALDA ${sys}.`,
    `${p.summary} ${p.market} project in ${p.location} with VALDA ${sys}.`,
    `${p.summary} ${p.location}, glazed with VALDA ${sys}.`,
    `${p.summary} Glazed with VALDA ${sys}.`,
    `${p.summary} ${p.location}.`,
  ];
  return candidates.find((c) => c.length <= 160) ?? p.summary;
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
      <JsonLd data={breadcrumbLd([["Home", "/"], ["Projects", "/projects"], [p.name, `/projects/${p.slug}`]])} />

      {/* /01 overview: facts + description */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Overview" n="01" layout="stacked" title={<span className="block max-w-[720px]">{p.description[0]}</span>} />
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-10">
            <Reveal className="md:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                {facts.map(([k, v]) => (
                  <div key={k} className={`rounded-lg bg-panel p-5 ${k === "Systems" ? "col-span-2" : ""}`}>
                    <p className="text-[14px] leading-[22px] text-mute">{k}</p>
                    <p className="mt-2 text-[16px] font-medium leading-6 text-char">{v}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" delay={0.1}>
              {p.description.slice(1).map((d, i) => (
                <p key={i} className={`max-w-xl text-[16px] leading-6 ${i === 0 ? "font-medium text-char" : "mt-5 text-slate"}`}>{d}</p>
              ))}
              <p className="mt-8 flex items-center gap-2 text-[14px] text-char/80">
                <MapPin size={15} className="text-mute" /> {p.location}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* gallery */}
      <section className="bg-white px-2 pb-2 md:px-4 md:pb-4">
        <div className="flex flex-col gap-2 md:gap-4">
          {p.gallery.map((g, i) => (
            <Reveal key={i}>
              <div className="relative h-[64vh] min-h-[380px] w-full overflow-hidden rounded-lg">
                <Image src={g} alt={`${p.name}, ${p.location}, view ${i + 1}`} fill className="object-cover" sizes="100vw" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* /02 other projects */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="More projects" n="02" layout="stacked" title="Continue Exploring" />
          <div className="mt-14 grid gap-3 md:mt-20 md:grid-cols-3 md:gap-4">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 0.08} className="h-full">
                <Link href={`/projects/${o.slug}`} className="group flex h-full flex-col rounded-lg bg-white p-2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image src={o.img} alt={o.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="inline-block rounded-md bg-panel px-2 py-0.5 text-[12px] text-char">Completed {o.year}</span>
                    <h3 className="sw-h mt-4 text-[24px] text-char">{o.name}</h3>
                    <p className="mt-2 flex items-center gap-2 text-[14px] text-char/80">
                      <MapPin size={15} className="text-mute" /> {o.location}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* cta */}
      <section className="bg-panel px-2 pb-2 md:px-4 md:pb-4">
        <div className="rounded-lg bg-char px-5 py-20 text-white md:px-10 md:py-28">
          <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <h2 className="sw-h max-w-xl text-[clamp(2.2rem,4.4vw,3.5rem)] text-white">Start a project like this</h2>
            <Button href="/contact" variant="light">Request a quote <ArrowRight size={16} /></Button>
          </div>
        </div>
      </section>
    </PinnedHero>
  );
}
