"use client";

import dynamic from "next/dynamic";

export type { TestKind } from "./scenes";

/** Client-only isometric test animation; three.js loads in its own chunk. */
export const TestStage = dynamic(() => import("./test-stage").then((m) => m.TestStage), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg bg-panel p-4 md:p-6" aria-hidden>
      <div className="aspect-[4/3] w-full md:aspect-[16/9]" />
      <div className="mt-4 h-8" />
    </div>
  ),
});
