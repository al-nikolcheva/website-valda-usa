"use client";

import { useMemo, useState } from "react";
import { allApprovals, FAMILIES } from "@/lib/systems";
import { cn } from "@/lib/utils";

const FAMILY_LABEL: Record<string, string> = Object.fromEntries(
  FAMILIES.map((f) => [f.slug, f.brand]),
);

export function ApprovalsTable() {
  const data = useMemo(() => allApprovals(), []);
  const [q, setQ] = useState("");
  const [family, setFamily] = useState<string>("all");
  const [hvhz, setHvhz] = useState<"all" | "yes" | "no">("all");

  const rows = data.filter((r) => {
    if (family !== "all" && r.family !== family) return false;
    if (hvhz === "yes" && !r.hvhz) return false;
    if (hvhz === "no" && r.hvhz) return false;
    if (q) {
      const hay = `${r.system} ${r.config} ${r.fl} ${r.impact}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const chip = (active: boolean) =>
    cn(
      "rounded-[3px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
      active ? "border-blue bg-blue text-white" : "border-ink/15 text-graphite hover:border-ink/40",
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search system, config, FL number…"
          className="h-10 flex-1 min-w-[220px] rounded-[3px] border border-ink/15 bg-white px-3 text-sm outline-none focus:border-blue"
        />
        <div className="flex gap-1.5">
          <button className={chip(family === "all")} onClick={() => setFamily("all")}>All</button>
          {FAMILIES.map((f) => (
            <button key={f.slug} className={chip(family === f.slug)} onClick={() => setFamily(f.slug)}>
              {f.brand}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button className={chip(hvhz === "all")} onClick={() => setHvhz("all")}>Any zone</button>
          <button className={chip(hvhz === "yes")} onClick={() => setHvhz("yes")}>HVHZ</button>
          <button className={chip(hvhz === "no")} onClick={() => setHvhz("no")}>Non-HVHZ</button>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-steel">{rows.length} approvals</p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-paper text-left font-mono text-[10px] uppercase tracking-[0.1em] text-steel">
              <th className="px-4 py-3 font-medium">System</th>
              <th className="px-4 py-3 font-medium">Configuration</th>
              <th className="px-4 py-3 font-medium">FL Approval</th>
              <th className="px-4 py-3 font-medium">HVHZ</th>
              <th className="px-4 py-3 font-medium">Impact</th>
              <th className="px-4 py-3 font-medium">Design pressure</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-ink/[0.07]">
                <td className="px-4 py-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-steel">{FAMILY_LABEL[r.family]}</span>
                  <div className="font-medium">{r.system}</div>
                </td>
                <td className="px-4 py-3 text-graphite/80">{r.config}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue">{r.fl}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.hvhz ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-graphite/80">{r.impact}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.dp ?? "See drawing"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
