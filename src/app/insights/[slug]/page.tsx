import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { POSTS, getPost, type Block } from "@/lib/insights";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/seo";

const BASE = "https://valdagroup.com";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return { title: "Insights" };
  const url = `${BASE}/insights/${p.slug}`;
  return {
    title: p.title,
    description: p.description,
    keywords: p.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.description,
      url,
      siteName: "VALDA",
      publishedTime: p.date,
      images: [{ url: `${BASE}${p.cover}`, width: 1200, height: 630, alt: p.title }],
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [`${BASE}${p.cover}`] },
  };
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-md bg-panel px-2 py-0.5 text-[12px] text-char">{children}</span>;
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "h2":
      return <h2 className="sw-h mt-16 text-[28px] text-char md:text-[32px]">{b.text}</h2>;
    case "h3":
      return <h3 className="sw-h mt-10 text-[22px] text-char">{b.text}</h3>;
    case "ul":
      return (
        <ul className="mt-6 space-y-3">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[18px] leading-[30px] text-char/80">
              <span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-mute" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="sw-h mt-12 rounded-lg bg-panel p-6 text-[22px] leading-[1.35] text-char md:p-8 md:text-[24px]">
          {b.text}
        </blockquote>
      );
    default:
      return <p className="mt-6 text-[18px] leading-[30px] text-char/80">{b.text}</p>;
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();

  const related = (p.related ?? []).map(getPost).filter(Boolean).slice(0, 2) as NonNullable<ReturnType<typeof getPost>>[];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    image: `${BASE}${p.cover}`,
    datePublished: p.date,
    dateModified: p.date,
    author: { "@type": "Organization", name: "VALDA", url: BASE },
    publisher: { "@type": "Organization", name: "VALDA", url: BASE },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/insights/${p.slug}` },
    keywords: p.keywords.join(", "),
  };
  const faqLd = p.faqs && p.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;
  const crumbsLd = breadcrumbLd([
    ["Home", "/"],
    ["Insights", "/insights"],
    [p.title, `/insights/${p.slug}`],
  ]);

  return (
    <main className="bg-white pt-28 md:pt-36">
      <JsonLd data={articleLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <JsonLd data={crumbsLd} />

      <Container>
        {/* header */}
        <div className="mx-auto max-w-[880px]">
          <Link href="/insights" className="inline-flex items-center gap-2 text-[14px] leading-[22px] text-mute transition-colors hover:text-char">
            <ArrowLeft size={14} /> Insights
          </Link>
          <div className="mt-10 flex flex-wrap gap-1.5">
            <Chip>{p.category}</Chip>
            <Chip>{p.readMins} min read</Chip>
          </div>
          <h1 className="sw-h mt-6 text-[clamp(2.2rem,4.8vw,3.75rem)] leading-[1.08] text-char">{p.title}</h1>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-16">
            <p className="max-w-[560px] text-[16px] font-medium leading-6 text-char">{p.excerpt}</p>
            <p className="shrink-0 text-[14px] leading-[22px] text-mute">{p.dateLabel}</p>
          </div>
        </div>

        <div className="relative mx-auto mt-12 aspect-[16/9] w-full max-w-[1200px] overflow-hidden rounded-lg md:mt-16">
          <Image src={p.cover} alt={p.title} fill priority className="object-cover" sizes="(max-width:1240px) 100vw, 1200px" />
        </div>

        {/* body */}
        <article className="mx-auto max-w-[680px] pb-28 pt-8 md:pb-36 md:pt-12">
          {p.body.map((b, i) => (
            <BlockView key={i} b={b} />
          ))}

          {p.faqs && p.faqs.length > 0 && (
            <section className="mt-20">
              <p className="text-[14px] leading-[22px] text-mute">FAQ</p>
              <h2 className="sw-h mt-6 text-[28px] text-char md:text-[32px]">Frequently asked</h2>
              <div className="mt-8 space-y-3">
                {p.faqs.map((f) => (
                  <div key={f.q} className="rounded-lg bg-panel p-6">
                    <h3 className="text-[18px] font-medium leading-7 text-char">{f.q}</h3>
                    <p className="mt-3 text-[16px] leading-6 text-slate">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-20 rounded-lg bg-char p-6 text-white md:p-8">
            <h2 className="sw-h text-[28px] text-white">Planning a project?</h2>
            <p className="mt-3 max-w-md text-[16px] leading-6 text-white/70">Tell us about your openings and we will match the right certified system.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/products/finder" variant="light">Find your system <ArrowRight size={15} /></Button>
              <Button href="/contact" variant="outlineLight">Talk to us</Button>
            </div>
          </div>
        </article>
      </Container>

      {related.length > 0 && (
        <section className="bg-panel py-28 md:py-36">
          <Container>
            <p className="text-[14px] leading-[22px] text-mute">Keep reading</p>
            <h2 className="sw-h mt-8 text-[clamp(2.2rem,4.4vw,3.5rem)] text-char">Related Guides</h2>
            <div className="mt-14 grid gap-3 sm:grid-cols-2 md:mt-20 md:gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/insights/${r.slug}`} className="group flex flex-col rounded-lg bg-white p-2">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                    <Image src={r.cover} alt={r.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 50vw" />
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="p-4">
                    <Chip>{r.category}</Chip>
                    <h3 className="sw-h mt-4 text-[24px] text-char">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
