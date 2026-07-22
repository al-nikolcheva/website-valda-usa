import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-[13px] font-medium tracking-tight transition-colors duration-300 disabled:opacity-50",
  {
    variants: {
      variant: {
        ink: "bg-ink text-white border border-white/10 hover:bg-blue",
        blue: "bg-blue text-white hover:bg-blue-bright",
        light: "bg-white text-ink hover:bg-white/85",
        outline: "border border-ink/25 text-ink hover:bg-ink hover:text-white",
        outlineLight: "border border-white/40 text-white hover:bg-white hover:text-ink",
      },
      size: {
        md: "h-12 px-7",
        sm: "h-10 px-5",
      },
    },
    defaultVariants: { variant: "ink", size: "md" },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
  href?: string;
  className?: string;
  children: React.ReactNode;
};

export function Button({ href, variant, size, className, children }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return <button className={classes}>{children}</button>;
}

export { buttonVariants };
