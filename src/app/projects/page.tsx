import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { SwHead } from "@/components/sw/head";
import { GalleryMarquee } from "@/components/gallery-marquee";
import { ProjectsIndex } from "@/components/projects-index";

export const metadata: Metadata = pageMeta({
  title: "Window & Facade Projects in the USA and Europe",
  description:
    "Delivered window, door and facade projects in the USA and Europe, including Juneau Village in Milwaukee, GORA in Sofia and the American University of Malta.",
  path: "/projects",
  image: "/images/project-mona-1.jpg",
});

export default function ProjectsPage() {
  return (
    <PinnedHero
      eyebrow="Projects"
      title="Built, lived in, proven."
      intro="Residential, multifamily and institutional work across the USA and Europe. Every facade here is glazed with VALDA systems."
      image="/images/project-mona-1.jpg"
    >
      {/* /01 selected work */}
      <section className="bg-white pt-28 pb-20 md:pt-36 md:pb-24">
        <Container>
          <SwHead
            label="Selected work"
            n="01"
            layout="stacked"
            title={<span className="block max-w-[640px]">A selection of built and delivered projects.</span>}
          />
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">
            Across civic, multifamily and private residential contexts in the USA and Europe.
          </p>
        </Container>
        <div className="mt-14 md:mt-20">
          <GalleryMarquee />
        </div>
      </section>

      {/* /02 all projects */}
      <section className="bg-panel py-28 md:py-36">
        <Container>
          <SwHead label="All projects" n="02" layout="stacked" title="Every Project" />
          <div className="mt-14 md:mt-20">
            <ProjectsIndex />
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
