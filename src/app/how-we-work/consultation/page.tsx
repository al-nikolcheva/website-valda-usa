import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Consultation & estimation" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="How we work · 01"
      title="Consultation & estimation"
      intro="Your drawings, wind zone and performance targets become a clear, value-engineered estimate."
      image="/images/arch-2.jpg"
      body="We start with your architectural drawings, wind zone and performance targets and return a value-engineered system schedule with a clear estimate in USD — so the numbers are real before anything is committed."
      points={[
        { t: "Drawings & targets", b: "We review your openings, wind zone and thermal, acoustic and impact requirements." },
        { t: "Value engineering", b: "We match the right systems to your budget without losing performance." },
        { t: "Clear estimate", b: "A transparent estimate in USD, factory direct, with no hidden distributor markup." },
      ]}
    />
  );
}
