import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Glass" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Products"
      title="Glass"
      intro="Specialist glazing options engineered into every VALDA system."
      image="/images/arch-5.jpg"
      body="From laminated impact glazing for hurricane zones to bird-friendly and acoustic options, the glass package is engineered with the frame, not added after."
      points={[
        { t: "Bird-friendly glass", b: "Patterned and coated glazing that reduces bird collisions." },
        { t: "Impact glass", b: "SentryGlas laminated glazing for HVHZ and large-missile zones." },
        { t: "Acoustic & solar", b: "Specified to U-value, SHGC and Rw targets per project." },
      ]}
    />
  );
}
