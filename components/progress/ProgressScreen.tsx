import Link from "next/link";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Tile } from "@/components/ui/Tile";
import { Ring } from "@/components/ui/Ring";
import { Bar } from "@/components/ui/Bar";
import { Tag } from "@/components/ui/Tag";
import type { RequirementProgress } from "@/lib/data/repository";
import type { SkillGapRow } from "@/lib/scoring/skills";
import type { ScoredCourse } from "@/lib/scoring";

const STATUS_TONE: Record<SkillGapRow["status"], "neutral" | "accent" | "dark"> = {
  "On track": "dark",
  "Some gap": "neutral",
  "Big gap": "accent",
};

export function ProgressScreen({
  totalCredits,
  creditsNeeded,
  gaps,
  requirements,
  focusNext,
}: {
  totalCredits: number;
  creditsNeeded: number;
  gaps: SkillGapRow[];
  requirements: RequirementProgress[];
  focusNext?: ScoredCourse;
}) {
  return (
    <div>
      <ScreenHeader kicker="Progress" title="Where you stand" context="Credits, skill gaps and what's left to graduate." />

      <div className="dot-grid flex flex-col items-center py-4 text-center">
        <Ring
          pct={Math.min(100, (totalCredits / creditsNeeded) * 100)}
          size={280}
          strokeWidth={14}
          label={`${totalCredits}`}
          sublabel={`of ${creditsNeeded} credits`}
        />
      </div>

      <div className="mt-14">
        <h2 className="font-mono-label text-graphite">Skills</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {gaps.map((g) => (
            <Tile key={g.axis} tone="pepper" className="flex flex-col items-center gap-3 p-5 text-center">
              <Ring pct={g.have} secondaryPct={g.after} size={88} strokeWidth={7} showLabel={false} />
              <div className="text-[13px] font-semibold leading-tight">{g.label}</div>
              <Tag variant={STATUS_TONE[g.status]}>{g.status}</Tag>
            </Tile>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Tile tone="pepper" className="p-7">
          <h2 className="font-mono-label text-graphite">Degree requirements</h2>
          <div className="mt-5 flex flex-col gap-4">
            {requirements.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-[13.5px]">
                  <span className="font-semibold">{r.name}</span>
                  <span className="font-mono text-graphite">{r.have}/{r.need} cr</span>
                </div>
                <Bar pct={r.pct} height={9} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Tile>

        <Tile tone="oxblood" className="flex flex-col gap-3 p-7">
          <div className="font-mono-label text-blush/80">Focus next</div>
          {focusNext ? (
            <>
              <div className="text-[18px] font-extrabold leading-tight">{focusNext.course.name}</div>
              <p className="text-[13.5px] leading-[1.5] text-blush/90">{focusNext.reason}</p>
              <Link href={`/course/${focusNext.course.id}`} className="mt-2 text-[13.5px] font-semibold text-blush underline underline-offset-4">
                View course
              </Link>
            </>
          ) : (
            <p className="text-[13.5px] text-blush/90">You&apos;re on track across every open skill gap.</p>
          )}
        </Tile>
      </div>
    </div>
  );
}
