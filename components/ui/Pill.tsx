import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/**
 * The "chip toggle" from the design spec: a pill with a 1.5px border that
 * fills solid ink when on. Used for interest chips, day toggles, department
 * filters, role cards and any other tap-to-select control.
 */
export function Pill({ selected = false, className, ...props }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        "pill cursor-pointer font-body text-[13.5px] border-[1.5px] transition-colors disabled:opacity-45 disabled:cursor-not-allowed",
        selected
          ? "bg-ink text-salt border-ink"
          : "bg-transparent text-ink border-ink/30 hover:border-ink/60",
        className,
      )}
      {...props}
    />
  );
}
