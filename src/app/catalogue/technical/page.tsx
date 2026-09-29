import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CatalogueView } from "@/components/catalogue-view";

export const metadata: Metadata = pageMeta({
  title: "Technical Catalogue 2026: Windows & Doors",
  description:
    "VALDA technical catalogue: aluminum and PVC window and door systems, Florida Product Approval, impact ratings and performance data, online or as a PDF.",
  path: "/catalogue/technical",
  image: "/catalogue/technical/page-01.jpg",
});

export default function TechnicalCataloguePage() {
  return (
    <CatalogueView
      tag="2026"
      eyebrow="Technical catalogue"
      title="VALDA technical catalogue."
      intro="Systems, certifications and performance data. Turn through it here, or download the PDF to keep."
      dir="technical"
      pdf="/downloads/valda-technical-catalogue-2026.pdf"
      alt={{ href: "/catalogue", label: "Main catalogue" }}
    />
  );
}
