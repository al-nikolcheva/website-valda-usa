import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Marquee } from "@/components/marquee";
import { PROJECTS } from "@/lib/projects";

/**
 * Full-bleed auto-scrolling gallery of large image cards with caption overlays.
 * Reuses the project imagery; each card links to its project.
 */
export function GalleryMarquee({ durationSec = 65 }: { durationSec?: number }) {
  return (
    <div className="[--marquee-fade:var(--color-pure)]">
      <Marquee durationSec={durationSec}>
        {PROJECTS.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="group relative mr-4 block h-[360px] w-[280px] shrink-0 overflow-hidden rounded-2xl md:mr-5 md:h-[440px] md:w-[340px]"
          >
            <Image
              src={p.img}
              alt={p.name}
              fill
              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              sizes="340px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" />
            <ArrowUpRight size={18} className="absolute right-4 top-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="caption text-white/70">{p.market}</p>
              <h3 className="mt-1 headline text-xl text-white">{p.name}</h3>
              <p className="mt-0.5 text-[13px] text-white/70">{p.location}</p>
            </div>
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
