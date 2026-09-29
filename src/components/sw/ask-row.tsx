"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SwButton } from "@/components/sw/button";
import type { SearchResult } from "@/lib/site-search";

/* ── Config ──────────────────────────────────────────────────── */
const PLACEHOLDER = "Ask anything about VALDA";
const SUGGESTIONS = ["Which systems are hurricane rated?", "Is there a minimum order?", "How does shipping to the USA work?"];
const NO_MATCH = "We don’t have a written answer for that yet, but our team can answer it directly, usually within one business day.";
/* ───────────────────────────────────────────────────────────── */

/** Last row of the FAQ accordion: a free-text question matched against the site's own content (/api/ask). */
export function AskRow() {
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setAsked(question);
    setResult(null);
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json()) as SearchResult & { error?: string };
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else setResult(data);
    } catch {
      setError("Something went wrong. Please try again, or contact our team directly.");
    } finally {
      setBusy(false);
      setQ("");
    }
  }

  const empty = result && !result.answer && result.links.length === 0;

  return (
    <div className="border-b border-char/10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="flex items-center justify-between gap-6 py-6"
      >
        <label htmlFor="ask-valda" className="sr-only">{PLACEHOLDER}</label>
        <input
          id="ask-valda"
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={400}
          placeholder={PLACEHOLDER}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[18px] font-medium leading-7 text-char outline-none placeholder:text-mute md:text-[20px]"
        />
        <button
          type="submit"
          disabled={busy || !q.trim()}
          aria-label="Ask"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-char text-white transition-colors hover:bg-blue disabled:bg-char/25"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
      </form>

      {!asked && (
        <div className="-mt-2 flex flex-wrap gap-2 pb-6">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-md bg-white px-2.5 py-1 text-[13px] text-char/70 transition-colors hover:bg-char hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {asked && !busy && (result || error) && (
          <motion.div
            key={asked}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-2xl pb-7" aria-live="polite">
              <p className="text-[14px] text-mute">{asked}</p>

              {error && <p className="mt-2 text-[15px] leading-6 text-char/80">{error}</p>}
              {result?.answer && <p className="mt-2 text-[15px] leading-6 text-char/80">{result.answer}</p>}
              {empty && <p className="mt-2 text-[15px] leading-6 text-char/80">{NO_MATCH}</p>}

              {result && result.links.length > 0 && (
                <div className="mt-5">
                  <p className="text-[13px] text-mute">{result.answer ? "Related" : "This may help"}</p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {result.links.map((l) => (
                      <li key={l.href + l.title}>
                        <Link href={l.href} className="group flex h-full items-start justify-between gap-3 rounded-lg bg-white p-4 transition-colors hover:bg-char">
                          <span>
                            <span className="block text-[15px] font-medium text-char group-hover:text-white">{l.title}</span>
                            <span className="mt-0.5 block text-[13px] leading-5 text-mute group-hover:text-white/60">{l.meta}</span>
                          </span>
                          <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-char group-hover:text-white" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SwButton href="/contact" className="h-11">Talk to our team <ArrowRight size={15} /></SwButton>
                <button
                  type="button"
                  onClick={() => input.current?.focus()}
                  className="text-[14px] text-char underline-offset-4 hover:text-blue hover:underline"
                >
                  Ask another question
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
