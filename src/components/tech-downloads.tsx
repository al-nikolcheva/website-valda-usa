"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";

export type TechDoc = { key: string; label: string; kind: string; desc: string; href: string; size: string };

/** Collapsible list of a system's technical files, styled like the spec groups. */
export function TechDownloads({ docs }: { docs: TechDoc[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="group flex w-full items-baseline justify-between gap-6 text-left">
        <h3 className="sw-h text-[28px] text-char md:text-[32px]">
          Technical downloads <span className="text-mute">/{String(docs.length).padStart(2, "0")}</span>
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] text-char transition-colors group-hover:text-blue">
          {open ? "Hide" : `Show all ${docs.length}`}
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <ul className="mt-6 border-t border-char/10">
          {docs.map((d) => (
            <li key={d.key} className="border-b border-char/10">
              <a href={d.href} download className="group flex items-center gap-4 py-4 transition-colors hover:bg-char/[0.03]">
                <span className="w-12 shrink-0 rounded-md bg-white px-2 py-0.5 text-center text-[12px] text-char">{d.kind}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] leading-[22px] text-char">{d.label}</span>
                  <span className="block text-[14px] leading-[22px] text-mute">{d.desc}</span>
                </span>
                <span className="hidden shrink-0 text-[14px] tabular-nums text-mute sm:block">{d.size}</span>
                <Download size={16} className="mr-2 shrink-0 text-char transition-colors group-hover:text-blue" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
