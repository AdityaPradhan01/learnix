"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function arcLength(pct: number): number {
  return (CIRCUMFERENCE * Math.max(0, Math.min(100, pct))) / 100;
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServer() {
  return false;
}

export interface RingProps {
  /** 0..100 */
  pct: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** A second, larger arc drawn underneath — e.g. a projected "after" value. */
  secondaryPct?: number;
  secondaryColor?: string;
  label?: string;
  sublabel?: string;
  showLabel?: boolean;
  animate?: boolean;
}

/**
 * SVG ring, r=26 in a 64 viewBox, rotated -90deg, round linecap — per the
 * design spec. The percentage is HTML overlaid on top, not SVG text, so it
 * stays crisp and selectable. Counts up on mount unless the visitor prefers
 * reduced motion.
 */
export function Ring({
  pct,
  size = 64,
  strokeWidth = 7,
  color = "var(--color-oxblood)",
  trackColor = "var(--color-pepper)",
  secondaryPct,
  secondaryColor = "var(--color-rose)",
  label,
  sublabel,
  showLabel = true,
  animate = true,
}: RingProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);
  const shouldAnimate = animate && !reduceMotion;
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;
    let raf: number;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedPct(clamped * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldAnimate, clamped]);

  const display = shouldAnimate ? animatedPct : clamped;
  const centerLabel = label ?? `${Math.round(display)}%`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" className="-rotate-90" aria-hidden focusable="false">
        <circle cx="32" cy="32" r={RADIUS} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {secondaryPct != null && (
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength(secondaryPct)} ${CIRCUMFERENCE}`}
          />
        )}
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength(display)} ${CIRCUMFERENCE}`}
        />
      </svg>
      {showLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading font-extrabold leading-none" style={{ fontSize: size * 0.26 }}>
            {centerLabel}
          </span>
          {sublabel && (
            <span className="font-mono-label mt-1 opacity-70" style={{ fontSize: Math.max(8, size * 0.07) }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
