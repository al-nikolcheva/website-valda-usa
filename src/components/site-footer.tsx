import Link from "next/link";
import { ArrowRight } from "lucide-react";

function IgIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4z" />
    </svg>
  );
}
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/site";

const SITEMAP = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Projects", href: "/projects" },
  { label: "Our Brand", href: "/our-brand" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Production", href: "/production" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL = [
  { label: "Instagram", href: "#", Icon: IgIcon },
  { label: "LinkedIn", href: "#", Icon: LiIcon },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-blue text-white">
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-6 md:px-12">
        {/* CTA band */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/15 py-20 md:flex-row md:items-center">
          <h2 className="max-w-2xl headline text-[clamp(2rem,4vw,3.4rem)] text-white">We&apos;d love to work together to build your next project.</h2>
          <Link href="/contact" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-7 text-[14px] font-medium text-blue transition-colors hover:bg-white/85">
            Get in touch <ArrowRight size={16} />
          </Link>
        </div>

        {/* columns */}
        <div className="grid gap-12 py-16 md:grid-cols-[1.7fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3 text-white">
              <Logo className="h-9 w-9" />
              <span className="flex flex-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/wordmark-white.png" alt="VALDA" className="h-[18px] w-auto" />
                <span className="mt-[6px] h-[2px] w-full bg-white" />
              </span>
            </Link>
            <p className="mt-7 max-w-xs text-[15px] leading-relaxed text-white/65">
              European-engineered windows, doors and facade systems, certified and delivered factory direct to the USA.
            </p>
            <div className="mt-6 space-y-1.5 text-[14px] text-white/65">
              {SITE.phones.map((p) => (
                <p key={p.region}>{p.region}: <span className="text-white/85">{p.number}</span></p>
              ))}
              <a href={`mailto:${SITE.email}`} className="block text-white/85 hover:text-white">{SITE.email}</a>
            </div>
          </div>

          <div>
            <p className="caption text-white/45">Sitemap</p>
            <ul className="mt-5 space-y-3">
              {SITEMAP.map((l) => (
                <li key={l.label}><Link href={l.href} className="text-[15px] text-white/75 transition-colors hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="caption text-white/45">Social</p>
            <ul className="mt-5 space-y-3">
              {SOCIAL.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a href={href} className="inline-flex items-center gap-3 text-[15px] text-white/75 transition-colors hover:text-white">
                    <Icon className="h-[18px] w-[18px]" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col gap-3 border-t border-white/15 py-7 md:flex-row md:items-center md:justify-between">
          <p className="caption text-white/45">{SITE.legal} · Engineered in Sofia · Delivered worldwide</p>
          <p className="caption text-white/45">© 2026 {SITE.legal}</p>
        </div>

        {/* spacer so the watermark has room */}
        <div className="h-[7vw] md:h-[6vw]" />
      </div>

      {/* giant watermark */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 select-none overflow-hidden leading-[0.72]">
        <span className="block translate-y-[24%] text-center headline text-[26vw] text-white/[0.07]">VALDA</span>
      </div>
    </footer>
  );
}
