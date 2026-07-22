import type { Metadata } from "next";
import { ArrowRight, Mail } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { LineReveal } from "@/components/line-reveal";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join VALDA — a European manufacturer of premium windows, doors and facade systems. Engineering, manufacturing, project delivery, commercial and logistics roles across our factories and markets.",
};

const APPLY_MAIL = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Career application — VALDA",
)}&body=${encodeURIComponent(
  "Hi VALDA team,\n\nI'd like to apply. The area I'm interested in is:\n\nA short note about my experience:\n\n(Please attach your CV.)\n\nThank you.",
)}`;

const VALUES = [
  { t: "Own the whole chain", b: "From raw profile to the installed window, we keep every stage in-house. That means real responsibility — and real craft — end to end." },
  { t: "Engineering-led", b: "Junctions, anchors and glazing specs are decided on data and tested to standard, not guessed. Good ideas win on their merits." },
  { t: "Landmark work", b: "Our systems go onto buildings people notice — from high-rise facades to hurricane-rated homes in Florida." },
  { t: "European roots, global reach", b: "Three factories in Bulgaria, 350 distribution partners across the EU and the USA. The work travels, and so can you." },
  { t: "Make it and mean it", b: "The people who build a unit stand behind it. One manufacturer, one phone number for warranty — pride is built in." },
  { t: "Grow with us", b: "We hire for the long term and promote from within. Learn the whole system, not just one bench." },
];

const TEAMS = [
  { t: "Engineering & Design", b: "Detailing, statics, thermal and acoustic performance, glazing specifications and Florida Product Approvals." },
  { t: "Manufacturing", b: "PVC and aluminium fabrication, glazing and quality control across our three factories in Bulgaria." },
  { t: "Project Delivery", b: "Coordinating each order from estimate and schedule to a unit installed on a US or EU site." },
  { t: "Commercial & Sales", b: "Working with architects, specifiers and distributors across the US and European markets." },
  { t: "Logistics", b: "Packing for the Atlantic, coordinating freight and aligning delivery to the site programme." },
];

const STEPS = [
  { t: "Send your CV", b: "Email us your CV and tell us which area you're drawn to. A cover note helps but isn't required." },
  { t: "Intro call", b: "A short conversation about your experience and what you want to build next." },
  { t: "Meet the team", b: "A technical discussion with the people you'd actually work alongside." },
  { t: "Offer", b: "If it's a fit both ways, we make an offer and plan your start." },
];

export default function CareersPage() {
  return (
    <PinnedHero
      eyebrow="About us — Careers"
      title="Build what lasts, with the people who make it."
      intro="VALDA brings together 300+ specialists in engineering, manufacturing and project delivery. If you want to work on high-performance systems for landmark projects, we'd like to hear from you."
      image="/images/project-mona-3.jpg"
    >
      {/* INTRO */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-7">
              <Reveal>
                <p className="caption text-slate"><span className="text-blue-bright">/</span> Why VALDA</p>
                <p className="mt-6 statement text-[clamp(1.6rem,3vw,2.6rem)]">
                  <LineReveal text="We make windows the way we'd want them made — owned end to end, tested to standard, and signed by the people who built them." />
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-4 md:col-start-9 md:self-end">
              <Reveal delay={0.1}>
                <p className="text-[15px] leading-relaxed text-slate">
                  You'll join a manufacturer, not a middleman — a fully integrated European operation shipping factory direct to the most demanding markets in the world.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* LIFE AT VALDA */}
      <section className="bg-paper py-24 md:py-32">
        <Container>
          <Reveal><SectionHead label="Life at VALDA" title="What it's like to work here." /></Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={(i % 3) * 0.06}>
                <div className="border-t border-ink/15 pt-5">
                  <span className="caption text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 headline text-xl text-ink">{v.t}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-slate">{v.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* WHERE WE HIRE */}
      <section className="py-24 md:py-32">
        <Container>
          <Reveal><SectionHead label="Where we hire" title="Teams across the whole chain." /></Reveal>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate">
            We don&apos;t always have a role posted for every team — but we&apos;re always glad to hear from strong people. Tell us where you fit.
          </p>
          <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {TEAMS.map((team, i) => (
              <Reveal key={team.t}>
                <div className="grid gap-4 py-7 md:grid-cols-[7rem_1fr_auto] md:items-center md:gap-10">
                  <span className="font-mono text-[13px] text-blue">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="headline text-xl text-ink md:text-2xl">{team.t}</h3>
                    <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-slate">{team.b}</p>
                  </div>
                  <a
                    href={APPLY_MAIL}
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-blue underline-offset-4 hover:underline md:justify-self-end"
                  >
                    Apply <ArrowRight size={14} />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW TO APPLY */}
      <section className="bg-ink py-24 text-white md:py-32">
        <Container>
          <Reveal><SectionHead label="How to apply" title="Four steps, no black box." light /></Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={(i % 4) * 0.06}>
                <div className="border-t border-white/15 pt-5">
                  <span className="font-mono text-[13px] text-blue-bright">/ 0{i + 1}</span>
                  <h3 className="mt-4 headline text-xl text-white">{s.t}</h3>
                  <p className="mt-3 text-[14px] leading-[1.8] text-white/70">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-16 flex flex-col items-start gap-6 rounded-3xl border border-white/12 bg-white/[0.04] p-8 md:flex-row md:items-center md:justify-between md:p-10">
              <div>
                <h3 className="headline text-2xl text-white md:text-3xl">Ready when you are.</h3>
                <p className="mt-2 text-[15px] text-white/70">
                  Send your CV to <span className="text-white">{SITE.email}</span> and tell us where you fit.
                </p>
              </div>
              <a
                href={APPLY_MAIL}
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-blue px-7 text-[13px] font-medium text-white transition-colors hover:bg-blue-bright"
              >
                <Mail size={16} /> Send your application
              </a>
            </div>
          </Reveal>
        </Container>
      </section>
    </PinnedHero>
  );
}
