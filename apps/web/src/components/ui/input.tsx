import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-night-3 px-3.5 text-base text-ink shadow-[var(--shadow-border)] placeholder:text-subtle outline-none focus-visible:ring-2 focus-visible:ring-moon/60",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-2xl bg-night-3 px-3.5 py-3 text-base text-ink shadow-[var(--shadow-border)] placeholder:text-subtle outline-none focus-visible:ring-2 focus-visible:ring-moon/60",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("block text-sm font-medium text-muted", className)}
      {...props}
    />
  );
}
