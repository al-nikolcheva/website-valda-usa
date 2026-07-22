import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Sustainability" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Our commitment"
      title="Sustainability"
      intro="High-performance envelopes, responsible manufacturing, lower lifetime impact."
      image="/images/arch-4.jpg"
      body="Energy-efficient glazing reduces the operational footprint of every building we glaze. In our own facilities we invest in solar energy, recycling and lower-emission logistics."
      points={[
        { t: "Solar energy", b: "On-site renewable generation at our European facilities." },
        { t: "Recycling", b: "Aluminium and PVC offcuts recovered and reprocessed." },
        { t: "Low-emission logistics", b: "Optimised freight and packaging across the Atlantic." },
      ]}
    />
  );
}
