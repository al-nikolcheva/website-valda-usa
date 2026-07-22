import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = { title: "Bird-friendly glass" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Products · Glass"
      title="Bird-friendly glass"
      intro="Glazing that protects wildlife without compromising the view."
      image="/images/arch-5.jpg"
      body="Bird-friendly glazing uses subtle patterns and coatings that birds can see while keeping the glass visually clean. Specified into VALDA systems for projects with environmental or code requirements."
    />
  );
}
