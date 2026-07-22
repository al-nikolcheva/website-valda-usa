import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { ProductSection } from "@/components/product-section";

export const metadata: Metadata = { title: "PVC systems" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Products"
      title="PVC systems"
      intro="High-performance PVC windows, doors and sliding systems for thermal comfort and value."
      image="/images/arch-3.jpg"
      body="VALDA PVC systems run on Deceuninck Legend and Koemmerling profiles, with SentryGlas impact glazing for HVHZ and energy-efficient configurations for non-impact zones."
      points={[
        { t: "Windows", b: "Vision, Vision Guard and Koemmerling 76MD / 88MD." },
        { t: "Doors", b: "Inswing, outswing and dual-action in PVC." },
        { t: "Sliding", b: "PD88 sliding systems, XO and OXXO, HVHZ certified." },
      ]}
    >
      <ProductSection material="pvc" />
    </SimplePage>
  );
}
