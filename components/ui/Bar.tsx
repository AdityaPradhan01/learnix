import { clsx } from "@/lib/clsx";

interface BarProps {
  pct: number;
  height?: number;
  fillClassName?: string;
  className?: string;
}

/** A horizontal fill bar on a pepper track — breakdown bars, skill-gap bars
 *  and requirement-coverage bars all share this shape. */
export function Bar({ pct, height = 7, fillClassName = "bg-ink", className }: BarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <span className={clsx("relative block overflow-hidden rounded-full bg-pepper", className)} style={{ height }}>
      <span
        className={clsx("absolute inset-y-0 left-0 rounded-full transition-[width]", fillClassName)}
        style={{ width: `${clamped}%` }}
      />
    </span>
  );
}

/** A bar with an accent tick overhanging top/bottom — marks a target value
 *  against a current fill (skill-gap "target" marker). */
export function TickBar({ pct, tickPct, height = 8 }: { pct: number; tickPct: number; height?: number }) {
  return (
    <span className="relative block overflow-visible rounded-full bg-pepper" style={{ height }}>
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-ink"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
      <span
        className="absolute w-0.5 rounded-full bg-oxblood"
        style={{ left: `${Math.max(0, Math.min(100, tickPct))}%`, top: -3, bottom: -3 }}
      />
    </span>
  );
}
