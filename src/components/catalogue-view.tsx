import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Container } from "@/components/primitives";
import { CatalogueFlipbook } from "@/components/catalogue-flipbook";

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
  alt,
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
    <section className="min-h-screen bg-paper pb-24 pt-28 md:pt-32">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-slate">
              <span className="tabular-nums text-blue-bright">{tag}</span>
              <span className="h-px w-8 bg-slate/30" /> {eyebrow}
            </p>
            <h1 className="mt-6 headline text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.0] tracking-[-0.025em] text-ink">{title}</h1>
            <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-slate">{intro}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <a
              href={pdf}
              download
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-blue"
            >
              <Download size={16} /> Download PDF {size && <span className="font-mono text-[11px] text-white/60">{size}</span>}
            </a>
            {alt && (
              <Link href={alt.href} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-slate transition-colors hover:text-ink">
                {alt.label} <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-14">
          {pages.length > 0 ? (
            <CatalogueFlipbook pages={pages} />
          ) : (
            <div className="rounded-2xl border border-mist bg-pure px-8 py-20 text-center text-[15px] text-slate">This catalogue is being prepared.</div>
          )}
        </div>
      </Container>
    </section>
  );
}
