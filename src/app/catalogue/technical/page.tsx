import type { Metadata } from "next";
import { CatalogueView } from "@/components/catalogue-view";

export const metadata: Metadata = {
  title: "Technical catalogue 2026",
  description: "The VALDA technical catalogue — systems, certifications and performance data. Read it as a flip book or download the PDF.",
};

export default function TechnicalCataloguePage() {
  return (
    <CatalogueView
      tag="2026"
      eyebrow="Technical catalogue"
      title="VALDA technical catalogue."
      intro="Systems, certifications and performance data — turn through it here, or download the PDF to keep."
      dir="technical"
      pdf="/downloads/valda-technical-catalogue-2026.pdf"
      alt={{ href: "/catalogue", label: "Main catalogue" }}
    />
  );
}
