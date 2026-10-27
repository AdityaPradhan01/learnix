"use client";

import { useMemo, useState } from "react";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Tile } from "@/components/ui/Tile";
import { buildCompareRows, compareVerdict } from "@/lib/compare";
import type { ScoredCourse } from "@/lib/scoring";
import { CompareColumn } from "./CompareColumn";

export function CompareScreen({
  scored,
  initialA,
  initialB,
  hoursBudget,
}: {
  scored: ScoredCourse[];
  initialA: string;
  initialB: string;
  hoursBudget: number;
}) {
  const [idA, setIdA] = useState(initialA);
  const [idB, setIdB] = useState(initialB);

  const a = scored.find((s) => s.course.id === idA) ?? scored[0];
  const b = scored.find((s) => s.course.id === idB) ?? scored[1];
  const rows = useMemo(() => (a && b ? buildCompareRows(a, b) : []), [a, b]);
  const verdict = a && b ? compareVerdict(a, b, hoursBudget) : "";

  if (!a || !b) {
    return <div className="text-[14px] text-graphite">Not enough courses in the catalogue to compare.</div>;
  }

  return (
    <div>
      <ScreenHeader kicker="Compare" title="Two courses, same scorecard" />

      <div className="grid grid-cols-[170px_1fr_1fr] gap-3">
        <div />
        <CompareColumn scored={a} options={scored} onChange={setIdA} />
        <CompareColumn scored={b} options={scored} onChange={setIdB} />
      </div>

      <div className="mt-3 flex flex-col">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[170px_1fr_1fr] border-b border-stone/60">
            <div className="py-3 text-[12px] uppercase tracking-[0.06em] text-graphite">{r.label}</div>
            <div className={`py-3 pl-5 text-[13.5px] ${r.aWins ? "font-semibold text-oxblood" : "text-ink"}`}>{r.a}</div>
            <div className={`py-3 pl-5 text-[13.5px] ${r.bWins ? "font-semibold text-oxblood" : "text-ink"}`}>{r.b}</div>
          </div>
        ))}
      </div>

      <Tile tone="ink" className="mt-6 max-w-[760px] p-6">
        <div className="font-mono-label text-rose">Recommendation</div>
        <p className="mt-1.5 text-[13.5px] leading-[1.5] text-blush">{verdict}</p>
      </Tile>
    </div>
  );
}
