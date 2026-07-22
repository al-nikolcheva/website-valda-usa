"use client";

import { useState } from "react";
import { type System, systemTech, systemHolder } from "@/lib/systems";

const STANDARDS_IMPACT = [
  "AAMA/WDMA/CSA 101/I.S.2/A440",
  "ASTM E1886 — Impact (large missile)",
  "ASTM E1996 — Wind-borne debris",
  "TAS 201 — Large missile impact",
  "TAS 203 — Cyclic pressure",
  "ASTM E283 / E330 / E331 — Air · structural · water",
];
const STANDARDS_NONIMPACT = [
  "AAMA/WDMA/CSA 101/I.S.2/A440",
  "ASTM E283 — Air infiltration",
  "ASTM E330 — Structural load",
  "ASTM E331 — Water penetration",
];

export function ProductTabs({ system }: { system: System }) {
  const tabs = ["Overview", "Specifications", "Performance", "Certifications"] as const;
  const [active, setActive] = useState<(typeof tabs)[number]>("Overview");

  const impactCfgs = system.approvals.filter((a) => a.impact !== "Non-Impact");
  const nonImpactCfgs = system.approvals.filter((a) => a.impact === "Non-Impact");
  const hasBoth = impactCfgs.length > 0 && nonImpactCfgs.length > 0;
  const [mode, setMode] = useState<"impact" | "nonimpact">(impactCfgs.length ? "impact" : "nonimpact");

  const perfList = !hasBoth ? system.approvals : mode === "impact" ? impactCfgs : nonImpactCfgs;
  const showImpactData = hasBoth ? mode === "impact" : impactCfgs.length > 0;
  const dp = perfList.find((a) => a.dp)?.dp ?? "See drawing";
  const maxSize = perfList.find((a) => a.max)?.max ?? "See drawing";
  const tech = systemTech(system);

  return (
    <div>
      {/* tab bar + HVHZ toggle */}
      <div className="flex flex-col gap-4 border-b border-mist md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`relative -mb-px pb-4 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                active === t ? "text-ink" : "text-slate hover:text-ink"
              }`}
            >
              {t}
              {active === t && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-blue" />}
            </button>
          ))}
        </div>

        {system.hvhz !== "No" &&
          (hasBoth ? (
            <div className="mb-3 inline-flex rounded-full border border-mist p-0.5 text-[12px] font-medium">
              <button
                onClick={() => {
                  setMode("impact");
                  setActive("Performance");
                }}
                className={`rounded-full px-3.5 py-1.5 transition-colors ${mode === "impact" ? "bg-blue text-white" : "text-slate hover:text-ink"}`}
              >
                HVHZ · Impact
              </button>
              <button
                onClick={() => {
                  setMode("nonimpact");
                  setActive("Performance");
                }}
                className={`rounded-full px-3.5 py-1.5 transition-colors ${mode === "nonimpact" ? "bg-blue text-white" : "text-slate hover:text-ink"}`}
              >
                Non-impact
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActive("Performance")}
              className="mb-3 inline-flex items-center gap-1.5 self-start rounded-full bg-blue/10 px-3.5 py-1.5 text-[12px] font-medium text-blue transition-colors hover:bg-blue/15"
            >
              View HVHZ / impact performance
            </button>
          ))}
      </div>

      <div className="pt-8">
        {active === "Overview" && (
          <div className="grid gap-x-12 gap-y-3 sm:grid-cols-2">
            <p className="sm:col-span-2 max-w-2xl text-[15px] leading-relaxed text-slate">{system.summary}</p>
            <Row k="Material" v={system.material} />
            <Row k="Profile" v={system.profile} />
            <Row k="Impact rating" v={system.impact} />
            <Row k="HVHZ" v={system.hvhz === "No" ? "Outside HVHZ" : "Approved"} />
            <Row k="Categories" v={system.categories.join(", ")} />
            <Row k="Configurations" v={`${system.approvals.length} FL-approved`} />
          </div>
        )}

        {active === "Specifications" && (
          <div className="grid gap-x-12 gap-y-3 sm:grid-cols-2">
            {tech.map((row) => (
              <Row key={row.label} k={row.label} v={row.value} />
            ))}
          </div>
        )}

        {active === "Performance" && (
          <div>
            {system.hvhz !== "No" && (
              <p className="mb-5 text-[13px] text-slate">
                Showing{" "}
                <span className="font-medium text-ink">
                  {showImpactData ? "impact / HVHZ" : "non-impact"}
                </span>{" "}
                configurations — design pressure to {dp}, max size {maxSize}.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left font-mono text-[10px] uppercase tracking-[0.1em] text-slate">
                    <th className="border-b border-mist py-3 pr-4 font-medium">Configuration</th>
                    <th className="border-b border-mist py-3 pr-4 font-medium">Impact</th>
                    <th className="border-b border-mist py-3 pr-4 font-medium">Design pressure</th>
                    <th className="border-b border-mist py-3 font-medium">Max size</th>
                  </tr>
                </thead>
                <tbody>
                  {perfList.map((a, i) => (
                    <tr key={i}>
                      <td className="border-b border-mist py-3 pr-4">{a.config}</td>
                      <td className="border-b border-mist py-3 pr-4 text-slate">{a.impact}</td>
                      <td className="border-b border-mist py-3 pr-4 font-mono text-xs">{a.dp ?? "See drawing"}</td>
                      <td className="border-b border-mist py-3 font-mono text-xs">{a.max ?? "See drawing"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {active === "Certifications" && (
          <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">
                Florida Product Approvals — held by {systemHolder(system)}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {[...new Map(system.approvals.map((a) => [a.fl, a])).values()].map((a, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-4 border-b border-mist pb-2">
                    <span className="text-[14px]">{a.impact === "Non-Impact" ? "Non-impact configurations" : "Impact / HVHZ configurations"}</span>
                    <span className="font-mono text-xs text-blue">{a.fl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">Tested to</p>
              <ul className="mt-3 space-y-2">
                {(showImpactData ? STANDARDS_IMPACT : STANDARDS_NONIMPACT).map((st) => (
                  <li key={st} className="text-[14px] text-slate">{st}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-mist py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-slate">{k}</span>
      <span className="text-right text-[14px]">{v}</span>
    </div>
  );
}
