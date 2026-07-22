import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Manufacturing" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="How we work · 03"
      title="Manufacturing"
      intro="Fabrication, glazing and quality control under one European roof."
      image="/images/project-mona-3.jpg"
      body="Fabrication, glazing and quality control happen in our own facilities in Bulgaria. Every HVHZ unit is checked and signed off before it leaves the factory, which is how we hold both our lead times and our approvals."
      points={[
        { t: "In-house fabrication", b: "CNC machining, welding and assembly by trained specialists." },
        { t: "Glazing line", b: "IGU assembly and SentryGlas lamination for impact glazing." },
        { t: "Quality control", b: "Every HVHZ unit checked against its approval before shipping." },
      ]}
    />
  );
}
