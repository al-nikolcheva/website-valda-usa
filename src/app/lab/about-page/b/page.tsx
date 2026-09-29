import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { SwHead } from "@/components/sw/head";
import { SwButton } from "@/components/sw/button";
import { CountUp } from "@/components/count-up";
import { FactoryHero } from "@/components/about/hero";
import { FactoryTour } from "@/components/lab/about-b/factory-tour";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = { title: "Lab: About B", robots: { index: false, follow: false } };

function Wide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-5 md:px-10 ${className}`}>{children}</div>;
}

const FACTORY_IMAGES: Record<string, { src: string; alt: string }> = {
  Sofia: { src: COMPANY.images.facility, alt: "Aerial view of the VALDA factory" },
  "Veliko Tarnovo": { src: COMPANY.images.fortress, alt: "Tsarevets fortress, Veliko Tarnovo" },
};

function joinBrands(list: readonly string[]) {
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

export default function AboutB() {
  return (
    <>
      <FactoryHero />

      {/* ── /01 WHO WE ARE ─────────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Wide>
          <SwHead label="Who we are" n="01" title="From a garage to two factories." />
          <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-[160px_1fr] md:gap-8">
            <div className="hidden md:block" />
            <div className="grid max-w-[980px] gap-6 lg:grid-cols-2 lg:gap-12">
              {COMPANY.story.body.map((p, i) => (
                <p key={i} className={i === 0 ? "text-[18px] font-medium leading-7 text-char" : "text-[16px] leading-6 text-slate"}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-char/10 md:mt-24 md:grid-cols-4">
            {COMPANY.numbers.map((s) => (
              <div key={s.label} className="bg-panel p-6 md:p-8">
                <p className="sw-h text-[clamp(2.4rem,5vw,4rem)] text-char">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-[14px] leading-[22px] text-slate md:text-[15px]">{s.label}</p>
              </div>
            ))}
          </div>
        </Wide>
      </section>

      {/* ── /02 HOW IT'S MADE ──────────────────────── */}
      <section className="bg-white pt-4 pb-28 md:pb-36">
        <Wide>
          <SwHead label="How it's made" n="02" title="A tour of the factory floor." />
          <p className="mt-6 max-w-[560px] text-[16px] leading-6 text-slate md:ml-[192px]">
            Five stages, all in our own factories. Scroll through what we make ourselves, from profile to pallet.
          </p>
          <div className="mt-14 md:mt-16">
            <FactoryTour />
          </div>
          <p className="mt-14 border-t border-char/10 pt-6 text-[14px] leading-[22px] text-slate md:mt-10">
            Built on European machinery from {joinBrands(COMPANY.machinery)}.
          </p>
        </Wide>
      </section>

      {/* ── /03 OUR TWO FACTORIES ──────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Wide>
          <SwHead label="Our two factories" n="03" layout="stacked" title="Sofia and Veliko Tarnovo." />
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-6">
            {COMPANY.factories.map((f, i) => {
              const img = FACTORY_IMAGES[f.name];
              return (
                <article key={f.name}>
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
              );
            })}
          </div>
        </Wide>
      </section>

      {/* ── /04 SINCE 1998 ─────────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Wide>
          <SwHead label="History" n="04" title={`Since ${COMPANY.founded}.`} />
          <ol className="mt-14 border-t border-char/10 md:mt-20 md:ml-[192px]">
            {COMPANY.timeline.map((t) => (
              <li
                key={t.year}
                className="grid grid-cols-[72px_1fr] gap-4 border-b border-char/10 py-6 md:grid-cols-[140px_minmax(0,320px)_minmax(0,1fr)] md:gap-8 md:py-7"
              >
                <span className="sw-h text-[20px] text-mute md:text-[24px]">{t.year}</span>
                <h3 className="sw-h text-[20px] text-char md:text-[24px]">{t.title}</h3>
                <p className="col-start-2 text-[15px] leading-6 text-slate md:col-start-3 md:text-[16px]">{t.body}</p>
              </li>
            ))}
          </ol>
        </Wide>
      </section>

      {/* ── /05 CERTIFIED FOR THE USA ──────────────── */}
      <section className="bg-white pb-28 md:pb-36">
        <Wide>
          <SwHead label="Certifications" n="05" title="Certified for the USA." />
          <div className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-4 md:gap-4">
            {COMPANY.certifications.map((c) => (
              <div key={c.name} className="flex flex-col rounded-lg bg-panel p-5 md:p-6">
                <div className="relative h-20 md:h-24">
                  <Image src={c.img} alt={c.name} fill className="object-contain object-left" sizes="200px" />
                </div>
                <p className="mt-6 text-[14px] leading-[22px] text-slate">{c.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[16px] leading-6 text-slate">Certificates and test reports on request.</p>
            <Link
              href="/certifications"
              className="group inline-flex items-center gap-2 text-[14px] leading-[22px] text-char underline-offset-4 hover:underline"
            >
              View certifications <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Wide>
      </section>

      {/* ── CLOSING CTA ────────────────────────────── */}
      <section className="px-2 pb-2 md:px-4 md:pb-4">
        <div className="rounded-lg bg-char py-24 md:py-32">
          <Wide className="flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[14px] leading-[22px] text-white/55">Made in our factories, shipped factory direct</p>
              <h2 className="sw-h mt-6 text-[clamp(2.4rem,5vw,4.5rem)] text-white">Have a project in mind?</h2>
            </div>
            <SwButton href="/contact" variant="white">
              Start a project <ArrowRight size={15} />
            </SwButton>
          </Wide>
        </div>
      </section>
    </>
  );
}

