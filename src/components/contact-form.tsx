"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const field =
  "h-11 w-full border-0 border-b border-ink/20 bg-transparent px-0 text-[16px] text-ink outline-none transition-colors placeholder:text-slate/50 focus:border-ink";
const label = "mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-slate";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border-t border-ink/15 pt-8">
        <h3 className="headline text-2xl text-ink">Thank you.</h3>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-slate">
          Your enquiry has been recorded. We respond within one business day. For urgent project timelines, call the US line directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label className={label}>Name*</label>
          <input required className={field} />
        </div>
        <div>
          <label className={label}>Company</label>
          <input className={field} />
        </div>
        <div>
          <label className={label}>Email*</label>
          <input required type="email" className={field} />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input type="tel" className={field} />
        </div>
        <div>
          <label className={label}>Project type</label>
          <select defaultValue="" className={field}>
            <option value="" disabled>Select…</option>
            <option>Windows</option>
            <option>Doors</option>
            <option>Sliding &amp; Folding</option>
            <option>Facades &amp; curtain wall</option>
            <option>Multiple / not sure</option>
          </select>
        </div>
        <div>
          <label className={label}>Material</label>
          <select defaultValue="" className={field}>
            <option value="" disabled>Select…</option>
            <option>Aluminium</option>
            <option>PVC</option>
            <option>Both</option>
            <option>Not sure</option>
          </select>
        </div>
        <div>
          <label className={label}>Project location</label>
          <input className={field} placeholder="City, USA" />
        </div>
        <div>
          <label className={label}>Timeline</label>
          <select defaultValue="" className={field}>
            <option value="" disabled>Select…</option>
            <option>Just exploring</option>
            <option>Within 3 months</option>
            <option>3–6 months</option>
            <option>6–12 months</option>
            <option>12+ months</option>
          </select>
        </div>
      </div>
      <div>
        <label className={label}>Project details</label>
        <textarea rows={4} className={cn(field, "h-auto py-2 leading-relaxed")} placeholder="Wind zone, opening schedule, quantities, performance targets…" />
      </div>
      <button
        type="submit"
        className="group inline-flex items-center gap-2 border-b border-ink pb-1 text-[14px] font-medium text-ink transition-colors hover:border-blue hover:text-blue"
      >
        Send enquiry
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
