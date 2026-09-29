import Image from "next/image";

/**
 * Inner-page hero, Scandiwest style: full-bleed photo with rounded bottom corners,
 * a small label chip + large medium-weight title bottom-left, intro bottom-right.
 * The next section peeks below. Children flow normally under it.
 */
export function PinnedHero({
  eyebrow,
  title,
  intro,
  image,
  imagePosition = "center",
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image: string;
  imagePosition?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <HeroBand eyebrow={eyebrow} title={title} intro={intro} image={image} imagePosition={imagePosition} />
      {children && <div className="relative z-10 bg-pure">{children}</div>}
    </>
  );
}

export function HeroBand({
  eyebrow,
  title,
  intro,
  image,
  imagePosition = "center",
  height = "h-[82svh] min-h-[560px]",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image: string;
  imagePosition?: string;
  height?: string;
}) {
  return (
    <section className={`relative overflow-hidden rounded-b-lg bg-char ${height}`}>
      <Image
        src={image}
        alt=""
        fill
        priority
        className="object-cover"
        style={{ objectPosition: imagePosition }}
        sizes="100vw"
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-5 pb-8 md:flex-row md:items-end md:justify-between md:gap-16 md:px-10 md:pb-12">
        <div className="max-w-4xl">
          <span className="inline-block rounded-md bg-white/15 px-2.5 py-1 text-[13px] leading-5 text-white backdrop-blur-md">
            {eyebrow}
          </span>
          <h1 className="sw-h mt-5 text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[1.06] text-white">{title}</h1>
        </div>
        {intro && <p className="max-w-[400px] shrink-0 text-[16px] leading-6 text-white/85">{intro}</p>}
      </div>
    </section>
  );
}
