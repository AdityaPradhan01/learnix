import Link from "next/link";
import { clsx } from "@/lib/clsx";
import type { CourseDetail } from "@/lib/data/repository";
import type { ScoredCourse } from "@/lib/scoring";
import { Ring } from "@/components/ui/Ring";
import { Tile } from "@/components/ui/Tile";
import { Bar } from "@/components/ui/Bar";
import { SaveButton } from "@/components/ui/SaveButton";
import { HideButton } from "@/components/ui/HideButton";

export type DetailTab = "overview" | "syllabus" | "instructor" | "reviews";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "syllabus", label: "Syllabus" },
  { key: "instructor", label: "Instructor" },
  { key: "reviews", label: "Reviews" },
];

const TILE_TONES = ["ink", "pepper", "oxblood"] as const;

const SIGNAL_BG_CLASS: Record<string, string> = {
  goals: "bg-signal-goals",
  gap: "bg-signal-gap",
  history: "bg-signal-history",
  schedule: "bg-signal-schedule",
  cost: "bg-signal-cost",
};

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-heading text-[30px] font-extrabold leading-none">{value}</div>
      <div className="font-mono-label mt-1.5 text-graphite">{label}</div>
    </div>
  );
}

export function CourseDetailScreen({
  scored,
  detail,
  rank,
  totalRanked,
  takenCodes,
  saved,
  hidden,
  activeTab,
}: {
  scored: ScoredCourse;
  detail: CourseDetail;
  rank: number;
  totalRanked: number;
  takenCodes: string[];
  saved: boolean;
  hidden: boolean;
  activeTab: DetailTab;
}) {
  const taken = new Set(takenCodes);
  const c = detail;

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-[13px] text-graphite">
        <Link href="/explore" className="hover:text-ink">Explore</Link>
        <span className="mx-2" aria-hidden>/</span>
        <span className="text-ink">{c.code}</span>
      </nav>

      <div className="dot-grid relative mt-8 flex flex-col items-center text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-20 -top-10 bottom-0"
          style={{ maskImage: "radial-gradient(circle at 50% 30%, black, transparent 70%)" }}
        />
        <div className="relative">
          <div className="font-mono-label text-oxblood">{c.code}</div>
          <h1 className="mx-auto mt-3 max-w-[24ch] text-[clamp(28px,3.6vw,44px)] tracking-[-0.03em]">{c.name}</h1>
          <p className="mx-auto mt-3 max-w-[64ch] text-[15px] leading-[1.6] text-graphite">{c.blurb}</p>

          <div className="mt-8 flex justify-center">
            <Ring pct={scored.pct} size={250} strokeWidth={13} sublabel={scored.band} />
          </div>
          {hidden && (
            <div className="mt-3 font-mono-label text-graphite">Hidden from your recommendations</div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <SaveButton courseId={c.id} courseName={c.name} initialSaved={saved} variant="primary" size="md" />
            <HideButton courseId={c.id} courseName={c.name} size="md" navigateAfter />
          </div>
          {rank > 0 && (
            <div className="mt-3 text-[12.5px] text-graphite">Ranked #{rank} of {totalRanked} for you</div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-[640px] grid-cols-4 gap-4">
        <StatBlock value={c.rating.toFixed(1)} label="Rating" />
        <StatBlock value={`${c.hoursPerWeek}`} label="H / week" />
        <StatBlock value={`${c.credits}`} label="Credits" />
        <StatBlock value={`${c.seats}`} label="Seats left" />
      </div>

      <div className="mt-12 flex justify-center">
        <nav role="tablist" aria-label="Course detail" className="pill inline-flex gap-1 bg-pepper p-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/course/${c.id}?tab=${t.key}`}
              role="tab"
              aria-selected={activeTab === t.key}
              className={clsx(
                "pill px-4 py-[9px] text-[13px] font-semibold",
                activeTab === t.key ? "bg-ink text-salt" : "text-ink/70 hover:text-ink",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-10">
        {activeTab === "overview" && <OverviewTab scored={scored} detail={c} taken={taken} />}
        {activeTab === "syllabus" && <SyllabusTab detail={c} />}
        {activeTab === "instructor" && <InstructorTab detail={c} />}
        {activeTab === "reviews" && <ReviewsTab detail={c} />}
      </div>
    </div>
  );
}

function OverviewTab({ scored, detail, taken }: { scored: ScoredCourse; detail: CourseDetail; taken: Set<string> }) {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-mono-label text-graphite">Why it fits you</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {scored.reasons.map((r, i) => (
            <Tile key={r.text} tone={TILE_TONES[i % TILE_TONES.length]} className="p-6">
              <p className="text-[14px] leading-[1.5]">{r.text}</p>
            </Tile>
          ))}
        </div>
      </div>

      {detail.prerequisites.length > 0 && (
        <div>
          <h2 className="font-mono-label text-graphite">Prerequisite path</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {detail.prerequisites.map((code, i) => (
              <span key={code} className="flex items-center gap-2">
                {i > 0 && <span className="h-px w-6 border-t border-dashed border-stone" aria-hidden />}
                <span
                  className={clsx(
                    "pill flex items-center gap-1.5 px-3.5 py-1.5 text-[12.5px] font-semibold",
                    taken.has(code) ? "bg-ink text-salt" : "border-[1.5px] border-ink/25 text-ink",
                  )}
                >
                  {taken.has(code) && <span aria-hidden>✓</span>} {code}
                </span>
              </span>
            ))}
            <span className="h-px w-6 border-t border-dashed border-stone" aria-hidden />
            <span className="pill bg-oxblood px-3.5 py-1.5 text-[12.5px] font-semibold text-blush">{detail.code}</span>
          </div>
        </div>
      )}

      <details className="tile bg-pepper p-6">
        <summary className="cursor-pointer font-mono-label text-graphite">Score breakdown</summary>
        <div className="mt-5 flex flex-col gap-4">
          {scored.bars.map((b) => (
            <div key={b.key}>
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="font-semibold">{b.label}</span>
                <span className="font-mono text-graphite">{b.raw} raw · {b.weight}% weight · +{b.pts} pts</span>
              </div>
              <Bar pct={b.raw} height={8} className="mt-1.5" fillClassName={SIGNAL_BG_CLASS[b.key]} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function SyllabusTab({ detail }: { detail: CourseDetail }) {
  const total = detail.assessment.reduce((sum, a) => sum + a.percent, 0) || 1;
  const colors = ["bg-ink", "bg-oxblood", "bg-rose", "bg-stone", "bg-graphite"];
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-mono-label text-graphite">Six-week arc</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-6">
          {detail.syllabus.map((topic, i) => (
            <div key={topic} className="tile flex flex-col gap-2 bg-pepper p-4">
              <span className="font-mono text-[11px] text-oxblood">Weeks {i * 2 + 1}–{i * 2 + 2}</span>
              <span className="text-[13px] leading-[1.4]">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-mono-label text-graphite">Grading</h2>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full">
          {detail.assessment.map((a, i) => (
            <span
              key={a.name}
              className={colors[i % colors.length]}
              style={{ width: `${(a.percent / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {detail.assessment.map((a, i) => (
            <div key={a.name} className="flex items-center gap-2 text-[13px]">
              <span className={clsx("h-2.5 w-2.5 rounded-full", colors[i % colors.length])} aria-hidden />
              {a.name} — {a.percent}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstructorTab({ detail }: { detail: CourseDetail }) {
  const initials = detail.instructor.name
    .replace(/^(Dr\.|Prof\.)\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-silver text-[22px] font-extrabold">
        {initials}
      </div>
      <div>
        <div className="text-[19px] font-extrabold">{detail.instructor.name}</div>
        <div className="text-[13.5px] text-graphite">{detail.instructor.role}</div>
      </div>
      <div className="flex gap-6 text-[13px] text-graphite">
        <span>{detail.instructor.rating.toFixed(1)} ★ instructor rating</span>
        <span>{detail.instructor.years} years teaching</span>
      </div>
      <p className="text-[14px] leading-[1.6] text-graphite">{detail.instructor.bio}</p>
    </div>
  );
}

function ReviewsTab({ detail }: { detail: CourseDetail }) {
  const maxDist = Math.max(1, ...detail.ratingDist);
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        <div className="text-center">
          <div className="text-[120px] font-extrabold leading-none">{detail.rating.toFixed(1)}</div>
          <div className="mt-2 text-[13px] text-graphite">{detail.reviewCount} ratings</div>
        </div>
        <div className="flex w-full max-w-[280px] flex-col gap-1.5 pt-4">
          {detail.ratingDist.map((pct, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] text-graphite">
              <span className="w-8 flex-none">{5 - i} ★</span>
              <Bar pct={(pct / maxDist) * 100} height={7} className="flex-1" />
              <span className="w-9 flex-none text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {detail.reviews.map((r, i) => (
          <Tile key={i} tone="pepper" className="flex flex-col gap-2 p-6">
            <span className="text-oxblood" aria-label={`${r.stars} out of 5 stars`}>
              {"★".repeat(r.stars)}
              <span className="text-stone">{"★".repeat(5 - r.stars)}</span>
            </span>
            <p className="text-[13.5px] leading-[1.5]">&ldquo;{r.text}&rdquo;</p>
            <span className="font-mono-label text-graphite">{r.who} · {r.term}</span>
          </Tile>
        ))}
      </div>
    </div>
  );
}
