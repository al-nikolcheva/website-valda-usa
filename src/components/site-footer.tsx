import Link from "next/link";
import { SITE } from "@/lib/site";
import { SwButton } from "@/components/sw/button";

/* ── Config ─────────────────────────────────────────────────── */
const CLOSING = "Have a project in mind? Let’s build what comes next.";
const LOCATION = ["Factories in Sofia & Veliko Tarnovo", "Bulgaria, European Union"];
const LINKS = [
  { label: "Products", href: "/products" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];
const SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
];
/* ───────────────────────────────────────────────────────────── */

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-char text-white">
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 md:px-10">
        {/* top: closing line + contact */}
        <div className="grid gap-12 border-b border-white/12 py-20 md:grid-cols-[1fr_auto] md:py-24">
          <div>
            <h2 className="sw-h max-w-[480px] text-[clamp(1.9rem,3vw,2.4rem)] text-white">{CLOSING}</h2>
            <SwButton href="/contact" variant="white" className="mt-8">Start the conversation</SwButton>
          </div>
          <div className="flex flex-col justify-between gap-10 text-[15px] md:min-w-[260px]">
            <div className="space-y-1.5">
              <a href={`mailto:${SITE.email}`} className="block text-white transition-colors hover:text-white/70">{SITE.email}</a>
              {SITE.phones.map((p) => (
                <a key={p.region} href={`tel:${p.number.replace(/\s/g, "")}`} className="block text-white/60 transition-colors hover:text-white">
                  {p.number} <span className="text-white/35">· {p.region}</span>
                </a>
              ))}
            </div>
            <p className="text-white">
              {LOCATION.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
            </p>
          </div>
        </div>

        {/* bottom row */}
        <div className="flex flex-col gap-5 py-7 text-[14px] md:flex-row md:items-center md:justify-between">
          <p className="text-mute">© 2026 {SITE.legal}. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-white/80 transition-colors hover:text-white">{l.label}</Link>
            ))}
          </nav>
          <div className="flex gap-6">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} className="text-white/80 transition-colors hover:text-white">{s.label}</a>
            ))}
          </div>
        </div>

        {/* room for the watermark */}
        <div className="h-[16vw] md:h-[15vw]" />
      </div>

      {/* giant faint wordmark */}
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-[18%] select-none text-center font-display text-[30vw] font-normal leading-none tracking-[-0.02em] text-[#6f6f72]/[0.14]"
      >
        VALDA
      </p>
    </footer>
  );
}
