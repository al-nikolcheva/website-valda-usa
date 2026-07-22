import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Technical information" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Resources"
      title="Technical information"
      intro="Catalogues, specifications, CAD/BIM and FL approval documentation in one place."
      image="/images/project-milwaukee-2.jpg"
      body="Everything an architect or GC needs to specify and install VALDA systems: product catalogues, technical data sheets, CAD details, BIM objects, FL Product Approvals and installation drawings."
      points={[
        { t: "Catalogues", b: "2026 product catalogue and per-system technical catalogues." },
        { t: "CAD & BIM", b: "Drawing details and BIM objects for specification." },
        { t: "Approvals", b: "FL Product Approvals, NOAs and installation drawings." },
      ]}
    />
  );
}
