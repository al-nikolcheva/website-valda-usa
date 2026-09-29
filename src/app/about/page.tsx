import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { SwButton } from "@/components/sw/button";
import { CountUp } from "@/components/count-up";
import { StoryTimeline } from "@/components/about/story-timeline";
import { FactoryHero } from "@/components/about/hero";
import { FactoryExplorer } from "@/components/factory-board/factory";

export const metadata: Metadata = pageMeta({
  title: "About VALDA, European Window Manufacturer",
  description:
    "VALDA is a family-owned European maker of aluminum and PVC windows, doors and facades, founded in 1998 with two factories in Bulgaria, supplying the USA.",
  path: "/about",
  image: COMPANY.images.poster,
});

const { images, story, factories, numbers, values, certifications } = COMPANY;
const FILM = "/media/valda-film-720.mp4";

const FACTORY_IMAGES: Record<string, { src: string; alt: string }> = {
  Sofia: { src: images.facility, alt: "Aerial view of the VALDA factory in Sofia" },
  "Veliko Tarnovo": { src: images.fortress, alt: "Tsarevets fortress, Veliko Tarnovo" },
};


export default function AboutPage() {
  return (
    <>
      <FactoryHero />

      {/* ── /01 WHO WE ARE ────────────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Who we are" n="01" layout="stacked" title="From a garage to two factories." />
          <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <p className="statement text-[clamp(1.6rem,3vw,2.5rem)] text-char">
                A family-owned European manufacturer of aluminum and PVC windows, doors, sliding systems and facades, shipped factory direct to the USA.
              </p>
            </Reveal>
            <div className="space-y-5 lg:col-span-4 lg:col-start-9 lg:pt-3">
              {story.body.map((p, i) => (
                <Reveal key={i} delay={0.08 * i}>
                  <p className={i === 0 ? "text-[17px] font-medium leading-7 text-char" : "text-[16px] leading-6 text-slate"}>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── /02 INSIDE THE FACTORY (interactive model) ── */}
      <FactoryExplorer n="02" />

      {/* ── /03 OUR TWO FACTORIES ─────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Our two factories" n="03" layout="stacked" title="Sofia and Veliko Tarnovo." />
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-6">
            {factories.map((f, i) => {
              const img = FACTORY_IMAGES[f.name];
              return (
                <Reveal key={f.name} delay={0.08 * i}>
                  <article>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-char md:aspect-[5/4]">
                      {img && <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />}
                      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[12px] text-char">
                        <MapPin size={13} /> {f.name}, Bulgaria
                      </span>
                    </div>
                    <div className="mt-6 flex items-baseline justify-between gap-6">
                      <h3 className="sw-h text-[clamp(1.75rem,2.6vw,2.25rem)] text-char">{f.name}</h3>
                      <span className="text-[14px] leading-[22px] text-mute">Factory {String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className="mt-3 max-w-[460px] text-[16px] leading-6 text-slate">{f.note}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-char/10 pt-10 md:mt-24 lg:grid-cols-4">
            {numbers.map((s) => (
              <div key={s.label}>
                <p className="sw-h text-[clamp(2.6rem,5vw,4rem)] leading-none text-char tabular-nums">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-[14px] leading-[22px] text-mute">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── /04 TIMELINE ──────────────────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="Timeline" n="04" title="How we got here" />
          <div className="mt-14 md:mt-20">
            <StoryTimeline />
          </div>
        </Container>
      </section>

      {/* ── /05 WHAT WE STAND FOR ─────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Values" n="05" title="What we stand for" />
          <ul className="mt-14 border-t border-char/10 md:mt-20">
            {values.map((v, i) => (
              <li key={v.title} className="border-b border-char/10">
                <Reveal y={12} delay={0.04 * i}>
                  <div className="grid gap-2 py-7 md:grid-cols-[160px_1fr_1fr] md:items-baseline md:gap-8 md:py-9">
                    <p className="text-[14px] leading-[22px] text-mute">/{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="sw-h text-[clamp(1.5rem,2.4vw,2rem)] text-char">{v.title}</h3>
                    <p className="max-w-[480px] text-[16px] leading-6 text-slate">{v.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── /06 CERTIFIED FOR THE USA ─────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="Certification" n="06" title="Certified for the USA" />
          <div className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:gap-4 lg:grid-cols-4">
            {certifications.map((c) => (
              <div key={c.name} className="flex aspect-[3/2] flex-col items-center justify-center gap-4 rounded-lg bg-white p-5">
                <div className="relative h-14 w-full md:h-16">
                  <Image src={c.img} alt={c.name} fill className="object-contain" sizes="200px" />
                </div>
                <p className="text-center text-[13px] leading-5 text-slate">{c.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[16px] leading-6 text-slate">Certificates and test reports on request.</p>
            <Link
              href="/certifications"
              className="inline-flex items-center gap-1.5 text-[14px] leading-[22px] text-char underline-offset-4 hover:text-blue hover:underline"
            >
              See certifications <ArrowUpRight size={15} />
            </Link>
          </div>
        </Container>
      </section>

      {/* ── /07 THE FILM (full video, with sound and controls) ── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="The VALDA film" n="07" title="See how we make it." />
          <Reveal className="mt-14 md:mt-20">
            <div className="overflow-hidden rounded-lg bg-char">
              <video
                className="aspect-video w-full"
                src={FILM}
                poster={images.poster}
                controls
                playsInline
                preload="none"
              />
            </div>
          </Reveal>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[16px] leading-6 text-slate">Inside our factories in Sofia and Veliko Tarnovo · 2:52</p>
            <SwButton href="/contact" className="self-start sm:self-auto">
              Start a project <ArrowRight size={15} />
            </SwButton>
          </div>
        </Container>
      </section>
    </>
  );
}
