"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

// react-pageflip touches `document` on mount, so keep it out of SSR.
const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => <div className="aspect-[16/9] w-full animate-pulse rounded-lg bg-white" />,
});

export function CatalogueFlipbook({ pages }: { pages: string[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const book = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [fs, setFs] = useState(false);
  const total = pages.length;
  // The book's width comes from its container. minWidth must stay above half the container
  // (forces single-page view) but below the container itself, or it overflows on phones.
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width / 40) * 40));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const minW = Math.max(200, Math.ceil(w * 0.55));

  const flip = useCallback((dir: "prev" | "next") => {
    const api = book.current?.pageFlip?.();
    if (!api) return;
    if (dir === "prev") api.flipPrev();
    else api.flipNext();
  }, []);

  const controls = useMemo(
    () => (
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => flip("prev")}
          disabled={page <= 0}
          aria-label="Previous page"
          className={`grid h-11 w-11 place-items-center rounded-md transition-colors duration-300 disabled:pointer-events-none disabled:opacity-30 ${fs ? "bg-white text-char hover:bg-white/85" : "bg-char text-white hover:bg-blue"}`}
        >
          <ChevronLeft size={18} />
        </button>
        <span className={`min-w-[92px] text-center text-[14px] leading-[22px] tabular-nums ${fs ? "text-white/70" : "text-mute"}`}>
          Page {Math.min(page + 1, total)} / {total}
        </span>
        <button
          type="button"
          onClick={() => flip("next")}
          disabled={page >= total - 1}
          aria-label="Next page"
          className={`grid h-11 w-11 place-items-center rounded-md transition-colors duration-300 disabled:pointer-events-none disabled:opacity-30 ${fs ? "bg-white text-char hover:bg-white/85" : "bg-char text-white hover:bg-blue"}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    ),
    [flip, page, total, fs],
  );

  return (
    <div className={fs ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-char/95 p-4 backdrop-blur md:p-10" : ""}>
      <div className="w-full max-w-[1040px]">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFs((v) => !v)}
            className={`mb-3 inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[14px] leading-[22px] transition-colors duration-300 ${fs ? "bg-white/10 text-white hover:bg-white hover:text-char" : "bg-white text-char hover:text-blue"}`}
          >
            {fs ? <><Minimize2 size={13} /> Close</> : <><Maximize2 size={13} /> Full screen</>}
          </button>
        </div>

        <div ref={wrap} className="select-none">
          {w > 0 && (
            <>
          {/* @ts-expect-error react-pageflip's types don't model children/ref cleanly */}
          <HTMLFlipBook
            key={w}
            width={1000}
            height={562}
            size="stretch"
            minWidth={minW}
            maxWidth={1040}
            minHeight={Math.round(minW * 0.5625)}
            startPage={page}
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
            </>
          )}
        </div>

        {controls}
        <p className={`mt-3 text-center text-[14px] leading-[22px] ${fs ? "text-white/50" : "text-mute"}`}>Drag a corner or use the arrows to turn the page.</p>
      </div>
    </div>
  );
}
