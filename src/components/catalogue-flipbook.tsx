"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

// react-pageflip touches `document` on mount, so keep it out of SSR.
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-mist" />,
});

export function CatalogueFlipbook({ pages }: { pages: string[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [fs, setFs] = useState(false);
  const total = pages.length;

  const flip = useCallback((dir: "prev" | "next") => {
    const api = book.current?.pageFlip?.();
    if (!api) return;
    dir === "prev" ? api.flipPrev() : api.flipNext();
  }, []);

  const controls = useMemo(
    () => (
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => flip("prev")}
          disabled={page <= 0}
          aria-label="Previous page"
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-[92px] text-center font-mono text-[11px] uppercase tracking-[0.14em] text-slate">
          Page {Math.min(page + 1, total)} / {total}
        </span>
        <button
          type="button"
          onClick={() => flip("next")}
          disabled={page >= total - 1}
          aria-label="Next page"
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    ),
    [flip, page, total],
  );

  return (
    <div className={fs ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 p-4 backdrop-blur md:p-10" : ""}>
      <div className="w-full max-w-[1040px]">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFs((v) => !v)}
            className={`mb-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${fs ? "text-white/70 hover:text-white" : "text-slate hover:text-ink"}`}
          >
            {fs ? <><Minimize2 size={13} /> Close</> : <><Maximize2 size={13} /> Full screen</>}
          </button>
        </div>

        <div className="select-none">
          {/* @ts-expect-error react-pageflip's types don't model children/ref cleanly */}
          <HTMLFlipBook
            width={1000}
            height={562}
            size="stretch"
            /* minWidth > half the container (max-w 1040) forces single-page
               (portrait) at every width — the pages are already landscape 16:9.
               In portrait the page width follows the parent, so this never
               overflows on mobile. */
            minWidth={700}
            maxWidth={1040}
            minHeight={394}
            maxHeight={585}
            maxShadowOpacity={0.4}
            drawShadow
            showCover={false}
            usePortrait
            mobileScrollSupport
            flippingTime={700}
            className="mx-auto"
            style={{}}
            ref={book}
            onFlip={(e: { data: number }) => setPage(e.data)}
          >
            {pages.map((src, i) => (
              <div key={i} className="overflow-hidden bg-white shadow-[0_0_1px_rgba(0,0,0,0.2)]">
                {/* plain img — react-pageflip clones/measures children directly */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Catalogue page ${i + 1}`} className="block h-full w-full object-contain" draggable={false} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {controls}
        <p className={`mt-3 text-center text-[12px] ${fs ? "text-white/50" : "text-slate/70"}`}>Drag a corner or use the arrows to turn the page.</p>
      </div>
    </div>
  );
}
