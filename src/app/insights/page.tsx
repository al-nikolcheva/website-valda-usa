import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";

export const metadata: Metadata = { title: "Insights" };

const POSTS = [
  { cat: "Technical", title: "What HVHZ large missile testing actually involves", img: "/images/hero.jpg", date: "Jun 2026" },
  { cat: "Project showcase", title: "Inside the Mona Residence facade package", img: "/images/project-mona-1.jpg", date: "May 2026" },
  { cat: "Factory to site", title: "From the Sofia line to a Florida opening in 14 weeks", img: "/images/project-milwaukee-1.jpg", date: "May 2026" },
  { cat: "Technical", title: "Reading an FL Product Approval: the five numbers that matter", img: "/images/arch-3.jpg", date: "Apr 2026" },
  { cat: "Market", title: "Why factory-direct pricing changes the pro forma", img: "/images/arch-1.jpg", date: "Apr 2026" },
  { cat: "Sustainability", title: "Solar energy at our European facilities", img: "/images/project-twins-1.jpg", date: "Mar 2026" },
];

export default function InsightsPage() {
  return (
    <PinnedHero
      eyebrow="Insights"
      title="Field notes from the factory."
      intro="Technical education, project showcases, and what we are seeing in the US market."
      image="/images/arch-4.jpg"
    >
      <section className="py-20 md:py-28">
        <Container>
          <SectionHead label="Latest" title="What we are writing about." />
          <div className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-3">
            {POSTS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.08}>
                <Link href="/insights" className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image src={p.img} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-bright">{p.cat} · {p.date}</p>
                  <h2 className="mt-2 headline text-xl leading-snug tracking-[-0.01em]">{p.title}</h2>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
