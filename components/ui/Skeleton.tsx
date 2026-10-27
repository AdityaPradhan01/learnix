import { clsx } from "@/lib/clsx";

/** A loading placeholder block — tile-radius, pepper-toned pulse. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("tile animate-pulse bg-pepper", className)} />;
}
