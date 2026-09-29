"use client";

import Image from "next/image";
import { useState } from "react";
import { ModelViewer } from "@/components/model-viewer";

/** Overview visual: profile section and, when a BIM model exists, an interactive 3D view. */
export function SystemVisual({ name, cut, model }: { name: string; cut: string | null; model: string | null }) {
  const [view, setView] = useState<"3d" | "cut">(model ? "3d" : "cut");
  const tabs = [...(model ? [{ k: "3d" as const, t: "3D model" }] : []), ...(cut ? [{ k: "cut" as const, t: "Section" }] : [])];

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded-lg bg-panel lg:max-w-none">
      {view === "3d" && model ? (
        <ModelViewer src={model} alt={`${name} 3D model`} orbit="-32deg 80deg auto" />
      ) : (
        cut && <Image src={cut} alt={`${name} profile section`} fill className="object-contain p-8 mix-blend-multiply" sizes="(max-width:1024px) 90vw, 560px" />
      )}

      {tabs.length > 1 && (
        <div className="absolute left-4 top-4 flex gap-1 rounded-lg bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.k}
              type="button"
              onClick={() => setView(tab.k)}
              className={`h-8 rounded-md px-3 text-[13px] transition-colors ${view === tab.k ? "bg-char text-white" : "text-slate hover:text-char"}`}
            >
              {tab.t}
            </button>
          ))}
        </div>
      )}
      {view === "3d" && model && <p className="pointer-events-none absolute bottom-4 left-4 text-[13px] text-mute">Drag to rotate · scroll to zoom</p>}
    </div>
  );
}
