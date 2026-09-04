import type { Metadata } from "next";
import { Container } from "@/components/primitives";
import { ProductFinder } from "@/components/product-finder";

export const metadata: Metadata = {
  title: "Find your system",
  description: "Answer a few quick questions and we'll point you to the VALDA systems that fit your project — by material, priorities and location.",
};

export default function FinderPage() {
  return (
    <main className="min-h-screen bg-paper pb-24 pt-32 md:pt-40">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-slate">
            <span className="tabular-nums text-blue-bright">01</span>
            <span className="h-px w-8 bg-slate/30" /> Find your system
          </p>
          <h1 className="mt-6 headline text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.0] tracking-[-0.025em] text-ink">
            Let&apos;s find the right system.
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-slate">
            A few quick questions — no forms, no jargon. We&apos;ll show you the systems that fit, and you can always talk to us to confirm.
          </p>
        </div>
        <div className="mt-14">
          <ProductFinder />
        </div>
      </Container>
    </main>
  );
}
