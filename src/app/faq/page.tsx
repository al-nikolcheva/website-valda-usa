import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { FaqSection } from "@/components/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Shipping, packaging, lead times, customs, certification and warranty — the practical side of buying VALDA windows and doors factory direct from Europe.",
};

export default function FaqPage() {
  return (
    <PinnedHero
      eyebrow="About us"
      title="Frequently asked questions"
      intro="Shipping, packaging, lead times and the practical side of buying factory direct from Europe."
      image="/images/arch-4.jpg"
    >
      <FaqSection />
    </PinnedHero>
  );
}
