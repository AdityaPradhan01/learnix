import Link from "next/link";
import { Tile } from "@/components/ui/Tile";
import { Ring } from "@/components/ui/Ring";
import { LinkButton } from "@/components/ui/Button";
import { SaveButton } from "@/components/ui/SaveButton";
import { Reveal } from "@/components/ui/Reveal";
import type { RankedCourse } from "@/lib/scoring";
import type { SkillGapRow } from "@/lib/scoring/skills";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen({
  studentName,
  hero,
  rail,
  savedIds,
  daysToRegistration,
  registrationLabel,
  biggestGap,
  savedHours,
  hoursBudget,
}: {
  studentName: string;
  hero?: RankedCourse;
  rail: RankedCourse[];
  savedIds: Set<string>;
  daysToRegistration: number | null;
  registrationLabel: string | null;
  biggestGap?: SkillGapRow;
  savedHours: number;
  hoursBudget: number;
}) {
  const firstName = studentName.split(" ")[0];

  return (
    <div>
      <Reveal variant="up" className="text-center">
        <div className="font-mono-label text-oxblood">Home</div>
        <h1 className="mt-2 text-[clamp(28px,3.6vw,44px)] tracking-[-0.03em]">
          {greeting()}, {firstName}.
        </h1>
      </Reveal>

      {hero ? (
        <Reveal variant="rise" className="mt-10">
          <div className="tile-hero grid overflow-hidden shadow-hero md:grid-cols-[1fr_320px]">
            <div className="bg-ink p-9 text-salt">
              <div className="font-mono-label text-rose">Best fit for you</div>
              <div className="mt-3 font-mono text-[12px] text-silver">{hero.course.code}</div>
              <h2 className="mt-1 text-[26px] font-extrabold leading-tight">{hero.course.name}</h2>
              <div className="mt-1.5 text-[13.5px] text-silver">
                {hero.course.instructorName} · {hero.course.slot}
              </div>
              <ul className="mt-6 flex flex-col gap-2.5">
                {hero.reasons.map((r) => (
                  <li key={r.text} className="flex items-start gap-2 text-[13.5px] text-blush/90">
                    <span aria-hidden className="mt-1" style={{ color: r.color }}>●</span>
                    {r.text}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex items-center gap-3">
                <LinkButton href={`/course/${hero.course.id}`} variant="dark">Learn more</LinkButton>
                <SaveButton
                  courseId={hero.course.id}
                  courseName={hero.course.name}
                  initialSaved={savedIds.has(hero.course.id)}
                  variant="secondary"
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 bg-oxblood py-10 text-blush">
              <Ring pct={hero.pct} size={200} strokeWidth={11} color="var(--color-blush)" trackColor="rgba(243,228,230,.25)" />
              <div className="font-mono-label text-blush/85">{hero.band}</div>
            </div>
          </div>
        </Reveal>
      ) : (
        <Tile tone="pepper" className="mt-10 p-9 text-center text-graphite">
          No courses match your current filters — adjust your off days or weights in Settings.
        </Tile>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Reveal variant="grow">
          <Tile tone="pepper" className="flex h-full flex-col gap-2 p-7">
            <div className="font-mono-label text-graphite">Registration</div>
            <div className="mt-2 text-[44px] font-extrabold leading-none">
              {daysToRegistration ?? "—"}
            </div>
            <div className="text-[13px] text-graphite">
              {daysToRegistration != null ? `days until ${registrationLabel?.toLowerCase() ?? "registration"}` : "No deadline scheduled"}
            </div>
          </Tile>
        </Reveal>

        <Reveal variant="grow" delay={0.06}>
          <Tile tone="ink" className="flex h-full flex-col items-center gap-3 p-7 text-center">
            <div className="font-mono-label self-start text-silver">Biggest skill gap</div>
            {biggestGap ? (
              <>
                <Ring pct={biggestGap.have} secondaryPct={biggestGap.target} secondaryColor="var(--color-rose)" size={112} color="var(--color-blush)" trackColor="var(--color-charcoal)" />
                <div className="text-[13.5px] text-blush">{biggestGap.label}</div>
              </>
            ) : (
              <div className="text-[13.5px] text-silver">On track across every axis.</div>
            )}
          </Tile>
        </Reveal>

        <Reveal variant="grow" delay={0.12}>
          <Tile tone="pepper" className="flex h-full flex-col items-center gap-3 p-7 text-center">
            <div className="font-mono-label self-start text-graphite">Saved vs. budget</div>
            <Ring
              pct={hoursBudget ? Math.min(100, (savedHours / hoursBudget) * 100) : 0}
              size={112}
              color="var(--color-oxblood)"
              label={`${savedHours}h`}
            />
            <div className="text-[13.5px] text-graphite">of {hoursBudget}h weekly budget</div>
          </Tile>
        </Reveal>
      </div>

      {rail.length > 0 && (
        <div className="mt-14">
          <h2 className="font-mono-label text-graphite">More for you</h2>
          <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
            {rail.map((r) => (
              <Link
                key={r.course.id}
                href={`/course/${r.course.id}`}
                className="tile group flex w-[240px] flex-none snap-start flex-col gap-3 bg-pepper p-5 transition-transform duration-[450ms] ease-[var(--ease-brand)] hover:-translate-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Ring pct={r.pct} size={52} strokeWidth={5} showLabel={false} />
                  <span className="font-mono text-[13px] font-semibold">{r.pct}%</span>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-graphite">{r.course.code}</div>
                  <div className="mt-0.5 text-[14.5px] font-extrabold leading-tight">{r.course.name}</div>
                </div>
                <div className="text-[12.5px] text-graphite line-clamp-2">{r.reason}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
