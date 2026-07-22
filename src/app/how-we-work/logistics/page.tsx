import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Logistics & delivery" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="How we work · 04"
      title="Logistics & delivery"
      intro="Packed for the Atlantic and shipped factory direct to your site schedule."
      image="/images/project-milwaukee-2.jpg"
      body="We pack for the Atlantic crossing and ship factory direct, coordinating freight and US delivery to your site schedule — with one point of contact from the factory to the installed window and warranty."
      points={[
        { t: "Export packing", b: "Units crated and protected for the transatlantic journey." },
        { t: "Freight & US delivery", b: "Coordinated to your installation programme." },
        { t: "One point of contact", b: "From factory to installed window and warranty." },
      ]}
    />
  );
}
