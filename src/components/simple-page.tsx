import { ArrowRight } from "lucide-react";
import { PinnedHero } from "@/components/pinned-hero";
import { Container, Reveal } from "@/components/primitives";
import { Button } from "@/components/ui/button";

export function SimplePage({
  eyebrow,
  title,
  intro,
  image,
  body,
  points,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image: string;
  body: string;
  points?: { t: string; b: string }[];
  children?: React.ReactNode;
}) {
  return (
    <PinnedHero eyebrow={eyebrow} title={title} intro={intro} image={image}>
      <section className="bg-white py-24 md:py-32">
        <Container>
          <Reveal>
            <p className="max-w-3xl statement text-[clamp(1.3rem,2.4vw,2rem)] text-ink">{body}</p>
          </Reveal>
          {points && (
            <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {points.map((p, i) => (
                <Reveal key={p.t} delay={(i % 3) * 0.06}>
                  <div className="border-t border-ink/15 pt-5">
                    <span className="caption text-blue">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-4 headline text-xl text-ink">{p.t}</h3>
                    <p className="mt-3 text-[14px] leading-[1.75] text-slate">{p.b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-14">
            <Button href="/contact" variant="blue">Get a quote <ArrowRight size={16} /></Button>
          </div>
        </Container>
      </section>
      {children}
    </PinnedHero>
  );
}
