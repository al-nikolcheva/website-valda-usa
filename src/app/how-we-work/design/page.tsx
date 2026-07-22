import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Design & engineering" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="How we work · 02"
      title="Design & engineering"
      intro="Every junction, anchor and glazing spec detailed and sealed to the relevant approval."
      image="/images/arch-4.jpg"
      body="Our engineers detail every junction, anchor and glazing specification and seal them to the relevant Florida Product Approval — so your specification stands on solid paperwork."
      points={[
        { t: "Detailed junctions", b: "Sills, heads, jambs and anchors engineered for your structure." },
        { t: "Sealed approvals", b: "Configurations aligned to the relevant Florida Product Approvals." },
        { t: "CAD & BIM", b: "Drawings and BIM objects to support specification and coordination." },
      ]}
    />
  );
}
