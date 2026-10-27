import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Bar } from "@/components/ui/Bar";
import type { PlanWarning, TermPlan } from "@/lib/data/path";
import type { RequirementProgress } from "@/lib/data/repository";
import { TermColumn } from "./TermColumn";

export function PathScreen({
  terms,
  requirements,
  warnings,
  hoursBudget,
}: {
  terms: TermPlan[];
  requirements: RequirementProgress[];
  warnings: PlanWarning[];
  hoursBudget: number;
}) {
  const plannedCredits = terms.reduce((sum, t) => sum + t.credits, 0);
  const totalNeeded = requirements.reduce((sum, r) => sum + r.need, 0);

  return (
    <div>
      <ScreenHeader
        kicker="Path"
        title={`${terms.length || 0} terms to graduation`}
        context={`Sequenced so prerequisites resolve and workload stays under ${hoursBudget}h/wk`}
        right={<span className="font-mono text-[12px] text-graphite">{plannedCredits} credits planned · {totalNeeded} required</span>}
      />

      {terms.length === 0 ? (
        <div className="tile bg-pepper p-10 text-center text-[13.5px] text-graphite">
          Nothing left to plan — every remaining requirement is already satisfied.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {terms.map((t) => (
            <TermColumn key={t.name} term={t} />
          ))}
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-mono-label text-graphite">Requirement coverage</h2>
          <div className="mt-4 flex flex-col gap-4">
            {requirements.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-[13px]">
                  <span>{r.name}</span>
                  <span className="font-mono text-graphite">{r.have}/{r.need} cr</span>
                </div>
                <Bar pct={r.pct} height={9} className="mt-1.5" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-mono-label text-graphite">Sequencing warnings</h2>
          <div className="mt-3 flex flex-col">
            {warnings.length === 0 && (
              <div className="py-3 text-[13.5px] text-graphite">No conflicts detected in this plan.</div>
            )}
            {warnings.map((w, i) => (
              <div key={i} className="flex gap-3 border-b border-stone/60 py-2.5 last:border-b-0">
                <span className="pt-0.5 font-mono text-[10.5px] text-oxblood">{w.kind}</span>
                <span className="text-[13px] leading-[1.45]">{w.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
