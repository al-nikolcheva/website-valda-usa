"use client";

import dynamic from "next/dynamic";

export type { IsoKind } from "./scenes";

/**
 * Lazy, client-only isometric product scene. three.js lives in its own chunk
 * and is only fetched when a scene is actually rendered.
 * Parent must be `relative` with a set size (the scene fills it).
 */
export const IsoScene = dynamic(() => import("./iso-scene").then((m) => m.IsoScene), {
  ssr: false,
  loading: () => <div className="absolute inset-0" aria-hidden />,
});
