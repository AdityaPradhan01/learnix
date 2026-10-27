import Link from "next/link";
import type { TermPlan } from "@/lib/data/path";

export function TermColumn({ term }: { term: TermPlan }) {
  return (
    <div className="flex min-h-[360px] flex-col overflow-hidden rounded-3xl bg-pepper">
      <div className={`px-4 py-3 ${term.current ? "bg-ink text-salt" : "bg-stone/50 text-ink"}`}>
        <div className="font-heading text-[14.5px] font-extrabold">{term.name}</div>
        <div className="text-[11.5px] opacity-75">{term.credits} cr · {term.hoursPerWeek} h/wk</div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        {term.courses.map((c) => (
          <Link
            key={c.code}
            href={`/course/${c.id}`}
            className="tile flex flex-col gap-1 bg-salt px-3.5 py-3 text-[12.5px] transition-transform duration-[450ms] ease-[var(--ease-brand)] hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-graphite">{c.code}</span>
              <span className="font-mono text-[11px] text-oxblood">{c.pct}%</span>
            </div>
            <div className="font-heading text-[13.5px] font-extrabold leading-tight">{c.name}</div>
            <div className="text-graphite">{c.reason}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
