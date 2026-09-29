import type { Metadata } from "next";
import Image from "next/image";
import { COMPANY } from "@/lib/company";
import { SwHead } from "@/components/sw/head";
import { SwButton } from "@/components/sw/button";
import { Reveal } from "@/components/primitives";
import { AboutBento } from "@/components/lab/about-c/bento";
import { TimelineStrip } from "@/components/lab/about-c/timeline-strip";

export const metadata: Metadata = {
  title: "Lab: About C",
  robots: { index: false, follow: false },
};

function Wide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-5 md:px-10 ${className}`}>{children}</div>;
}

export default function AboutC() {
  return (
    <>
      {/* Charcoal band behind the fixed white-text site header */}
      <div className="h-[76px] bg-char" aria-hidden />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-white pb-20 pt-14 md:pb-28 md:pt-20">
        <Wide>
          <div className="flex items-baseline justify-between">
            <p className="text-[14px] leading-[22px] text-mute">About VALDA</p>
            <p className="text-[14px] leading-[22px] text-mute">Est. {COMPANY.founded}</p>
          </div>

          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-14">
            <Reveal>
              <h1 className="sw-h text-[clamp(2.5rem,6vw,5.25rem)] text-char">
                European windows and doors, made by one family since {COMPANY.founded}.
              </h1>
              <p className="mt-8 max-w-xl text-[17px] leading-7 text-slate">
                Aluminum and PVC windows, doors, sliding systems and facades, made in our own factories in Sofia and
                Veliko Tarnovo and shipped factory direct to the USA.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <SwButton href="/contact">Start a project</SwButton>
                <SwButton href="/projects" variant="white" className="bg-panel hover:bg-mist">
                  See our projects
                </SwButton>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[4/3] lg:aspect-[4/5]">
                <Image
                  src={COMPANY.images.fortress}
                  alt="Tsarevets fortress above Veliko Tarnovo, Bulgaria"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 45vw"
                />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-md bg-white px-3 py-1 text-[13px] text-char">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue" aria-hidden />
                  Veliko Tarnovo, Bulgaria
                </span>
              </div>
            </Reveal>
          </div>
        </Wide>
      </section>

      {/* ── /01 AT A GLANCE ──────────────────────────────── */}
      <section className="bg-white pb-24 md:pb-32">
        <Wide>
          <SwHead label="At a glance" n="01" title="VALDA in one view" />
          <div className="mt-12 md:mt-16">
            <AboutBento />
          </div>
        </Wide>
      </section>

      {/* ── /02 SINCE 1998 ───────────────────────────────── */}
      <TimelineStrip n="02" />

      {/* ── /03 WHAT WE STAND FOR ────────────────────────── */}
      <section className="bg-white py-24 md:py-32">
        <Wide>
          <SwHead label="Values" n="03" title="What we stand for" />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-lg bg-mist sm:grid-cols-2 md:mt-16 lg:grid-cols-5">
            {COMPANY.values.map((v, i) => (
              <li key={v.title} className="flex flex-col bg-white p-6 lg:min-h-[260px] lg:p-7">
                <span className="text-[14px] leading-[22px] text-mute">/{String(i + 1).padStart(2, "0")}</span>
                <h3 className="sw-h mt-6 text-[24px] text-char lg:mt-auto">{v.title}</h3>
                <p className="mt-3 text-[15px] leading-6 text-slate">{v.body}</p>
              </li>
            ))}
          </ol>
        </Wide>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────── */}
      <section className="bg-white pb-24 md:pb-32">
        <Wide>
          <div className="relative isolate overflow-hidden rounded-lg bg-char px-6 py-16 md:px-14 md:py-24">
            <video
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
              src={COMPANY.images.film}
              poster={COMPANY.images.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-char/80 to-char/20" aria-hidden />
            <p className="text-[14px] leading-[22px] text-white/55">/04</p>
            <h2 className="sw-h mt-6 max-w-2xl text-[clamp(2.2rem,4.4vw,3.5rem)] text-white">See how we make it.</h2>
            <p className="mt-5 max-w-lg text-[16px] leading-6 text-white/70">
              From our own glazing and coating line to packing and shipping, every step happens under one roof. Tell
              us about your project and we will take it from the first drawing to the final delivery.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <SwButton href="/contact" variant="white">
                Start a project
              </SwButton>
            </div>
          </div>
        </Wide>
      </section>
    </>
  );
}

