"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Plus, ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Sub = { label: string; href: string };
type Item = { label: string; href?: string; sub?: Sub[] };

const NAV: Item[] = [
  {
    label: "Products",
    href: "/products",
    sub: [
      { label: "Windows", href: "/products/windows" },
      { label: "Doors", href: "/products/doors" },
      { label: "Sliding & Folding", href: "/products/sliding" },
      { label: "Facades", href: "/products/facades" },
    ],
  },
  { label: "Projects", href: "/projects" },
  {
    label: "About Us",
    href: "/about",
    sub: [
      { label: "About", href: "/about" },
      { label: "Catalogue", href: "/catalogue" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const glass = scrolled && !open;
  const close = () => setOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-colors duration-300",
          glass
            ? "border-b border-ink/[0.06] bg-white/80 text-ink shadow-[0_4px_30px_-14px_rgba(14,18,23,0.18)] backdrop-blur-xl"
            : "bg-transparent",
          !glass && "text-white",
        )}
      >
        {!glass && !open && (
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink/45 via-ink/15 to-transparent" />
        )}

        <div className="mx-auto flex h-[76px] w-full max-w-[1320px] items-center justify-between px-6 md:px-10">
          <Link href="/" onClick={close} className="flex shrink-0 items-center gap-3">
            <Logo className="h-8 w-8" />
            <span className="flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={glass ? "/images/wordmark-dark.png" : "/images/wordmark-white.png"} alt="VALDA" className="h-[15px] w-auto" />
              <span className={cn("mt-[5px] h-[2px] w-full", glass ? "bg-blue" : "bg-white")} />
            </span>
          </Link>

          {/* DESKTOP — inline nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href! + "/"));
              return (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href!}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors xl:px-4",
                      glass ? "text-ink/70 hover:text-ink" : "text-white/80 hover:text-white",
                      active && (glass ? "text-ink" : "text-white"),
                    )}
                  >
                    {item.label}
                    {item.sub && (
                      <ChevronDown size={13} className="opacity-60 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                  </Link>
                  {item.sub && (
                    <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      <div className="min-w-[220px] rounded-2xl border border-ink/[0.06] bg-white p-2 shadow-[0_20px_50px_-20px_rgba(14,18,23,0.35)]">
                        {item.sub.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className={cn(
                              "block rounded-lg px-4 py-2.5 text-[14px] transition-colors",
                              pathname === s.href ? "bg-paper text-blue" : "text-ink/70 hover:bg-paper hover:text-ink",
                            )}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 md:gap-3">
            {!open && (
              <Link
                href="/products/finder"
                className={cn(
                  "hidden h-10 items-center gap-1.5 rounded-full border px-5 text-[13px] font-medium transition-colors lg:inline-flex",
                  glass ? "border-ink/20 text-ink hover:border-ink/50" : "border-white/40 text-white hover:bg-white/10",
                )}
              >
                Find your system
              </Link>
            )}
            {!open && (
              <Link
                href="/contact"
                className="hidden h-10 items-center gap-1.5 rounded-full bg-blue px-5 text-[13px] font-medium text-white transition-colors hover:bg-blue-bright sm:inline-flex"
              >
                Get a quote <ArrowRight size={14} />
              </Link>
            )}
            {/* hamburger — mobile / tablet */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="group flex items-center gap-2.5 text-[14px] font-medium lg:hidden"
            >
              <span className="hidden tracking-wide sm:inline">{open ? "Close" : "Menu"}</span>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN OVERLAY MENU — editorial minimal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-ink text-white"
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-[76px] md:px-16">
              <nav className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col justify-center py-10">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.06 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b border-white/10"
                  >
                    {item.sub ? (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <Link href={item.href!} onClick={close} className="group block flex-1 py-4 md:py-5">
                            <span className="headline text-[clamp(2rem,6vw,4rem)] leading-[1.02] text-white/85 transition-colors group-hover:text-white">
                              {item.label}
                            </span>
                          </Link>
                          <button
                            onClick={() => setExpand(expand === item.label ? null : item.label)}
                            aria-label={`Expand ${item.label}`}
                            className="shrink-0 p-3 text-white/40 transition-colors hover:text-white"
                          >
                            <Plus size={24} className={cn("transition-transform duration-300", expand === item.label && "rotate-45")} />
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {expand === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-x-8 gap-y-2 pb-6">
                                {item.sub.map((s) => (
                                  <Link
                                    key={s.href}
                                    href={s.href}
                                    onClick={close}
                                    className="text-[15px] text-white/45 transition-colors hover:text-white"
                                  >
                                    {s.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link href={item.href!} onClick={close} className="group block py-4 md:py-5">
                        <span className="headline text-[clamp(2rem,6vw,4rem)] leading-[1.02] text-white/85 transition-colors group-hover:text-white">
                          {item.label}
                        </span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* slim contact line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mx-auto flex w-full max-w-[1040px] flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[13px] text-white/45"
              >
                <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-white">{SITE.email}</a>
                <div className="flex items-center gap-5">
                  <Link href="/products/finder" onClick={close} className="transition-colors hover:text-white">
                    Find your system
                  </Link>
                  <Link href="/contact" onClick={close} className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                    Get a quote <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
