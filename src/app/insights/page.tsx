import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { POSTS } from "@/lib/insights";

export const metadata: Metadata = pageMeta({
  title: "Insights: Guides to European Windows",
  description:
    "Guides to European windows: aluminum vs PVC, hurricane impact windows, Florida Product Approval and the HVHZ, how profiles are made and shipping to the USA.",
  path: "/insights",
  image: "/images/arch-4.jpg",
});

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-md bg-panel px-2 py-0.5 text-[12px] text-char">{children}</span>;
}

export default function InsightsPage() {
  const [featured, ...rest] = POSTS;

  return (
    <PinnedHero
      eyebrow="Insights"
      title="Field notes from the factory."
      intro="How European windows are engineered and made, how we export worldwide, and how to choose the right system for any climate."
      image="/images/arch-4.jpg"
    >
      {/* /01 featured */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SwHead label="Featured" n="01" layout="stacked" title="Latest Guide" />

          <Link href={`/insights/${featured.slug}`} className="group mt-14 grid gap-3 rounded-lg bg-panel p-2 md:mt-20 lg:grid-cols-2 lg:gap-4">
            <div className="relative aspect-[16/11] overflow-hidden rounded-lg">
              <Image src={featured.cover} alt={featured.title} fill priority className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 50vw" />
            </div>
            <div className="flex flex-col justify-between p-4 md:p-8">
              <div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-block rounded-md bg-white px-2 py-0.5 text-[12px] text-char">{featured.category}</span>
                  <span className="inline-block rounded-md bg-white px-2 py-0.5 text-[12px] text-char">{featured.readMins} min read</span>
                </div>
                <h2 className="sw-h mt-6 text-[clamp(1.75rem,3vw,2.5rem)] text-char">{featured.title}</h2>
                <p className="mt-5 max-w-lg text-[16px] leading-6 text-slate">{featured.excerpt}</p>
              </div>
              <div className="mt-10 flex items-center justify-between gap-4">
                <p className="text-[14px] leading-[22px] text-mute">{featured.dateLabel}</p>
                <span className="inline-flex h-[52px] items-center gap-2 rounded-lg bg-char px-5 text-[14px] text-white transition-colors duration-300 group-hover:bg-black">
                  Read the guide <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        </Container>
      </section>

      {/* /02 all articles */}
      {rest.length > 0 && (
        <section className="bg-panel py-28 md:py-36">
          <Container>
            <SwHead label="All articles" n="02" layout="stacked" title="More From the Factory" />
            <div className="mt-14 grid gap-3 md:mt-20 md:grid-cols-3 md:gap-4">
              {rest.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
                  <Link href={`/insights/${p.slug}`} className="group flex h-full flex-col rounded-lg bg-white p-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image src={p.cover} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div><Chip>{p.category}</Chip></div>
                      <h3 className="sw-h mt-4 text-[24px] text-char">{p.title}</h3>
                      <p className="mt-3 line-clamp-2 text-[16px] leading-6 text-slate">{p.excerpt}</p>
                      <p className="mt-auto pt-6 text-[14px] leading-[22px] text-mute">{p.dateLabel}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </PinnedHero>
  );
}
