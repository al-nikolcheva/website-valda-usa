import Link from "next/link";
import { cn } from "@/lib/utils";

// Scandiwest button: 8px radius rectangle, 52px tall, 14px regular text.
const VARIANTS = {
  char: "bg-char text-white hover:bg-black",
  white: "bg-white text-char hover:bg-white/85",
  blue: "bg-blue text-white hover:bg-blue-bright",
} as const;

export function SwButton({
  href,
  variant = "char",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[52px] items-center justify-center gap-2 rounded-lg px-5 text-[14px] leading-[22px] transition-colors duration-300",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
