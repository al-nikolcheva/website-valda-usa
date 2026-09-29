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
      <section className="bg-white py-28 md:py-36">
        <Container>
          <div className="flex items-baseline justify-between text-[14px] leading-[22px] text-mute">
            <p>{eyebrow}</p>
            <p>/01</p>
          </div>
          <Reveal>
            <p className="sw-h mt-8 max-w-4xl text-[clamp(1.6rem,3vw,2.5rem)] text-char">{body}</p>
          </Reveal>
          {points && (
            <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {points.map((p, i) => (
                <Reveal key={p.t} delay={(i % 3) * 0.06}>
                  <div className="flex h-full min-h-[240px] flex-col justify-between rounded-lg bg-panel p-6">
                    <span className="text-[14px] text-mute">/{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="sw-h text-[24px] text-char">{p.t}</h3>
                      <p className="mt-2 text-[14px] leading-[22px] text-slate">{p.b}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-14">
            <Button href="/contact">Get a quote <ArrowRight size={16} /></Button>
          </div>
        </Container>
      </section>
      {children}
    </PinnedHero>
  );
}
