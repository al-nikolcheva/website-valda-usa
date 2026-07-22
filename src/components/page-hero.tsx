import Image from "next/image";
import { Container } from "@/components/primitives";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image: string;
}) {
  return (
    <section className="relative flex min-h-[64vh] items-end overflow-hidden">
      <Image src={image} alt="" fill priority className="object-cover brightness-[0.82]" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10" />
      <Container className="relative z-10 pb-16 pt-32">
        <p className="caption text-white/75">
          <span className="text-blue-bright">/</span> {eyebrow}
        </p>
        <h1 className="mt-5 max-w-4xl headline text-[clamp(2.4rem,5.2vw,4.4rem)] text-white">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{intro}</p>}
      </Container>
    </section>
  );
}
