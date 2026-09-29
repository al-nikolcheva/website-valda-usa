"use client";

import { createElement, useEffect, useState } from "react";

/**
 * Interactive 3D model viewer (Google <model-viewer>). Drag to rotate, scroll to
 * zoom, auto-rotates when idle. The library is loaded client-side only.
 * `src`/`alt` are set as attributes via a ref because model-viewer observes the
 * `src` attribute (React would otherwise set it as a property that doesn't load).
 */
export function ModelViewer({ src, alt, orbit }: { src: string; alt: string; orbit?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    import("@google/model-viewer").then(() => mounted && setReady(true));
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate">Loading 3D model…</span>
      </div>
    );
  }

  return createElement("model-viewer", {
    ref: (el: HTMLElement | null) => {
      if (el) {
        el.setAttribute("src", src);
        el.setAttribute("alt", alt);
      }
    },
    "camera-controls": true,
    ...(orbit ? { "camera-orbit": orbit } : {}),
    "auto-rotate": !orbit,
    "auto-rotate-delay": 400,
    "rotation-per-second": "22deg",
    "interaction-prompt": "none",
    "shadow-intensity": "0.55",
    "shadow-softness": "1",
    exposure: "1.05",
    "environment-image": "neutral",
    "touch-action": "pan-y",
    style: { width: "100%", height: "100%", backgroundColor: "transparent" },
  });
}
