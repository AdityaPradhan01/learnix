"use client";

import { useEffect, useRef, useState } from "react";
import { resetWeightsAction, setWeightsAction } from "@/app/(app)/actions";
import { SIGNALS, DEFAULT_WEIGHTS, clampWeight, weightSum, type Weights } from "@/lib/scoring";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { Button } from "@/components/ui/Button";

export function WeightsCard({ weights: initial }: { weights: Weights }) {
  const [weights, setWeights] = useState(initial);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(commitTimer.current), []);

  function commit(next: Weights) {
    clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      setWeightsAction(next);
    }, 400);
  }

  function handleChange(key: keyof Weights, value: number) {
    const next = { ...weights, [key]: clampWeight(value) };
    setWeights(next);
    commit(next);
  }

  function handleReset() {
    setWeights({ ...DEFAULT_WEIGHTS });
    clearTimeout(commitTimer.current);
    resetWeightsAction();
  }

  const total = weightSum(weights);

  return (
    <section className="tile bg-pepper p-7">
      <div className="flex items-center justify-between">
        <h2 className="font-mono-label text-graphite">What matters most</h2>
        <Button variant="secondary" size="xs" onClick={handleReset}>Reset</Button>
      </div>
      <p className="mt-1 text-[12.5px] text-graphite">
        These normalise on every read, so they never need to add up to 100.
      </p>
      <div className="mt-6 flex flex-col gap-5">
        {SIGNALS.map((s) => (
          <RangeSlider
            key={s.key}
            id={`weight-${s.key}`}
            label={s.label}
            min={0}
            max={100}
            value={weights[s.key]}
            displayValue={`${Math.round((weights[s.key] / total) * 100)}%`}
            accentValue
            onChange={(v) => handleChange(s.key, v)}
          />
        ))}
      </div>
    </section>
  );
}
