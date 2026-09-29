import Image from "next/image";
import { COMPANY } from "@/lib/company";
import { CountUp } from "@/components/count-up";
import { cn } from "@/lib/utils";

const tile = "relative overflow-hidden rounded-lg";

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-white px-3 py-1 text-[13px] leading-5 text-char",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * /01 At a glance: bento grid.
 * lg (4 cols):  [story 2x2 ][facility 2x1 ]
 *               [story     ][n1  ][n2    ]
 *               [n3 ][n4   ][floor 2x2   ]
 *               [make][cert][floor       ]
 */
export function AboutBento() {
  return (
    <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:auto-rows-[minmax(230px,auto)]">
      {/* Story */}
      <div className={cn(tile, "col-span-2 flex flex-col justify-between bg-char p-6 md:p-9 lg:row-span-2")}>
        <p className="text-[14px] leading-[22px] text-white/55">Our story</p>
        <div className="mt-16">
          <p className="sw-h text-[clamp(1.6rem,2.6vw,2.4rem)] text-white">{COMPANY.story.lead}</p>
          <p className="mt-6 max-w-xl text-[16px] leading-6 text-white/65">{COMPANY.story.body[0]}</p>
        </div>
      </div>

      {/* Aerial facility */}
      <div className={cn(tile, "col-span-2 min-h-[240px] bg-panel")}>
        <Image
          src={COMPANY.images.facility}
          alt="Aerial view of a VALDA factory"
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
        <Chip className="absolute bottom-4 left-4">Sofia &amp; Veliko Tarnovo</Chip>
      </div>

      {/* Numbers */}
      {COMPANY.numbers.map((n) => (
        <div key={n.label} className={cn(tile, "flex flex-col justify-between bg-panel p-5 md:p-7")}>
          <span className="h-1.5 w-1.5 rounded-full bg-blue" aria-hidden />
          <div>
            <p className="sw-h text-[clamp(2.6rem,5vw,4.25rem)] leading-none text-char">
              <CountUp value={n.value} suffix={n.suffix} />
            </p>
            <p className="mt-3 text-[14px] leading-[22px] text-slate">{n.label}</p>
          </div>
        </div>
      ))}

      {/* Factory floor */}
      <div className={cn(tile, "col-span-2 min-h-[280px] bg-panel lg:row-span-2")}>
        <Image
          src={COMPANY.images.floor}
          alt="The VALDA factory floor, people at work"
          fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 50vw"
        />
        <Chip className="absolute bottom-4 left-4">On the factory floor</Chip>
      </div>

      {/* Made in-house */}
      <div className={cn(tile, "col-span-2 flex flex-col justify-between border border-mist bg-white p-5 sm:col-span-1 md:p-7")}>
        <p className="text-[14px] leading-[22px] text-mute">Made in-house</p>
        <div className="mt-8">
          <p className="sw-h text-[22px] text-char">Every stage under our own roof.</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {COMPANY.inHouse.map((s) => (
              <li key={s.title} className="rounded-md bg-panel px-3 py-1 text-[13px] leading-5 text-char">
                {s.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Certifications */}
      <div className={cn(tile, "col-span-2 flex flex-col justify-between border border-mist bg-white p-5 sm:col-span-1 md:p-7")}>
        <p className="text-[14px] leading-[22px] text-mute">Certified for the USA</p>
        <ul className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-2">
          {COMPANY.certifications.map((c) => (
            <li key={c.name} className="flex aspect-[3/2] items-center justify-center rounded-md bg-panel p-2">
              <Image src={c.img} alt={c.name} width={120} height={80} className="h-full max-h-12 w-auto object-contain" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
