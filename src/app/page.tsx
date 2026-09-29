import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { HomeHero } from "@/components/home-hero";
import { ShipJourney } from "@/components/ship/journey";
import { SwHead } from "@/components/sw/head";
import { ProjectsCarousel } from "@/components/sw/projects-carousel";
import { BuildTabs } from "@/components/sw/build-tabs";
import { ProcessCards } from "@/components/sw/process-cards";
import { SwFaq } from "@/components/sw/faq";
import { FAQS } from "@/lib/faqs";
import { AboutSection } from "@/components/sw/about-section";
import { CertMarquee } from "@/components/sw/cert-marquee";

export const metadata: Metadata = pageMeta({
  // Root page shares the layout segment, so the title template does not apply here.
  title: "European Windows, Doors & Facades for the USA | VALDA",
  description:
    "Family-owned European maker of aluminum and PVC windows, doors and facades, with hurricane impact systems and Florida Product Approval. Shipped to the USA.",
  path: "/",
});


function Wide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-5 md:px-10 ${className}`}>{children}</div>;
}

export default function Home() {
  return (
    <>
      <HomeHero />
      <CertMarquee />

      {/* ── /01 ABOUT ──────────────────────────────────── */}
      <AboutSection n="01" />

      {/* ── /02 FROM BULGARIA TO THE USA (3D journey) ───── */}
      <ShipJourney n="02" />

      {/* ── /03 WHAT WE BUILD ────────────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Wide>
          <SwHead label="Products" n="03" title="What We Build" />
          <div className="mt-14 md:mt-20">
            <BuildTabs />
          </div>
        </Wide>
      </section>

      {/* ── /04 PROJECTS ─────────────────────────────────── */}
      <ProjectsCarousel n="04" />

      {/* ── /05 PROCESS ──────────────────────────────────── */}
      <section className="bg-white py-28 md:py-36">
        <Wide>
          <SwHead label="Process" n="05" title="From Drawing to Delivery" />
          <div className="mt-14 md:mt-20">
            <ProcessCards />
          </div>
        </Wide>
      </section>

      {/* ── /06 FAQ ──────────────────────────────────────── */}
      <section className="bg-panel py-28 md:py-36">
        <Wide>
          <SwHead label="FAQ" n="06" layout="stacked" title="Before We Begin" />
          <div className="mt-14">
            <SwFaq items={FAQS.slice(0, 6)} />
          </div>
        </Wide>
      </section>
    </>
  );
}
