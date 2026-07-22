import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-mono text-[9px] uppercase tracking-[0.12em] rounded-[3px] px-2 py-1",
  {
    variants: {
      variant: {
        blue: "bg-blue text-white",
        ink: "bg-ink text-white",
        line: "border border-ink/15 text-steel",
        soft: "bg-paper text-graphite",
      },
    },
    defaultVariants: { variant: "line" },
  },
);

export function Badge({
  variant,
  className,
  children,
}: VariantProps<typeof badgeVariants> & { className?: string; children: React.ReactNode }) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
