"use client";

import { useState } from "react";
import { type System, systemHolder, systemSpecs } from "@/lib/systems";

/**
 * Client-facing performance + approvals block. Deliberately trimmed: specifiers
 * care about design pressure & max size per opening (with its FL number), and the
 * handful of standards that actually mean something — not every certification code.
 */
export function ProductTabs({ system }: { system: System }) {
  const impactCfgs = system.approvals.filter((a) => a.impact !== "Non-Impact");
  const nonImpactCfgs = system.approvals.filter((a) => a.impact === "Non-Impact");
  const hasBoth = impactCfgs.length > 0 && nonImpactCfgs.length > 0;
  const [mode, setMode] = useState<"impact" | "nonimpact">(impactCfgs.length ? "impact" : "nonimpact");

  const rows = !hasBoth ? system.approvals : mode === "impact" ? impactCfgs : nonImpactCfgs;
  const showImpact = hasBoth ? mode === "impact" : impactCfgs.length > 0;

  const specs = systemSpecs(system.slug);
  const hasCapability = specs.some((r) => r.label === "Manufacturer max size");

  // the standards that specifiers recognise — grouped in plain language
  const standards: { label: string; value: string }[] = [];
  if (showImpact) {
    standards.push({
      label: "Large-missile impact",
      value: system.hvhz !== "No" ? "ASTM E1886 / E1996 · TAS 201 / 202 / 203" : "ASTM E1886 / E1996",
    });
  }
  standards.push({ label: "Air, water & structural", value: "ASTM E283 / E330 / E331" });
  standards.push({ label: "Fenestration standard", value: "AAMA / WDMA / CSA 101 / I.S.2 / A440" });
  if (system.hvhz !== "No") standards.push({ label: "HVHZ", value: "Miami-Dade & Broward approved" });

  return (
    <div>
      {/* ── SPECIFICATIONS ────────────────────────────── */}
      {specs.length > 0 && (
        <div className="mb-16">
          <p className="border-b border-mist pb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">Specifications</p>
          <dl className="grid gap-x-16 sm:grid-cols-2">
            {specs.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-6 border-b border-mist py-4">
                <dt className="text-[14px] text-slate">{r.label}</dt>
                <dd className="text-right text-[15px] font-medium text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>
          {hasCapability && (
            <p className="mt-4 text-[12px] leading-relaxed text-slate">
              Manufacturer max is the system&apos;s capability, not a certified US limit. Certified sizes are shown per opening below.
            </p>
          )}
        </div>
      )}

      {/* ── PERFORMANCE BY OPENING ────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-mist pb-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">Performance by opening</p>
        <div className="flex items-center gap-4">
          {system.perfClass && (
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate">Class {system.perfClass}</span>
          )}
          {hasBoth && (
            <div className="inline-flex rounded-full border border-mist p-0.5 text-[12px] font-medium">
              <button
                onClick={() => setMode("impact")}
                className={`rounded-full px-3 py-1 transition-colors ${mode === "impact" ? "bg-blue text-white" : "text-slate hover:text-ink"}`}
              >
                Impact / HVHZ
              </button>
              <button
                onClick={() => setMode("nonimpact")}
                className={`rounded-full px-3 py-1 transition-colors ${mode === "nonimpact" ? "bg-blue text-white" : "text-slate hover:text-ink"}`}
              >
                Non-impact
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">
              <th className="py-3 pr-4 font-medium">Configuration</th>
              <th className="py-3 pr-4 font-medium">Design pressure</th>
              <th className="py-3 pr-4 font-medium">Max size</th>
              <th className="py-3 font-medium">Approval</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={i} className="border-t border-mist">
                <td className="py-4 pr-4 text-[15px] text-ink">{a.config}</td>
                <td className="py-4 pr-4 font-mono text-[13px] text-ink">{a.dp ?? "Wind Zone 3"}</td>
                <td className="py-4 pr-4 font-mono text-[13px] text-slate">{a.max ?? "Being confirmed"}</td>
                <td className="py-4 font-mono text-[13px] text-blue">{a.fl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── TESTED & APPROVED TO ──────────────────────── */}
      <div className="mt-16">
        <p className="border-b border-mist pb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
          Tested &amp; approved to
        </p>
        <dl className="grid gap-x-16 sm:grid-cols-2">
          {standards.map((st) => (
            <div key={st.label} className="flex items-baseline justify-between gap-4 border-b border-mist py-4">
              <dt className="text-[15px] text-ink">{st.label}</dt>
              <dd className="text-right font-mono text-[12px] text-slate">{st.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[13px] leading-relaxed text-slate">
          Florida Product Approvals held by {systemHolder(system)}, to the 2023 Florida Building Code.
        </p>
      </div>
    </div>
  );
}
