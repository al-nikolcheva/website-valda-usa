import Image from "next/image";
import Link from "next/link";
import { MapPin, LayoutGrid } from "lucide-react";
import { PROJECTS } from "@/lib/projects";
import { SwHead } from "@/components/sw/head";
import { SwButton } from "@/components/sw/button";

// Projects shown as stacked slides (edit the order here).
const SLUGS = ["juneau-village", "mona-residence", "austin-residence", "new-york-residence"];

export function ProjectsStack() {
  const items = SLUGS.map((s) => PROJECTS.find((p) => p.slug === s)).filter((p): p is (typeof PROJECTS)[number] => !!p);

  return (
    <section className="px-2 md:px-4">
      <div className="rounded-lg bg-char px-3 pb-3 pt-20 md:px-6 md:pb-6 md:pt-28">
        <div className="mx-auto max-w-[1360px] px-2 md:px-4">
          <SwHead label="Projects" n="02" title="Buildings We’ve Glazed" dark />
        </div>

        <div className="mx-auto mt-14 max-w-[1360px] md:mt-20">
          {items.map((p, i) => (
            <article
              key={p.slug}
              className="sticky top-3 mb-4 h-[78svh] min-h-[520px] overflow-hidden rounded-lg md:top-6 md:mb-6"
              style={{ zIndex: i + 1 }}
            >
              <Link href={`/projects/${p.slug}`} aria-label={p.name} className="absolute inset-0">
                <Image src={p.img} alt={`${p.name}, ${p.location}`} fill className="object-cover" sizes="(max-width:768px) 100vw, 1360px" />
              </Link>

              {/* info card */}
              <div className="absolute bottom-3 left-3 w-[min(calc(100%-24px),340px)] rounded-lg bg-white p-6 md:bottom-6 md:left-6 md:p-7">
                <span className="inline-block rounded-md bg-panel px-2 py-0.5 text-[12px] text-char">Completed {p.year}</span>
                <h3 className="sw-h mt-5 text-[28px] text-char md:text-[32px]">{p.name}</h3>
                <p className="mt-4 flex items-center gap-2 text-[14px] text-char/80">
                  <MapPin size={15} className="text-mute" /> {p.location}
                </p>
                <p className="mt-2 flex items-start gap-2 text-[14px] text-char/80">
                  <LayoutGrid size={15} className="mt-[3px] shrink-0 text-mute" /> {p.systems}
                </p>
                <SwButton href="/contact" className="mt-7 w-full">Start a project</SwButton>
              </div>

              {/* thumbnail strip (only when the project has more images) */}
              {p.gallery.length > 1 && (
                <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-2 md:right-6 md:flex">
                  {p.gallery.slice(0, 3).map((g) => (
                    <div key={g} className="relative h-[67px] w-[114px] overflow-hidden rounded-lg ring-2 ring-white/80">
                      <Image src={g} alt="" fill className="object-cover" sizes="114px" />
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
