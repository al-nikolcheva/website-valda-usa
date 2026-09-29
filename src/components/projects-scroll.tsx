"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/primitives";
import { PROJECTS } from "@/lib/projects";

export function ProjectsScroll({ dark = false, n }: { dark?: boolean; n?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const items = PROJECTS.slice(0, 6);

  const scrollBy = (dir: number) => {
    if (scroller.current) {
      const amount = Math.min(560, scroller.current.clientWidth * 0.7);
      scroller.current.scrollBy({ left: dir * amount, behavior: "smooth" });
    }
  };

  // Pointer-drag to move the track. The container is overflow-hidden (not a native
  // scroller) so the mouse wheel is never captured here — vertical scroll always
  // passes through to the page. touch-action: pan-y keeps vertical touch scrolling
  // the page while horizontal swipes drag the track.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) {
      drag.current.moved = true;
      el.setPointerCapture?.(e.pointerId);
    }
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    scroller.current?.releasePointerCapture?.(e.pointerId);
  };
  // Suppress the click that follows a drag so it doesn't navigate to the project.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section className={dark ? "bg-ink py-24 md:py-32" : "bg-white py-24 md:py-32"}>
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className={`flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] ${dark ? "text-white/60" : "text-slate"}`}>
              {n && <span className="tabular-nums text-blue-bright">{n}</span>} Selected work
            </p>
            <h2 className={`mt-6 headline text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.08] ${dark ? "text-white" : "text-ink"}`}>Our projects</h2>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/projects" className={`mr-2 text-[13px] font-medium underline-offset-4 hover:underline ${dark ? "text-white" : "text-blue"}`}>All projects</Link>
            <button onClick={() => scrollBy(-1)} aria-label="Previous" className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${dark ? "border-white/30 text-white hover:border-white hover:bg-white hover:text-blue" : "border-ink/15 text-ink hover:border-ink/40 hover:bg-ink hover:text-white"}`}>
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Next" className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${dark ? "border-white/30 text-white hover:border-white hover:bg-white hover:text-blue" : "border-ink/15 text-ink hover:border-ink/40 hover:bg-ink hover:text-white"}`}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Container>

      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className="mt-12 flex cursor-grab touch-pan-y snap-x snap-mandatory select-none gap-5 overflow-hidden px-6 pb-4 active:cursor-grabbing md:gap-6 md:px-10"
      >
        {items.map((p, i) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="group relative block aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[52vw] md:w-[40vw] lg:w-[30vw]"
          >
            <Image src={p.img} alt={p.name} fill draggable={false} className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]" sizes="(max-width:768px) 80vw, 32vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-7">
              <div>
                <p className="caption text-white/70">{String(i + 1).padStart(2, "0")} · {p.market}</p>
                <h3 className="mt-2 headline text-2xl text-white md:text-3xl">{p.name}</h3>
                <p className="mt-1 text-[14px] text-white/75">{p.location}</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white group-hover:text-ink">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Container className="mt-8 md:hidden">
        <Link href="/projects" className={`text-[13px] font-medium underline-offset-4 ${dark ? "text-white" : "text-blue"}`}>All projects</Link>
      </Container>
    </section>
  );
}
