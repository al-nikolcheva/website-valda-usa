import { HeroBand } from "@/components/pinned-hero";

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
  return <HeroBand eyebrow={eyebrow} title={title} intro={intro} image={image} height="h-[68svh] min-h-[520px]" />;
}
