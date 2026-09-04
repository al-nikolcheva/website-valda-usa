import type { Metadata } from "next";
import { CatalogueView } from "@/components/catalogue-view";

export const metadata: Metadata = {
  title: "Catalogue 2026",
  description: "The VALDA 2026 catalogue — the company, the range and the projects. Read it as a flip book or download the PDF.",
};

export default function CataloguePage() {
  return (
    <CatalogueView
      tag="2026"
      eyebrow="Catalogue"
      title="The VALDA catalogue."
      intro="The company, the range and the work — turn through it here, or download the PDF to keep."
      dir="main"
      pdf="/downloads/valda-catalogue-2026.pdf"
      alt={{ href: "/catalogue/technical", label: "Technical catalogue" }}
    />
  );
}
