import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/primitives";
import { ProductFinder } from "@/components/product-finder";

export const metadata: Metadata = pageMeta({
  title: "Find Your Window or Door System",
  description:
    "Answer a few quick questions and we will match you with VALDA aluminum or PVC windows, doors and sliding systems by material, priorities and location.",
  path: "/products/finder",
});

export default function FinderPage() {
  return (
    <main className="min-h-screen bg-white pb-28 pt-32 md:pb-36 md:pt-40">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-[14px] leading-[22px] text-mute">Find your system</p>
            <p className="text-[14px] leading-[22px] text-mute">/01</p>
          </div>
          <h1 className="sw-h mt-8 text-[clamp(2.4rem,5vw,4rem)] text-char">Let&apos;s find the right system.</h1>
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-slate">
            A few quick questions, no forms, no jargon. We&apos;ll show you the systems that fit, and you can always talk to us to confirm.
          </p>
        </div>
        <div className="mt-16">
          <ProductFinder />
        </div>
      </Container>
    </main>
  );
}
