import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { ProfileThumb } from "@/components/profile-thumb";
import { allOpeningTypes, cutImage, openingTypeSlug, systemsWithOpeningType } from "@/lib/products";
import { noDash, pageMeta, systemMaterial } from "@/lib/seo";

export function generateStaticParams() {
  return allOpeningTypes().map((t) => ({ type: openingTypeSlug(t) }));
}

function typeName(slug: string): string | undefined {
  return allOpeningTypes().find((t) => openingTypeSlug(t) === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const name = typeName(type);
  if (!name) return { title: "Openings" };
  const systems = systemsWithOpeningType(type);
  const mats = (["Aluminum", "PVC"] as const).filter((m) => systems.some((x) => systemMaterial(x) === m));
  const SMALL = /^(to|or|and|with|in|of)$/i;
  const label = name
    .split(" ")
    .map((w, i) => (i > 0 && SMALL.test(w) ? w : w.replace(/^(\(?)([a-z])/, (_, p: string, c: string) => p + c.toUpperCase())))
    .join(" ");
  // Lower-case for running text, but keep configuration codes like XO / OXXO.
  const inline = name
    .split(" ")
    .map((w) => (/[A-Z].*[A-Z]/.test(w) ? w : w.toLowerCase()))
    .join(" ");
  const matLabel = mats.join(" & ");
  const title = `${label} Systems in ${matLabel}`.length + 8 <= 60 ? `${label} Systems in ${matLabel}` : `${label} Systems`;

  // Description from the systems on the page: count, names, material, approval.
  const n = systems.length;
  const lead = `${n === 1 ? "One VALDA system" : `${n} VALDA systems`} offered as ${inline}`;
  const matText = mats.map((m) => (m === "PVC" ? "PVC (vinyl)" : "aluminum")).join(" and ");
  const fl = systems.some((x) => x.flNumbers.length > 0);
  const tail = `European ${matText} windows and doors${fl ? " with Florida Product Approval where noted" : ""}, for the USA.`;
  const names = systems.map((x) => noDash(x.name));
  let description = `${lead}. ${tail}`;
  for (let k = names.length; k > 0; k--) {
    const list = names.slice(0, k).join(", ") + (k < names.length ? " and more" : "");
    const d = `${lead}: ${list}. ${tail}`;
    if (d.length <= 160) { description = d; break; }
  }
  const extra = " Compare material and certification side by side.";
  if (description.length + extra.length <= 160) description += extra;
  return pageMeta({ title, description, path: `/products/openings/${type}`, image: "/images/arch-3.jpg", imageAlt: `${label} systems` });
}

export default async function OpeningTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const name = typeName(type);
  if (!name) notFound();
  const systems = systemsWithOpeningType(type);

  const heldLabel = (s: (typeof systems)[number]) =>
    s.openings.some((o) => o.held === "florida-approval") ? "Florida approved" : "AAMA tested";
  const materialOf = (s: (typeof systems)[number]): "Aluminum" | "PVC" =>
    /pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminum";

  return (
    <PinnedHero
      eyebrow="Products · Opening type"
      title={name}
      intro={`Every VALDA system available as a ${name.toLowerCase()} unit, side by side.`}
      image="/images/arch-3.jpg"
    >
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SectionHead
            index="01"
            label={`${systems.length} system${systems.length === 1 ? "" : "s"}`}
            title={`${name} systems, side by side.`}
          />

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {systems.map((s) => {
              const img = cutImage(s.slug);
              return (
                <Link key={s.slug} href={`/products/system/${s.slug}`} className="group flex h-full flex-col rounded-lg bg-panel p-5 md:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">{heldLabel(s)}</span>
                      {s.hvhz && <span className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">HVHZ</span>}
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>

                  <div className="relative my-4 flex aspect-[16/11] items-center justify-center">
                    {img ? (
                      <Image
                        src={img}
                        alt={`${s.name} section`}
                        fill
                        className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    ) : (
                      <ProfileThumb material={materialOf(s)} className="h-[78%] w-[78%]" />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="sw-h text-[24px] text-char transition-colors">{s.name}</h3>
                    <p className="mt-1 text-[14px] leading-[22px] text-mute">{s.brand === "Valda" ? "VALDA" : s.brand}</p>
                    <div className="mt-auto flex flex-wrap gap-x-8 gap-y-3 pt-5">
                      {s.summary.designPressure && (
                        <div>
                          <div className="text-[12px] leading-[18px] text-mute">Design pressure</div>
                          <div className="mt-0.5 text-[14px] leading-[22px] text-char">
                            {/^up to/i.test(s.summary.designPressure.trim()) ? s.summary.designPressure : `Up to ${s.summary.designPressure}`}
                          </div>
                        </div>
                      )}
                      {s.summary.largestOpening && (
                        <div>
                          <div className="text-[12px] leading-[18px] text-mute">Largest opening</div>
                          <div className="mt-0.5 text-[14px] leading-[22px] text-char">{s.summary.largestOpening}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
