import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PinnedHero
      eyebrow="Contact"
      title="Let's talk about your project."
      intro="Send your wind zone, opening schedule and performance targets. We respond within one business day."
      image="/images/project-mona-2.jpg"
    >
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-14 md:grid-cols-[1.4fr_1fr]">
            <ContactForm />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-bright">Direct</p>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">Email</p>
                  <a href={`mailto:${SITE.email}`} className="headline text-xl tracking-[-0.01em] text-blue">{SITE.email}</a>
                </div>
                {SITE.phones.map((p) => (
                  <div key={p.region}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">{p.region}</p>
                    <p className="headline text-xl tracking-[-0.01em]">{p.number}</p>
                  </div>
                ))}
                <div className="border-t border-mist pt-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate">Engineered in Sofia · Delivered worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PinnedHero>
  );
}
