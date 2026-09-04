import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { ProductsExplorer } from "@/components/products-explorer";
import { type NavGroup } from "@/lib/products";

const TYPE_MAP: Record<string, { cat: NavGroup; title: string; img: string; intro: string }> = {
  windows: { cat: "Windows", title: "Windows", img: "/images/arch-1.jpg", intro: "Tilt & turn, fixed, casement and dual-action systems in aluminium and PVC." },
  doors: { cat: "Doors", title: "Doors", img: "/images/arch-3.jpg", intro: "Entrance, terrace and patio doors engineered for slim sightlines and performance." },
  sliding: { cat: "Sliding & Folding", title: "Sliding & Folding", img: "/images/arch-5.jpg", intro: "Lift & slide and minimal-frame systems that open rooms to the view." },
  facades: { cat: "Facades", title: "Facades & Curtain Walls", img: "/images/hero.jpg", intro: "Curtain wall and window wall systems for buildings that make a statement." },
};

export function generateStaticParams() {
  return Object.keys(TYPE_MAP).map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  return { title: TYPE_MAP[type]?.title ?? "Products" };
}

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const info = TYPE_MAP[type];
  if (!info) notFound();

  return (
    <PinnedHero eyebrow="Products" title={info.title} intro={info.intro} image={info.img}>
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHead label={info.title} title="Find your system." />
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate">
            Choose your material, then filter by brand, certification or opening.
          </p>
          <div className="mt-12">
            <ProductsExplorer group={info.cat} />
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
