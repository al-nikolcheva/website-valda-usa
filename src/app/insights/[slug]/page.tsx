import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { POSTS, getPost, type Block } from "@/lib/insights";

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

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "h2":
      return <h2 className="mt-14 headline text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.15] tracking-[-0.01em] text-ink">{b.text}</h2>;
    case "h3":
      return <h3 className="mt-10 text-[19px] font-semibold tracking-[-0.01em] text-ink">{b.text}</h3>;
    case "ul":
      return (
        <ul className="mt-5 space-y-3">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[17px] leading-[1.7] text-slate">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return <blockquote className="mt-10 border-l-2 border-blue pl-6 text-[clamp(1.15rem,2vw,1.4rem)] font-medium leading-[1.4] tracking-[-0.01em] text-ink">{b.text}</blockquote>;
    default:
      return <p className="mt-6 text-[17px] leading-[1.75] text-slate">{b.text}</p>;
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
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Insights", item: `${BASE}/insights` },
      { "@type": "ListItem", position: 2, name: p.title, item: `${BASE}/insights/${p.slug}` },
    ],
  };

  return (
    <main className="bg-pure pb-24 pt-28 md:pt-32">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <Container>
        <article className="mx-auto max-w-2xl">
          <Link href="/insights" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate transition-colors hover:text-ink">
            <ArrowLeft size={14} /> Insights
          </Link>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-bright">{p.category} · {p.dateLabel} · {p.readMins} min read</p>
          <h1 className="mt-4 headline text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.03] tracking-[-0.025em] text-ink">{p.title}</h1>
          <p className="mt-6 text-[18px] leading-[1.6] text-slate">{p.excerpt}</p>

          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl">
            <Image src={p.cover} alt={p.title} fill priority className="object-cover" sizes="(max-width:768px) 100vw, 700px" />
          </div>

          <div className="mt-4">
            {p.body.map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
          </div>

          {p.faqs && p.faqs.length > 0 && (
            <section className="mt-16 border-t border-mist pt-10">
              <h2 className="headline text-[clamp(1.5rem,2.6vw,2rem)] tracking-[-0.01em] text-ink">Frequently asked</h2>
              <div className="mt-8 space-y-8">
                {p.faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="text-[17px] font-semibold text-ink">{f.q}</h3>
                    <p className="mt-2 text-[16px] leading-[1.7] text-slate">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-16 flex flex-col items-start gap-5 rounded-2xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="headline text-[22px] tracking-[-0.01em]">Planning a project?</h2>
              <p className="mt-2 text-[14px] text-white/70">Tell us about your openings and we will match the right certified system.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/products/finder" variant="light">Find your system <ArrowRight size={15} /></Button>
              <Button href="/contact" variant="outlineLight">Talk to us</Button>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <div className="mx-auto mt-20 max-w-4xl border-t border-mist pt-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate">Keep reading</p>
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.slug} href={`/insights/${r.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                    <Image src={r.cover} alt={r.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 50vw" />
                  </div>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-bright">{r.category}</p>
                  <h3 className="mt-2 headline text-[20px] leading-snug tracking-[-0.01em] text-ink transition-colors group-hover:text-blue">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
