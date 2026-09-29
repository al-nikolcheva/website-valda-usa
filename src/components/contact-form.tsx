"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

const field =
  "h-[52px] w-full rounded-lg border-0 bg-panel px-4 text-[15px] text-char placeholder:text-mute focus:outline-2 focus:outline-offset-0 focus:outline-blue";
const label = "mb-2 block text-[14px] leading-[22px] text-mute";

function Select({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select id={id} name={name} defaultValue="" className={cn(field, "cursor-pointer appearance-none pr-10")}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mute" />
    </div>
  );
}

export function ContactForm() {
  const [sent, setSent] = useState<"" | "sent" | "mail">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) return setSent("sent");
      const out = (await res.json().catch(() => ({}))) as { error?: string; fallback?: boolean };
      if (!out.fallback) return setError(out.error ?? "Something went wrong. Please try again.");
    } catch {
      // network error: fall through to the email app
    } finally {
      setBusy(false);
    }
    // No email service yet (or it failed): open the visitor's email app with the enquiry filled in.
    const body = [
      ["Name", data.name], ["Company", data.company], ["Email", data.email], ["Phone", data.phone],
      ["Project type", data.type], ["Material", data.material], ["Project location", data.location],
      ["Timeline", data.timeline], ["Project details", data.details],
    ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Project enquiry: ${data.name}`)}&body=${encodeURIComponent(body)}`;
    setSent("mail");
  }

  if (sent) {
    return (
      <div className="self-start rounded-lg bg-panel p-6 md:p-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-char">
          <Check size={16} />
        </span>
        <h3 className="sw-h mt-6 text-[28px] text-char md:text-[32px]">Thank you.</h3>
        <p className="mt-3 max-w-sm text-[16px] leading-6 text-slate">
          {sent === "sent"
            ? "Your enquiry has been sent. We respond within one business day. For urgent project timelines, call the US line directly."
            : <>Your email app should have opened with your enquiry ready to go. Just press send. If nothing opened, email us at <a href={`mailto:${SITE.email}`} className="text-char underline underline-offset-4">{SITE.email}</a>.</>}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={label}>Name*</label>
          <input id="cf-name" name="name" required className={field} />
        </div>
        <div>
          <label htmlFor="cf-company" className={label}>Company</label>
          <input id="cf-company" name="company" className={field} />
        </div>
        <div>
          <label htmlFor="cf-email" className={label}>Email*</label>
          <input id="cf-email" name="email" required type="email" className={field} />
        </div>
        <div>
          <label htmlFor="cf-phone" className={label}>Phone</label>
          <input id="cf-phone" name="phone" type="tel" className={field} />
        </div>
        <div>
          <label htmlFor="cf-type" className={label}>Project type</label>
          <Select id="cf-type" name="type">
            <option value="" disabled>Select…</option>
            <option>Windows</option>
            <option>Doors</option>
            <option>Sliding &amp; Folding</option>
            <option>Facades &amp; curtain wall</option>
            <option>Multiple / not sure</option>
          </Select>
        </div>
        <div>
          <label htmlFor="cf-material" className={label}>Material</label>
          <Select id="cf-material" name="material">
            <option value="" disabled>Select…</option>
            <option>Aluminum</option>
            <option>PVC</option>
            <option>Both</option>
            <option>Not sure</option>
          </Select>
        </div>
        <div>
          <label htmlFor="cf-location" className={label}>Project location</label>
          <input id="cf-location" name="location" className={field} placeholder="City, USA" />
        </div>
        <div>
          <label htmlFor="cf-timeline" className={label}>Timeline</label>
          <Select id="cf-timeline" name="timeline">
            <option value="" disabled>Select…</option>
            <option>Just exploring</option>
            <option>Within 3 months</option>
            <option>3–6 months</option>
            <option>6–12 months</option>
            <option>12+ months</option>
          </Select>
        </div>
      </div>
      <div>
        <label htmlFor="cf-details" className={label}>Project details</label>
        <textarea
          id="cf-details"
          name="details"
          rows={5}
          className={cn(field, "h-auto resize-y py-3.5 leading-6")}
          placeholder="Wind zone, opening schedule, quantities, performance targets…"
        />
      </div>
      {/* honeypot: hidden from people, filled by bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && <p className="text-[14px] leading-[22px] text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-char px-5 text-[14px] leading-[22px] text-white transition-colors duration-300 hover:bg-black sm:w-auto"
      >
        {busy ? "Sending…" : "Send enquiry"}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
