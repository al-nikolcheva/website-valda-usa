"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/primitives";
import { PROJECTS } from "@/lib/projects";

export function ProjectsScroll() {
  const scroller = useRef<HTMLDivElement>(null);
  const items = PROJECTS.slice(0, 6);

  const scrollBy = (dir: number) => {
    if (scroller.current) {
      const amount = Math.min(560, scroller.current.clientWidth * 0.7);
      scroller.current.scrollBy({ left: dir * amount, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="caption text-slate"><span className="text-blue-bright">/</span> 05 — Selected work</p>
            <h2 className="mt-4 headline text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05] text-ink">Our projects</h2>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/projects" className="mr-2 text-[13px] font-medium text-blue underline-offset-4 hover:underline">All projects</Link>
            <button onClick={() => scrollBy(-1)} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/40 hover:bg-ink hover:text-white">
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/40 hover:bg-ink hover:text-white">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Container>

      <div
        ref={scroller}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-clip overscroll-x-contain px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p, i) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="group relative block aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[52vw] md:w-[40vw] lg:w-[30vw]"
          >
            <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]" sizes="(max-width:768px) 80vw, 32vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ArrowUpRight size={18} />
            </div>
            <div className="absolute bottom-0 left-0 w-full p-7">
              <p className="caption text-white/70">{String(i + 1).padStart(2, "0")} · {p.market}</p>
              <h3 className="mt-2 headline text-2xl text-white md:text-3xl">{p.name}</h3>
              <p className="mt-1 text-[14px] text-white/75">{p.location}</p>
            </div>
          </Link>
        ))}
      </div>

      <Container className="mt-8 md:hidden">
        <Link href="/projects" className="text-[13px] font-medium text-blue underline-offset-4">All projects</Link>
      </Container>
    </section>
  );
}
