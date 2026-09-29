import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { HeroBand } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { SwButton } from "@/components/sw/button";
import { CountUp } from "@/components/count-up";
import { StoryTimeline } from "@/components/about/story-timeline";

export const metadata: Metadata = {
  title: "Lab: About A",
  robots: { index: false, follow: false },
};

const { images, story, factories, numbers, values, certifications } = COMPANY;

const FACTORY_IMAGES: Record<string, { src: string; alt: string }> = {
  Sofia: { src: images.facility, alt: "Aerial view of the VALDA factory" },
  "Veliko Tarnovo": { src: images.tarnovo, alt: "Veliko Tarnovo, Bulgaria" },
};

export default function AboutA() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────── */}
      <HeroBand
        eyebrow="About us"
        title="A family business that grew up."
        intro={story.lead}
        image={images.fortress}
        imagePosition="center 40%"
      />

      {/* ── /01 OUR STORY ────────────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Our story" n="01" layout="stacked" title={`Since ${COMPANY.founded}`} />

          <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <p className="statement text-[clamp(1.6rem,3vw,2.5rem)] text-char">{story.lead}</p>
            </Reveal>
            <div className="space-y-5 lg:col-span-4 lg:col-start-9 lg:pt-3">
              {story.body.map((p, i) => (
                <Reveal key={i} delay={0.08 * i}>
                  <p className={i === 0 ? "text-[17px] font-medium leading-7 text-char" : "text-[16px] leading-6 text-slate"}>
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-5 md:mt-24 md:grid-cols-12 md:gap-6">
            <Reveal className="md:col-span-7">
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-panel">
                  <Image
                    src={images.floor}
                    alt="The VALDA factory floor, people at work"
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 58vw"
                  />
                </div>
                <figcaption className="mt-3 flex justify-between text-[14px] leading-[22px] text-mute">
                  <span>On the factory floor</span>
                  <span>Bulgaria</span>
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-5 md:mt-24">
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-panel">
                  <Image
                    src={images.facility}
                    alt="Aerial view of the VALDA production facility"
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 42vw"
                  />
                </div>
                <figcaption className="mt-3 flex justify-between text-[14px] leading-[22px] text-mute">
                  <span>From a garage to two factories</span>
                  <span>{COMPANY.founded} to today</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── /02 TIMELINE ─────────────────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="Timeline" n="02" title="How we got here" />
          <div className="mt-14 md:mt-20">
            <StoryTimeline />
          </div>
        </Container>
      </section>

      {/* ── /03 OUR TWO FACTORIES ────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Factories" n="03" title="Our two factories" />

          <div className="mt-14 grid gap-5 md:mt-20 md:grid-cols-2 md:gap-6">
            {factories.map((f, i) => {
              const img = FACTORY_IMAGES[f.name] ?? { src: images.fortress, alt: f.name };
              return (
                <Reveal key={f.name} delay={0.08 * i}>
                  <article className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-char sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/4]">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[12px] text-char">
                      <MapPin size={13} /> Bulgaria
                    </span>
                    <span className="absolute right-4 top-4 text-[14px] leading-[22px] text-white/70">
                      /{String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <h3 className="sw-h text-[clamp(1.9rem,3.4vw,3rem)] text-white">{f.name}</h3>
                      <p className="mt-2 max-w-[420px] text-[16px] leading-6 text-white/80">{f.note}</p>
                    </div>
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

      {/* ── /04 WHAT WE STAND FOR ────────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="Values" n="04" title="What we stand for" />

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

      {/* ── /05 CERTIFIED FOR THE USA ────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Certification" n="05" title="Certified for the USA" />

          <div className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:gap-4 lg:grid-cols-4">
            {certifications.map((c) => (
              <div
                key={c.name}
                className="flex aspect-[3/2] flex-col items-center justify-center gap-4 rounded-lg bg-panel p-5"
              >
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

      {/* ── CLOSING: FACTORY FILM ────────────────────── */}
      <section className="bg-white pb-28 md:pb-36">
        <Container>
          <Reveal>
            <div className="relative h-[72svh] min-h-[480px] overflow-hidden rounded-lg bg-char">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={images.film}
                poster={images.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-10">
                <div>
                  <p className="text-[14px] leading-[22px] text-white/60">Made in Sofia and Veliko Tarnovo</p>
                  <h2 className="sw-h mt-3 text-[clamp(2.2rem,4.4vw,3.5rem)] text-white">See how we make it.</h2>
                </div>
                <SwButton href="/contact" variant="white" className="self-start md:self-auto">
                  Start a project <ArrowRight size={15} />
                </SwButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

