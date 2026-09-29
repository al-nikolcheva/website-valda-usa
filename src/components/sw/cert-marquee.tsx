import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const LOGOS = [
  { name: "Florida Product Approval", src: "/images/cert/logos/florida.png", w: 1044, h: 944 },
  { name: "HVHZ approved", src: "/images/cert/logos/hvhz.png", w: 910, h: 961 },
  { name: "NAMI", src: "/images/cert/logos/nami.png", w: 825, h: 789 },
  { name: "AAMA", src: "/images/cert/logos/aama.png", w: 918, h: 891 },
  { name: "ISO 9001:2015", src: "/images/cert/logos/iso.png", w: 842, h: 827 },
  { name: "CE marked", src: "/images/cert/logos/ce.png", w: 792, h: 775 },
];

/** Certification logos on an endless, slow loop. Pauses on hover; static with reduced motion. */
export function CertMarquee() {
  const row = (hidden: boolean) =>
    LOGOS.map((l) => (
      <li key={`${l.name}-${hidden}`} aria-hidden={hidden || undefined} className="flex h-20 shrink-0 items-center justify-center px-8 md:h-24 md:px-12">
        <Image
          src={l.src}
          alt={hidden ? "" : l.name}
          width={l.w}
          height={l.h}
          className="h-full w-auto object-contain opacity-60 mix-blend-multiply grayscale transition-opacity duration-300 hover:opacity-100"
          sizes="200px"
        />
      </li>
    ));

  return (
    <section className="bg-white py-14 md:py-20" aria-label="Certifications">
      <div className="mx-auto flex w-full max-w-[1440px] items-baseline justify-between px-5 md:px-10">
        <p className="text-[14px] leading-[22px] text-mute">Tested and certified for the USA</p>
        <Link href="/certifications" className="inline-flex items-center gap-1 text-[14px] leading-[22px] text-char underline-offset-4 hover:text-blue hover:underline">
          Certifications <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="group relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="flex w-max animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {row(false)}
          {row(true)}
        </ul>
      </div>
    </section>
  );
}
