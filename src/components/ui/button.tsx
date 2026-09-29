import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-[14px] font-normal leading-[22px] transition-colors duration-300 disabled:opacity-50",
  {
    variants: {
      variant: {
        ink: "bg-char text-white hover:bg-black",
        blue: "bg-char text-white hover:bg-blue",
        light: "bg-white text-char hover:bg-white/85",
        outline: "bg-panel text-char hover:bg-char hover:text-white",
        outlineLight: "bg-white/10 text-white backdrop-blur hover:bg-white hover:text-char",
      },
      size: {
        md: "h-[52px] px-5",
        sm: "h-10 px-4",
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
