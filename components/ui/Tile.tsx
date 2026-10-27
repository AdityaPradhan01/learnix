import type { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

type Tone = "salt" | "pepper" | "ink" | "oxblood";
type Size = "default" | "hero";

interface TileProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  size?: Size;
  hover?: boolean;
}

const tones: Record<Tone, string> = {
  salt: "bg-salt text-ink",
  pepper: "bg-pepper text-ink",
  ink: "bg-ink text-salt",
  oxblood: "bg-oxblood text-blush",
};

/** The base card shape: 28px radius (32px for hero-sized tiles), no border —
 *  separation comes from surface colour and whitespace, per the design spec. */
export function Tile({ tone = "pepper", size = "default", hover = false, className, ...props }: TileProps) {
  return (
    <div
      className={clsx(
        size === "hero" ? "tile-hero" : "tile",
        tones[tone],
        hover && "transition-transform duration-[450ms] ease-[var(--ease-brand)] hover:-translate-y-1.5",
        className,
      )}
      {...props}
    />
  );
}
