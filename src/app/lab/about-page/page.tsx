import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Internal hub for comparing About page directions. Not linked, not indexed.
export const metadata: Metadata = { title: "Lab: About page options", robots: { index: false, follow: false } };

const OPTIONS = [
  { id: "Now", name: "Current About page", href: "/about", note: "What is live today: long, with story, why VALDA, history, today, how we work, certifications and film." },
  { id: "A", name: "The family story", href: "/lab/about-page/a", note: "Calm and human: fortress hero, story, a horizontal timeline, the two factories, values, certifications, film." },
  { id: "B", name: "Inside the factory", href: "/lab/about-page/b", note: "Process-led: factory film hero, a scroll-driven tour of what we make in-house, the two factories, timeline." },
  { id: "C", name: "Short and bold", href: "/lab/about-page/c", note: "Compact and scannable: a bento grid of story, photos, numbers and certifications, a timeline strip, values." },
];

export default function AboutPageLab() {
  return (
    <div>
      <header className="bg-char pb-14 pt-[140px] text-white">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <p className="text-[14px] text-white/55">Internal preview</p>
          <h1 className="sw-h mt-4 text-[clamp(2.2rem,4.4vw,3.5rem)]">About page options</h1>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[1440px] gap-3 px-5 py-16 md:grid-cols-2 md:px-10">
        {OPTIONS.map((o) => (
          <Link key={o.id} href={o.href} className="group flex min-h-[200px] flex-col justify-between rounded-lg bg-panel p-6 transition-colors hover:bg-char">
            <div className="flex items-start justify-between">
              <span className="text-[14px] text-mute group-hover:text-white/60">{o.id === "Now" ? "Current" : `Option ${o.id}`}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-char text-white group-hover:bg-white group-hover:text-char">
                <ArrowUpRight size={16} />
              </span>
            </div>
            <div>
              <h2 className="sw-h text-[28px] text-char group-hover:text-white">{o.name}</h2>
              <p className="mt-2 max-w-md text-[14px] leading-[22px] text-slate group-hover:text-white/70">{o.note}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

