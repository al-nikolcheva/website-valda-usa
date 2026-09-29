import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Container } from "@/components/primitives";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact VALDA for a Window & Door Quote",
  description:
    "Send your wind zone, opening schedule and performance targets for European aluminum or PVC windows and doors in the USA. We reply within one business day.",
  path: "/contact",
  image: "/images/hero-villa.jpg",
});

export default function ContactPage() {
  return (
    <>
      {/* calm full-bleed image */}
      <section className="relative h-[58svh] min-h-[380px] w-full overflow-hidden rounded-b-lg bg-char">
        <Image src="/images/hero-villa.jpg" alt="" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />
      </section>

      {/* /01 CONTACT */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <div className="flex items-baseline justify-between text-[14px] leading-[22px] text-mute">
            <p>Contact</p>
            <p>/01</p>
          </div>
          <h1 className="sw-h mt-8 max-w-3xl text-[clamp(2.4rem,5.2vw,4.5rem)] text-char">
            Let&apos;s talk about your project.
          </h1>
          <p className="mt-6 max-w-xl text-[16px] font-medium leading-6 text-char">
            Send your wind zone, opening schedule and performance targets. We respond within one business day.
          </p>

          <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
            {/* details */}
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[14px] leading-[22px] text-mute">Email</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-char">
                    <Mail size={16} />
                  </span>
                </div>
                <a
                  href={`mailto:${SITE.email}`}
                  className="sw-h mt-6 block break-all text-[20px] text-char transition-colors hover:text-blue md:text-[24px]"
                >
                  {SITE.email}
                </a>
              </div>

              <div className="rounded-lg bg-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[14px] leading-[22px] text-mute">Phone</p>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-char">
                    <Phone size={16} />
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  {SITE.phones.map((p) => (
                    <div key={p.region} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-md bg-white px-4 py-3">
                      <span className="text-[14px] leading-[22px] text-slate">{p.region}</span>
                      <a
                        href={`tel:${p.number.replace(/\s/g, "")}`}
                        className="text-[16px] font-medium leading-6 text-char transition-colors hover:text-blue"
                      >
                        {p.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-char p-6 md:p-8">
                <p className="text-[14px] leading-[22px] text-white/55">Prefer to talk?</p>
                <h3 className="sw-h mt-6 text-[28px] text-white md:text-[32px]">Book a 30-minute call.</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-6 text-white/70">
                  A free consultation, phone or video. Bring your drawings and we&apos;ll talk systems, certification and delivery.
                </p>
                <a
                  href={`mailto:${SITE.email}?subject=${encodeURIComponent("Book a 30-minute consultation")}`}
                  className="group mt-7 inline-flex h-[52px] items-center justify-center gap-2 rounded-lg bg-white px-5 text-[14px] leading-[22px] text-char transition-colors duration-300 hover:bg-white/85"
                >
                  Book a 30-min call
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <p className="mt-3 text-[14px] leading-[22px] text-mute">Engineered in Sofia. Delivered worldwide.</p>
            </div>

            {/* form */}
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
