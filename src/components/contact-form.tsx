"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const field = "h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[15px] outline-none transition-colors focus:border-blue";
const label = "mb-2 block caption text-slate";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-mist bg-white p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue text-white">
          <Check size={18} />
        </span>
        <h3 className="headline text-xl text-ink">Thank you.</h3>
        <p className="text-[15px] leading-relaxed text-slate">
          Your enquiry has been recorded. We respond within one business day. For urgent project timelines, call the US line directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input required className={field} />
        </div>
        <div>
          <label className={label}>Company</label>
          <input className={field} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input required type="email" className={field} />
        </div>
        <div>
          <label className={label}>Project location</label>
          <input className={field} placeholder="City, USA" />
        </div>
      </div>
      <div>
        <label className={label}>Project details</label>
        <textarea rows={5} className={cn(field, "h-auto py-3 leading-relaxed")} placeholder="Wind zone, opening schedule, performance targets, timeline…" />
      </div>
      <button type="submit" className="inline-flex h-12 items-center rounded-full bg-blue px-7 text-[14px] font-medium text-white transition-colors hover:bg-blue-bright">
        Send enquiry
      </button>
    </form>
  );
}
