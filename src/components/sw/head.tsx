import { cn } from "@/lib/utils";

/**
 * Scandiwest section header.
 * inline  → [label]   [Headline ...............]   [/NN]  on one row
 * stacked → [label .......................... /NN]
 *           [Headline]
 * centered → like stacked, headline centred (philosophy).
 */
export function SwHead({
  label,
  n,
  title,
  layout = "inline",
  dark = false,
  className,
}: {
  label: string;
  n: string;
  title: React.ReactNode;
  layout?: "inline" | "stacked" | "centered";
  dark?: boolean;
  className?: string;
}) {
  const meta = cn("text-[14px] leading-[22px]", dark ? "text-white/55" : "text-mute");
  const h = cn("sw-h text-[clamp(2.2rem,4.4vw,3.5rem)]", dark ? "text-white" : "text-char");

  if (layout === "inline") {
    return (
      <div className={cn("grid items-baseline gap-4 md:grid-cols-[160px_1fr_auto] md:gap-8", className)}>
        <p className={meta}>{label}</p>
        <h2 className={h}>{title}</h2>
        <p className={cn(meta, "hidden md:block")}>/{n}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <p className={meta}>{label}</p>
        <p className={meta}>/{n}</p>
      </div>
      <h2 className={cn(h, "mt-8", layout === "centered" && "text-center")}>{title}</h2>
    </div>
  );
}
