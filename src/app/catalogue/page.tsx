import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CatalogueView } from "@/components/catalogue-view";

export const metadata: Metadata = pageMeta({
  title: "Catalogue 2026: European Windows & Doors",
  description:
    "Read the VALDA 2026 catalogue online or download the PDF: the company, our aluminum and PVC window, door and facade range, and delivered projects.",
  path: "/catalogue",
  image: "/catalogue/main/page-01.jpg",
});

export default function CataloguePage() {
  return (
    <CatalogueView
      tag="2026"
      eyebrow="Catalogue"
      title="The VALDA catalogue."
      intro="The company, the range and the work. Turn through it here, or download the PDF to keep."
      dir="main"
      pdf="/downloads/valda-catalogue-2026.pdf"
      alt={{ href: "/catalogue/technical", label: "Technical catalogue" }}
    />
  );
}
