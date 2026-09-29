import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { FaqSection } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { FAQS } from "@/lib/faqs";

export const metadata: Metadata = pageMeta({
  title: "FAQ: Buying European Windows for the USA",
  description:
    "Certification, Florida Product Approval, shipping, customs and warranty: practical answers on buying European windows and doors factory direct in the USA.",
  path: "/faq",
  image: "/images/arch-4.jpg",
});

// FAQPage schema from the same questions the accordion renders.
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const US_CERTS = [
  { file: "cert-florida.png", name: "Florida Product Approved" },
  { file: "cert-nami.png", name: "NAMI" },
  { file: "cert-aama.png", name: "AAMA / WDMA / CSA" },
];

export default function FaqPage() {
  return (
    <PinnedHero
      eyebrow="FAQ"
      title="Frequently asked questions"
      intro="Certification, shipping and the practical side of buying factory direct from Europe."
      image="/images/arch-4.jpg"
    >
      <JsonLd data={faqLd} />

      {/* /01 US CERTIFICATIONS */}
      <section className="bg-white py-28 md:py-36">
        <Container>
          <div className="flex items-baseline justify-between text-[14px] leading-[22px] text-mute">
            <p>Certified for the USA</p>
            <p>/01</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {US_CERTS.map((c, i) => (
              <Reveal key={c.file} delay={i * 0.06} className="h-full">
                <div className="flex h-full flex-col justify-between gap-8 rounded-lg bg-panel p-6">
                  <div className="flex h-16 items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/images/cert/${c.file}`} alt={c.name} className="h-14 w-auto max-w-full object-contain md:h-16" />
                  </div>
                  <p className="text-[14px] leading-[22px] text-char">{c.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* /02 QUESTIONS */}
      <FaqSection n="02" />
    </PinnedHero>
  );
}
