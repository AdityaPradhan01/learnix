import Link from "next/link";
import { DAYS, DAY_NAMES } from "@/lib/data/constants";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Tile } from "@/components/ui/Tile";
import { Ring } from "@/components/ui/Ring";
import { RemoveButton } from "@/components/saved/RemoveButton";
import type { Course } from "@/lib/scoring";

const GRID_START = 8;
const GRID_END = 18;
const GRID_SPAN = GRID_END - GRID_START;
const HOUR_MARKS = [8, 10, 12, 14, 16, 18];

export function SavedScreen({
  courses,
  offDays,
  hoursBudget,
  savedHours,
  clashes,
  registrationDate,
  registrationLabel,
}: {
  courses: Course[];
  offDays: string[];
  hoursBudget: number;
  savedHours: number;
  clashes: string[];
  registrationDate: string | null;
  registrationLabel: string | null;
}) {
  const formattedDate = registrationDate
    ? new Date(registrationDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div>
      <ScreenHeader kicker="Saved" title="Your saved courses" context={`${courses.length} saved this term`} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Tile tone="pepper" className="flex items-center gap-5 p-6">
          <Ring pct={hoursBudget ? Math.min(100, (savedHours / hoursBudget) * 100) : 0} size={80} label={`${savedHours}h`} />
          <div>
            <div className="font-mono-label text-graphite">Workload</div>
            <div className="text-[13.5px] text-graphite">of {hoursBudget}h weekly budget</div>
          </div>
        </Tile>
        <Tile tone="ink" className="flex items-center gap-5 p-6">
          <div className="font-heading text-[30px] font-extrabold leading-none text-salt">{formattedDate ?? "—"}</div>
          <div>
            <div className="font-mono-label text-silver">Registration</div>
            <div className="text-[13.5px] text-silver">{registrationLabel ?? "No deadline scheduled"}</div>
          </div>
        </Tile>
      </div>

      {clashes.length > 0 && (
        <div className="pill mt-5 flex flex-col gap-1 bg-oxblood px-5 py-3 text-blush">
          {clashes.map((c) => (
            <span key={c} className="text-[13.5px]">⚠ {c}</span>
          ))}
        </div>
      )}

      <div className="tile mt-8 overflow-hidden bg-pepper p-6">
        <div className="grid grid-cols-[48px_repeat(5,1fr)] gap-2">
          <div />
          {DAYS.map((d) => (
            <div key={d} className="text-center font-mono-label text-graphite">{DAY_NAMES[d].slice(0, 3)}</div>
          ))}

          <div className="relative" style={{ height: 400 }}>
            {HOUR_MARKS.map((h) => (
              <span
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[10.5px] text-graphite"
                style={{ top: `${((h - GRID_START) / GRID_SPAN) * 100}%` }}
              >
                {h}:00
              </span>
            ))}
          </div>

          {DAYS.map((d) => {
            const off = offDays.includes(d);
            const blocks = courses.filter((c) => c.days.includes(d));
            return (
              <div
                key={d}
                className="relative rounded-2xl bg-salt"
                style={{
                  height: 400,
                  backgroundImage: off
                    ? "repeating-linear-gradient(45deg, var(--color-stone) 0 6px, var(--color-salt) 6px 12px)"
                    : undefined,
                }}
              >
                {!off &&
                  blocks.map((c) => (
                    <Link
                      key={c.id}
                      href={`/course/${c.id}`}
                      className="absolute inset-x-1 overflow-hidden rounded-xl bg-oxblood px-2 py-1 text-[11px] font-semibold text-blush"
                      style={{
                        top: `${((c.startTime - GRID_START) / GRID_SPAN) * 100}%`,
                        height: `${((c.endTime - c.startTime) / GRID_SPAN) * 100}%`,
                      }}
                    >
                      {c.code}
                    </Link>
                  ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-col divide-y divide-stone/60">
        {courses.length === 0 && (
          <div className="py-8 text-center text-[13.5px] text-graphite">
            Nothing saved yet — explore the catalogue and save a course to see it here.
          </div>
        )}
        {courses.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="font-mono text-[11px] text-graphite">{c.code}</div>
              <Link href={`/course/${c.id}`} className="text-[14.5px] font-extrabold hover:text-oxblood">{c.name}</Link>
              <div className="mt-0.5 text-[12.5px] text-graphite">{c.slot} · {c.hoursPerWeek}h/wk · {c.credits} cr</div>
            </div>
            <RemoveButton courseId={c.id} courseName={c.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
