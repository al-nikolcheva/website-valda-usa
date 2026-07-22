import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Downloads" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Resources"
      title="Downloads"
      intro="Catalogues, spec sheets, FL approvals and installation drawings."
      image="/images/project-twins-1.jpg"
      body="Download the documentation you need to specify, approve and install VALDA systems — product catalogues, technical data sheets, FL Product Approvals, NOAs and installation drawings."
      points={[
        { t: "Product catalogue 2026", b: "The full range, FL approvals and certified sizes." },
        { t: "Spec sheets", b: "Per-system technical data and performance." },
        { t: "Approvals & drawings", b: "FL approvals, NOAs and sealed installation drawings." },
      ]}
    />
  );
}
