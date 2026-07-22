import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="About us"
      title="Services"
      intro="From early-stage consultation to installed window and warranty."
      image="/images/arch-2.jpg"
      body="VALDA supports projects end to end: technical consultation, value engineering, manufacturing, logistics and US-based distribution, with one point of contact for warranty."
      points={[
        { t: "Consultation & value engineering", b: "We optimise the system schedule against your targets and budget." },
        { t: "Manufacturing & logistics", b: "Factory-direct fabrication and freight to your site schedule." },
        { t: "US distribution & warranty", b: "One partner from spec to warranty, one phone number." },
      ]}
    />
  );
}
