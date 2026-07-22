import type { Metadata } from "next";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { SectionHead } from "@/components/editorial";
import { ApprovalsTable } from "@/components/approvals-table";
import { CERTIFICATIONS } from "@/lib/systems";

export const metadata: Metadata = { title: "Credentials & certifications" };

export default function CredentialsPage() {
  return (
    <PinnedHero
      eyebrow="Our brand · credentials"
      title="Approved for the Florida Building Code."
      intro="Every VALDA system is approved under the Florida Building Code and tested to the full ASTM and TAS battery."
      image="/images/project-milwaukee-2.jpg"
    >
      <section className="py-20">
        <Container>
          <Reveal><SectionHead label="Certifications" title="What we hold." /></Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-mist bg-mist sm:grid-cols-2 lg:grid-cols-4">
            {CERTIFICATIONS.map((c) => (
              <div key={c.code} className="bg-white p-6">
                <h3 className="headline text-lg tracking-[-0.01em]">{c.code}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate">{c.scope}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20">
        <Container>
          <Reveal>
            <SectionHead label="FL approval directory" title="Every approval, in one place." />
            <p className="mt-5 max-w-2xl text-[15px] text-slate">Filter by system family or wind zone. Each entry references its Florida Product Approval and the company that holds it — VALDA 90 OOD for our proprietary systems, Reynaers and Kömmerling USA Inc. for the partner platforms.</p>
          </Reveal>
          <div className="mt-8"><ApprovalsTable /></div>
        </Container>
      </section>
    </PinnedHero>
  );
}
