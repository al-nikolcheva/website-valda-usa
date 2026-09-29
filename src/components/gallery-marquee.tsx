import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Marquee } from "@/components/marquee";
import { PROJECTS } from "@/lib/projects";

/**
 * Full-bleed auto-scrolling gallery of rounded photo cards with a small white
 * info card (Scandiwest). Reuses the project imagery; each card links to its project.
 */
export function GalleryMarquee({ durationSec = 65 }: { durationSec?: number }) {
  return (
    <div className="[--marquee-fade:var(--color-pure)]">
      <Marquee durationSec={durationSec}>
        {PROJECTS.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="group relative mr-3 block h-[380px] w-[280px] shrink-0 overflow-hidden rounded-lg md:mr-4 md:h-[460px] md:w-[340px]"
          >
            <Image
              src={p.img}
              alt={p.name}
              fill
              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              sizes="340px"
            />
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-char text-white transition-colors duration-300 group-hover:bg-blue">
              <ArrowUpRight size={16} />
            </span>
            <div className="absolute inset-x-3 bottom-3 rounded-lg bg-white p-4">
              <span className="inline-block rounded-md bg-panel px-2 py-0.5 text-[12px] text-char">{p.market}</span>
              <h3 className="sw-h mt-3 text-[20px] text-char">{p.name}</h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-[14px] text-char/80">
                <MapPin size={14} className="text-mute" /> {p.location}
              </p>
            </div>
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
