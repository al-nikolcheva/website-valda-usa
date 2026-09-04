import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { allOpeningTypes, openingTypeSlug, systemsWithOpeningType } from "@/lib/products";

export function generateStaticParams() {
  return allOpeningTypes().map((t) => ({ type: openingTypeSlug(t) }));
}

function typeName(slug: string): string | undefined {
  return allOpeningTypes().find((t) => openingTypeSlug(t) === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const name = typeName(type);
  return { title: name ? `${name} systems` : "Openings" };
}

export default async function OpeningTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const name = typeName(type);
  if (!name) notFound();
  const systems = systemsWithOpeningType(type);

  const heldLabel = (s: (typeof systems)[number]) =>
    s.openings.some((o) => o.held === "florida-approval") ? "Florida approved" : "AAMA tested";

  return (
    <PinnedHero
      eyebrow="Products · Opening type"
      title={name}
      intro={`Every VALDA system available as a ${name.toLowerCase()} unit, side by side.`}
      image="/images/arch-3.jpg"
    >
      <section className="bg-pure py-20 md:py-28">
        <Container>
          <div className="border-t border-mist pt-8">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
              <span className="h-px w-7 bg-slate/40" /> {systems.length} system{systems.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">
                  <th className="py-3 pr-6 font-medium">System</th>
                  <th className="py-3 pr-6 font-medium">Design pressure</th>
                  <th className="py-3 pr-6 font-medium">Largest opening</th>
                  <th className="py-3 pr-6 font-medium">Held</th>
                  <th className="py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.slug} className="border-t border-mist align-top">
                    <td className="py-5 pr-6">
                      <Link href={`/products/system/${s.slug}`} className="group inline-flex items-baseline gap-2">
                        <span className="headline text-[17px] text-ink transition-colors group-hover:text-blue">{s.name}</span>
                      </Link>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{s.brand}</span>
                    </td>
                    <td className="py-5 pr-6 font-mono text-[13px] text-ink">{s.summary.designPressure ? `Up to ${s.summary.designPressure}` : ""}</td>
                    <td className="py-5 pr-6 font-mono text-[13px] text-slate">{s.summary.largestOpening ?? ""}</td>
                    <td className="py-5 pr-6">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{heldLabel(s)}</span>
                      {s.hvhz && <span className="ml-2 rounded-full bg-blue/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-blue">HVHZ</span>}
                    </td>
                    <td className="py-5">
                      <Link href={`/products/system/${s.slug}`} aria-label={s.name} className="inline-flex text-slate hover:text-blue"><ArrowUpRight size={17} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
