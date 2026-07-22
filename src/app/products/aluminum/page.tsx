import type { Metadata } from "next";
import { SimplePage } from "@/components/simple-page";
import { ProductSection } from "@/components/product-section";

export const metadata: Metadata = { title: "Aluminium systems" };

export default function Page() {
  return (
    <SimplePage
      eyebrow="Products"
      title="Aluminium systems"
      intro="Slim-sightline aluminium windows, doors, sliding and facade systems for high-performance projects."
      image="/images/arch-1.jpg"
      body="VALDA aluminium systems pair European profiles with US certification. Vista and Vista Guard on Etem, plus partner platforms from Reynaers, engineered for impact, thermal and acoustic performance."
      points={[
        { t: "Windows", b: "Tilt & turn, fixed and casement, HVHZ and non-impact." },
        { t: "Doors & sliding", b: "Entrance, terrace, lift & slide and minimal-frame systems." },
        { t: "Facades", b: "Curtain wall and window wall for larger envelopes." },
      ]}
    >
      <ProductSection material="aluminium" />
    </SimplePage>
  );
}
