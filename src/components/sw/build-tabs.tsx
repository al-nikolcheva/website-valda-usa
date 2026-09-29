"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IsoScene, type IsoKind } from "@/components/iso";

/* ── Config ─────────────────────────────────────────────────── */
const INTRO = "Aluminum and PVC systems, engineered to your openings, your performance targets and your finishes.";
// `img` (profile cutaway) is kept for later use; the panel now shows an animated iso scene (`iso`).
const FAMILIES: { name: string; img: string; iso: IsoKind; href: string; desc: string }[] = [
  { name: "Windows", img: "/products/masterline-8.png", iso: "windows", href: "/products/windows", desc: "Tilt and turn, casement and fixed, with slim sightlines and high thermal performance." },
  { name: "Doors", img: "/products/conceptsystem-77.png", iso: "doors",href: "/products/doors", desc: "Entrance, terrace and patio doors that stay tight and true for decades." },
  { name: "Sliding & Folding", img: "/products/conceptpatio-155.png", iso: "sliding",href: "/products/sliding", desc: "Lift and slide, minimal-frame and bi-fold systems for wide, open spans." },
  { name: "Facades", img: "/products/conceptwall-50.png", iso: "facades",href: "/products/facades", desc: "Curtain wall and window wall for larger building envelopes." },
];
/* ───────────────────────────────────────────────────────────── */

export function BuildTabs() {
  const [active, setActive] = useState(0);
  const f = FAMILIES[active];

  return (
    <div className="grid gap-10 rounded-lg bg-panel p-6 md:grid-cols-[0.85fr_1.15fr] md:gap-6 md:p-12">
      {/* list */}
      <div className="flex flex-col justify-between gap-12">
        <p className="max-w-sm text-[16px] font-medium leading-6 text-char">{INTRO}</p>

        <div>
          <ul>
            {FAMILIES.map((x, i) => (
              <li key={x.name}>
                <button
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "sw-h py-1.5 text-left text-[clamp(1.8rem,2.6vw,2rem)] transition-colors duration-300",
                    i === active ? "text-char" : "text-mute hover:text-char/70",
                  )}
                >
                  {x.name}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 min-h-[48px] max-w-sm text-[15px] leading-6 text-char/70">{f.desc}</p>
          <Link href={f.href} className="mt-4 inline-flex items-center gap-2 text-[14px] text-char underline-offset-4 hover:text-blue hover:underline">
            View {f.name.toLowerCase()} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* animated isometric scene — only the active family is mounted (one WebGL context at a time) */}
      <div className="relative aspect-[4/3] w-full md:aspect-auto md:min-h-[520px]">
        <IsoScene key={f.iso} kind={f.iso} />
      </div>
    </div>
  );
}
