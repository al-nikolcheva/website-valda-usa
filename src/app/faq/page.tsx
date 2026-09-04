import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { Container } from "@/components/primitives";
import { FaqSection } from "@/components/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Certification, shipping, packaging, customs and warranty: the practical side of buying VALDA windows and doors factory direct from Europe, certified for the US market.",
};

const US_CERTS = [
  { file: "cert-florida.png", name: "Florida Product Approved" },
  { file: "cert-nami.png", name: "NAMI" },
  { file: "cert-aama.png", name: "AAMA / WDMA / CSA" },
];

export default function FaqPage() {
  return (
    <PinnedHero
      eyebrow="About us"
      title="Frequently asked questions"
      intro="Certification, shipping and the practical side of buying factory direct from Europe."
      image="/images/arch-4.jpg"
    >
      {/* US CERTIFICATIONS */}
      <section className="border-b border-mist bg-white py-16 md:py-20">
        <Container>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
            Certified for the United States
          </p>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 items-center gap-x-8 gap-y-10">
            {US_CERTS.map((c) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={c.file} src={`/images/cert/${c.file}`} alt={c.name} className="mx-auto h-14 w-auto object-contain md:h-16" />
            ))}
          </div>
        </Container>
      </section>

      <FaqSection />
    </PinnedHero>
  );
}
