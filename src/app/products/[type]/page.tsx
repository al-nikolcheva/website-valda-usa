import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { ArrowRight } from "lucide-react";
import { SwButton } from "@/components/sw/button";
import { ProductsExplorer } from "@/components/products-explorer";
import { type NavGroup } from "@/lib/products";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

// Search title + description per category, written from the systems in that group.
const TYPE_SEO: Record<string, { title: string; description: string }> = {
  windows: {
    title: "European Aluminum & PVC Windows",
    description: "Tilt and turn, casement, fixed and hurricane impact windows in aluminum and PVC (vinyl), made in Europe for the USA, most with Florida Product Approval.",
  },
  doors: {
    title: "European Aluminum & PVC Entry and Terrace Doors",
    description: "Entrance, entry, terrace and balcony doors in European aluminum and PVC (vinyl), with Florida Product Approval on selected systems. Shipped to the USA.",
  },
  sliding: {
    title: "Sliding, Lift & Slide and Folding Doors",
    description: "European sliding doors, lift and slide and folding systems in aluminum and PVC (vinyl) for the USA, including impact doors with Florida Product Approval.",
  },
  facades: {
    title: "Aluminum Curtain Walls & Window Walls",
    description: "European aluminum curtain wall and window wall systems, including an impact curtain wall with Florida Product Approval, for buildings across the USA.",
  },
};

const TYPE_MAP: Record<string, { cat: NavGroup; title: string; img: string; intro: string }> = {
  windows: { cat: "Windows", title: "Windows", img: "/images/arch-1.jpg", intro: "Tilt & turn, fixed, casement and dual-action systems in aluminum and PVC." },
  doors: { cat: "Doors", title: "Doors", img: "/images/arch-3.jpg", intro: "Entrance, terrace and patio doors engineered for slim sightlines and performance." },
  sliding: { cat: "Sliding & Folding", title: "Sliding & Folding", img: "/images/arch-5.jpg", intro: "Lift & slide and minimal-frame systems that open rooms to the view." },
  facades: { cat: "Facades", title: "Facades & Curtain Walls", img: "/images/hero.jpg", intro: "Curtain wall and window wall systems for buildings that make a statement." },
};

export function generateStaticParams() {
  return Object.keys(TYPE_MAP).map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const info = TYPE_MAP[type];
  const seo = TYPE_SEO[type];
  if (!info || !seo) return { title: "Products" };
  return pageMeta({ ...seo, path: `/products/${type}`, image: info.img, imageAlt: info.title });
}

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const info = TYPE_MAP[type];
  if (!info) notFound();

  return (
    <PinnedHero eyebrow="Products" title={info.title} intro={info.intro} image={info.img}>
      <JsonLd data={breadcrumbLd([["Home", "/"], ["Products", "/products"], [info.title, `/products/${type}`]])} />
      <section className="bg-white py-28 md:py-36">
        <Container>
          <SectionHead index="01" label={info.title} title="Find your system." />
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">
            Choose your material, then filter by brand, certification or opening.
          </p>
          <div className="mt-14">
            <ProductsExplorer group={info.cat} />
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
