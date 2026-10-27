"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useSyncExternalStore, type ReactNode } from "react";

type Variant = "up" | "rise" | "grow";

const VARIANTS: Record<Variant, { variants: Variants; duration: number }> = {
  up: { variants: { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }, duration: 0.9 },
  rise: { variants: { hidden: { opacity: 0, y: 70, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 } }, duration: 1.2 },
  grow: { variants: { hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }, duration: 0.7 },
};

function subscribeNoop() {
  return () => {};
}
function getMountedClient() {
  return true;
}
function getMountedServer() {
  return false;
}

/**
 * Reveal-on-scroll wrapper. SSR and pre-hydration output is always fully
 * visible — the animation only ever adds motion on top of content that was
 * never hidden, so a slow or failed script never leaves anything invisible.
 * Honours prefers-reduced-motion by skipping the animation outright.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
}) {
  // Renders false during SSR/first paint and true once hydrated — the
  // canonical replacement for a `useEffect(() => setMounted(true))` gate.
  const mounted = useSyncExternalStore(subscribeNoop, getMountedClient, getMountedServer);
  const reduceMotion = useReducedMotion();

  if (!mounted || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const v = VARIANTS[variant];
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={v.variants}
      transition={{ duration: v.duration, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
