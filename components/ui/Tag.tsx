import type { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

type Variant = "neutral" | "dark" | "accent" | "outline";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  mono?: boolean;
}

const variants: Record<Variant, string> = {
  neutral: "bg-pepper text-graphite",
  dark: "bg-ink text-salt",
  accent: "bg-oxblood text-blush",
  outline: "border border-ink/20 text-ink",
};

export function Tag({ variant = "neutral", mono, className, ...props }: TagProps) {
  return (
    <span
      className={clsx(
        "pill inline-flex items-center gap-1 px-3 py-[5px] text-[12px]",
        mono && "font-mono uppercase tracking-[0.1em] text-[10.5px]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
