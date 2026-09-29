"use client";

import { useState } from "react";
import Image from "next/image";
import { PenLine, Ruler, Factory, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Config ─────────────────────────────────────────────────── */
const STEPS = [
  { t: "Share", Icon: PenLine, img: "/images/home-modern-pool.webp", d: "Send drawings, an opening schedule and performance targets, at any stage of the project." },
  { t: "Engineer", Icon: Ruler, img: "/images/engineer-drawings.webp", d: "We match the right systems to your wind zone and budget, then send a clear quote in USD." },
  { t: "Manufacture", Icon: Factory, img: "/images/manufacturing.webp", d: "Built in-house in our own European factories, tested and certified for the US market." },
  { t: "Deliver", Icon: Truck, img: "/images/deliver-loading.webp", d: "Export packaging, ocean freight, US customs and final delivery, all the way to your jobsite." },
];
/* ───────────────────────────────────────────────────────────── */

export function ProcessCards() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3 md:h-[480px] md:flex-row">
      {STEPS.map(({ t, Icon, img, d }, i) => {
        const on = i === active;
        return (
          <button
            key={t}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            aria-expanded={on}
            className={cn(
              "group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-lg p-6 text-left transition-[flex-grow,background-color] duration-500 ease-out md:min-h-0",
              on ? "bg-char md:flex-[2.2]" : "bg-panel md:flex-1",
            )}
          >
            {/* photo (active only) */}
            <div className={cn("absolute inset-0 transition-opacity duration-500", on ? "opacity-100" : "opacity-0")}>
              <Image src={img} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
            </div>

            <div className="relative flex items-start justify-between">
              <span className={cn("text-[14px]", on ? "text-white/80" : "text-mute")}>Step /{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-md", "bg-white text-char")}>
                <Icon size={17} />
              </span>
            </div>

            <div className="relative">
              <h3 className={cn("sw-h text-[32px]", on ? "text-white" : "text-char")}>{t}</h3>
              <p className={cn("mt-2 max-w-sm text-[14px] leading-[22px]", on ? "text-white/85" : "text-char/60")}>{d}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
