import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { SwButton } from "@/components/sw/button";
import { CountUp } from "@/components/count-up";
import { ABOUT } from "@/lib/about";

/** Homepage /01 About: factory photo with key numbers, and a short in-house story. */
export function AboutSection({ n = "01" }: { n?: string }) {
  return (
    <section className="bg-white py-28 md:py-36">
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-5 md:px-10 lg:grid-cols-2 lg:gap-20">
        {/* factory photo + numbers */}
        <div className="relative min-h-[440px] overflow-hidden rounded-lg lg:min-h-[660px]">
          <Image src={ABOUT.image} alt="VALDA production facility" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[12px] text-char">
            <MapPin size={13} /> {ABOUT.place}
          </span>
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-4 p-6 md:p-8">
            {ABOUT.stats.map((s) => (
              <div key={s.label}>
                <p className="sw-h text-[clamp(2.2rem,4vw,3.25rem)] text-white">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-0.5 text-[15px] font-medium text-white/75 md:text-[17px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* story */}
        <div>
          <div className="flex items-baseline justify-between text-[14px] text-mute">
            <p>About</p>
            <p>/{n}</p>
          </div>
          <h2 className="sw-h mt-8 text-[clamp(2.2rem,4.4vw,3.5rem)] text-char">{ABOUT.title}</h2>
          <div className="mt-8 max-w-[540px] space-y-5">
            <p className="text-[18px] font-medium leading-7 text-char">{ABOUT.intro}</p>
            <p className="text-[16px] leading-6 text-slate">{ABOUT.body}</p>
          </div>

          <SwButton href="/about" className="mt-10">More about us <ArrowRight size={15} /></SwButton>
        </div>
      </div>
    </section>
  );
}
