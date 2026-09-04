import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send your wind zone, opening schedule and performance targets. We respond within one business day.",
};

export default function ContactPage() {
  return (
    <>
      {/* calm full-bleed image */}
      <section className="relative h-[58vh] min-h-[380px] w-full overflow-hidden">
        <Image src="/images/hero-villa.jpg" alt="" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-ink/25" />
      </section>

      {/* spacious contact */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-24 md:px-10 md:py-36">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Contact</p>
          <h1 className="mt-7 max-w-3xl headline text-[clamp(2.4rem,6vw,5rem)] leading-[1.02] text-ink">
            Let&apos;s talk about your project.
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.85] text-slate">
            Send your wind zone, opening schedule and performance targets. We respond within one business day.
          </p>

          <div className="mt-20 grid gap-16 md:mt-28 md:grid-cols-[0.9fr_1.1fr] md:gap-24">
            {/* details */}
            <div className="space-y-12">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Email</p>
                <a href={`mailto:${SITE.email}`} className="mt-3 block headline text-2xl text-ink transition-colors hover:text-blue">
                  {SITE.email}
                </a>
              </div>
              <div className="grid gap-10 sm:grid-cols-2">
                {SITE.phones.map((p) => (
                  <div key={p.region}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">{p.region}</p>
                    <p className="mt-3 headline text-xl text-ink">{p.number}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-ink/10 bg-paper p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Prefer to talk?</p>
                <h3 className="mt-3 headline text-xl text-ink">Book a 30-minute call.</h3>
                <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-slate">
                  A free consultation, phone or video. Bring your drawings and we&apos;ll talk systems, certification and delivery.
                </p>
                <a
                  href={`mailto:${SITE.email}?subject=${encodeURIComponent("Book a 30-minute consultation")}`}
                  className="group mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-blue px-6 text-[13px] font-medium text-white transition-colors hover:bg-blue-bright"
                >
                  Book a 30-min call
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
              <div className="border-t border-ink/10 pt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">
                  Engineered in Sofia · Delivered worldwide
                </p>
              </div>
            </div>

            {/* form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
