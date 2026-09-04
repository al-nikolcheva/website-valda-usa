import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Reveal } from "@/components/primitives";
import { ParallaxImage } from "@/components/parallax-image";

type Props = {
  image: string;
  eyebrow?: string;
  intro: string;
  headline: React.ReactNode;
  link?: { label: string; href: string };
  minH?: string;
  brightness?: number;
};

export function ImmersiveBand({
  image,
  eyebrow,
  intro,
  headline,
  link,
  minH = "min-h-[82vh]",
  brightness = 0.5,
}: Props) {
  return (
    <section className="relative overflow-hidden">
      <ParallaxImage src={image} alt="" brightness={brightness} />
      <div className="absolute inset-0 bg-ink/35" />
      <Container className={`relative z-10 flex ${minH} items-center py-24 md:py-28`}>
        <div className="grid w-full items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* left — small intro + link */}
          <Reveal className="md:max-w-sm">
            {eyebrow && (
              <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{eyebrow}</p>
            )}
            <p className="text-[17px] leading-[1.7] text-white/85">{intro}</p>
            {link && (
              <Link
                href={link.href}
                className="group mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white underline-offset-4 hover:text-blue-bright"
              >
                {link.label}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </Reveal>

          {/* right — big headline */}
          <Reveal delay={0.1}>
            <h2 className="headline text-[clamp(2.4rem,5.4vw,4.6rem)] leading-[1.03] text-white">
              {headline}
            </h2>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
