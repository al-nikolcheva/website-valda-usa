import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Download } from "lucide-react";
import { Container } from "@/components/primitives";
import { CatalogueFlipbook } from "@/components/catalogue-flipbook";

// Both catalogues, shown as a clear switcher so customers see each one.
const CATALOGUES = [
  { dir: "main", href: "/catalogue", label: "Catalogue" },
  { dir: "technical", href: "/catalogue/technical", label: "Technical catalogue" },
];

/** Page images for a catalogue, read from /public/catalogue/<dir>. */
export function catalogueImages(dir: string): string[] {
  try {
    const abs = path.join(process.cwd(), "public", "catalogue", dir);
    return fs
      .readdirSync(abs)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map((f) => `/catalogue/${dir}/${f}`);
  } catch {
    return [];
  }
}

function pdfSize(pub: string): string | null {
  try {
    const mb = fs.statSync(path.join(process.cwd(), "public", pub)).size / 1_048_576;
    return `${mb.toFixed(0)} MB`;
  } catch {
    return null;
  }
}

export function CatalogueView({
  eyebrow,
  tag,
  title,
  intro,
  dir,
  pdf,
}: {
  eyebrow: string;
  tag: string;
  title: string;
  intro: string;
  dir: string;
  pdf: string;
  alt?: { href: string; label: string };
}) {
  const pages = catalogueImages(dir);
  const size = pdfSize(pdf);

  return (
    <section className="min-h-screen bg-white pb-28 pt-28 md:pb-36 md:pt-36">
      <Container>
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] leading-[22px] text-mute">{eyebrow}</p>
          <p className="text-[14px] leading-[22px] text-mute">/{tag}</p>
        </div>
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-16">
          <div>
            <h1 className="sw-h text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[1.06] text-char">{title}</h1>
            <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">{intro}</p>
          </div>
          <a
            href={pdf}
            download
            className="inline-flex h-[52px] shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-char px-5 text-[14px] leading-[22px] text-white transition-colors duration-300 hover:bg-black md:self-auto"
          >
            <Download size={16} /> Download PDF {size && <span className="text-white/55">{size}</span>}
          </a>
        </div>

        {/* which catalogue: both shown, clearly titled */}
        <div className="mt-12 inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg bg-panel p-1">
          {CATALOGUES.map((c) => {
            const active = c.dir === dir;
            return (
              <Link
                key={c.dir}
                href={c.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center rounded-md px-4 text-[14px] transition-colors duration-300 ${active ? "bg-char text-white" : "text-slate hover:text-char"}`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg bg-panel px-3 py-6 md:px-10 md:py-12">
          {pages.length > 0 ? (
            <CatalogueFlipbook pages={pages} />
          ) : (
            <div className="px-8 py-20 text-center text-[16px] leading-6 text-slate">This catalogue is being prepared.</div>
          )}
        </div>
      </Container>
    </section>
  );
}
