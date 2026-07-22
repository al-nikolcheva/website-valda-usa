import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { GalleryMarquee } from "@/components/gallery-marquee";
import { ProjectsIndex } from "@/components/projects-index";

export const metadata: Metadata = {
  title: "Projects",
  description: "Delivered windows, doors and facade projects across the USA and Europe — Juneau Village, GORA, American University of Malta and more.",
};

export default function ProjectsPage() {
  return (
    <PinnedHero
      eyebrow="Projects"
      title="Built, lived in, proven."
      intro="Residential, multifamily and institutional work across the USA and Europe. Every facade here is glazed with VALDA systems."
      image="/images/project-mona-1.jpg"
    >
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHead label="Selected work" title="A selection of built and delivered projects." />
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate">
            Across civic, multifamily and private residential contexts in the USA and Europe.
          </p>
        </Container>
        <div className="mt-14">
          <GalleryMarquee />
        </div>
        <Container className="mt-24">
          <ProjectsIndex />
        </Container>
      </section>
    </PinnedHero>
  );
}
