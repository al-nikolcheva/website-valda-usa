import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { SwButton } from "@/components/sw/button";
import { PRODUCTS, navGroups, type NavGroup } from "@/lib/products";

const TYPES: { name: string; group: NavGroup; href: string; img: string; desc: string }[] = [
  { name: "Windows", group: "Windows", href: "/products/windows", img: "/products/masterline-8.png", desc: "Tilt & turn, fixed, casement and dual-action in aluminum and PVC." },
  { name: "Doors", group: "Doors", href: "/products/doors", img: "/products/conceptsystem-77.png", desc: "Entrance, terrace and patio doors with slim, disappearing sightlines." },
  { name: "Sliding & Folding", group: "Sliding & Folding", href: "/products/sliding", img: "/products/conceptpatio-155.png", desc: "Lift & slide and minimal-frame systems that open rooms to the view." },
  { name: "Facades & Curtain Walls", group: "Facades", href: "/products/facades", img: "/products/conceptwall-50.png", desc: "Curtain wall and window wall systems for larger envelopes." },
];

// Material chips and system count come from the product data, never hardcoded.
function statsOf(group: NavGroup) {
  const list = PRODUCTS.filter((s) => navGroups(s).includes(group));
  const mats = new Set(list.map((s) => (/pvc|vinyl/i.test(s.category) ? "PVC" : "Aluminum")));
  return { count: list.length, materials: (["Aluminum", "PVC"] as const).filter((m) => mats.has(m)) };
}

export const metadata: Metadata = pageMeta({
  title: "Aluminum & PVC Windows, Doors & Facades",
  description:
    "European aluminum and PVC (vinyl) windows, tilt and turn, sliding doors and facades, with hurricane impact systems and Florida Product Approval for the USA.",
  path: "/products",
  image: "/images/arch-1.jpg",
});

export default function ProductsPage() {
  return (
    <PinnedHero
      eyebrow="Products"
      title="Systems for every opening."
      intro="High-end aluminum and PVC systems, engineered and certified for the USA. Choose the type of opening to see the systems."
      image="/images/arch-1.jpg"
    >
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SectionHead index="01" label="The range" title="What are you building?" />
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">
            Choose an opening type to see the systems, then narrow by material or certification.
          </p>
          <div className="mt-14 grid gap-3 md:grid-cols-2">
            {TYPES.map((t, i) => {
              const st = statsOf(t.group);
              return (
                <Reveal key={t.name} delay={(i % 2) * 0.08} className="h-full">
                  <Link href={t.href} className="group flex h-full flex-col rounded-lg bg-panel p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[14px] leading-[22px] text-mute">/{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <div className="relative mx-auto my-6 aspect-[16/10] w-full max-w-[520px]">
                      <Image
                        src={t.img}
                        alt={`${t.name} profile section`}
                        fill
                        className="object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width:768px) 90vw, 45vw"
                      />
                    </div>
                    <div className="mt-auto">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {st.materials.map((m) => (
                          <span key={m} className="rounded-md bg-white px-2 py-0.5 text-[12px] text-char">{m}</span>
                        ))}
                        <span className="px-1 text-[12px] text-mute">
                          {st.count} system{st.count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <h2 className="sw-h mt-4 text-[28px] text-char md:text-[32px]">{t.name}</h2>
                      <p className="mt-2 max-w-md text-[16px] leading-6 text-slate">{t.desc}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SectionHead index="02" label="Not sure which system?" title="Answer a few quick questions and we'll match you." />
          <div className="mt-10 flex flex-wrap gap-3">
            <SwButton href="/products/finder">
              Find your system <ArrowRight size={16} />
            </SwButton>
            <SwButton href="/contact" variant="white">
              Talk to us
            </SwButton>
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
