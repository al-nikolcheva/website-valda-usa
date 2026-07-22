import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Impact glass" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Products · Glass"
      title="Impact glass"
      intro="Laminated impact glazing for hurricane and large-missile zones."
      image="/images/hero.jpg"
      body="SentryGlas laminated impact glazing is engineered into VALDA HVHZ systems and certified to TAS 201 and TAS 203, so no external shutters are required in covered configurations."
    />
  );
}
