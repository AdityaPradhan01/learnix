import type { SignalKey, Weights } from "./types";

export interface SignalDef {
  key: SignalKey;
  label: string;
  /** CSS color token for score-breakdown bars and reason chips. */
  color: string;
  def: number;
}

// The five ranking signals, in fixed display order. Defaults sum to 100 but
// that is not required — weights are always normalised on read (see
// score.ts weightSum), so a student's sliders never need to add up.
export const SIGNALS: SignalDef[] = [
  { key: "goals", label: "Career goal", color: "var(--color-signal-goals)", def: 30 },
  { key: "gap", label: "Skill gap", color: "var(--color-signal-gap)", def: 25 },
  { key: "history", label: "Past courses", color: "var(--color-signal-history)", def: 20 },
  { key: "schedule", label: "Schedule fit", color: "var(--color-signal-schedule)", def: 15 },
  { key: "cost", label: "Credit value", color: "var(--color-signal-cost)", def: 10 },
];

export const DEFAULT_WEIGHTS: Weights = SIGNALS.reduce((acc, s) => {
  acc[s.key] = s.def;
  return acc;
}, {} as Weights);

export function signalDef(key: SignalKey): SignalDef {
  const found = SIGNALS.find((s) => s.key === key);
  if (!found) throw new Error(`Unknown signal key: ${key}`);
  return found;
}

/** Sliders are free within 0..100; the total is renormalised on every read. */
export function clampWeight(value: number): number {
  return Math.max(0, Math.min(100, value));
}
