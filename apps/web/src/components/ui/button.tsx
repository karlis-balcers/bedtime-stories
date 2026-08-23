import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moon/70 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-moon text-moon-fg shadow-[0_0_0_1px_color-mix(in_oklab,white_10%,transparent)] hover:opacity-95",
        secondary:
          "bg-night-3 text-ink shadow-[var(--shadow-border)] hover:bg-night-3/80",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
        outline:
          "bg-transparent text-ink shadow-[var(--shadow-border)] hover:shadow-[0_0_0_1px_color-mix(in_oklab,#ece7dc_22%,transparent)]",
        paper: "bg-paper text-paper-ink hover:opacity-95",
        danger: "bg-transparent text-ember shadow-[var(--shadow-border)]",
      },
      size: {
        sm: "h-9 rounded-[10px] px-3 text-sm",
        md: "h-11 rounded-xl px-4 text-sm",
        lg: "h-12 rounded-2xl px-5 text-base",
        icon: "size-11 rounded-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
