import type { RankedCourse, ScoredCourse } from "./types";

/**
 * Exclusions applied before ranking (never after): a hidden course, or a
 * course meeting on a day the student marked unavailable, is not "ranked
 * low" — it never appears at all.
 */
export function excludeForHome(
  scored: ScoredCourse[],
  ctx: { hiddenIds: Set<string>; offDays: string[] },
): ScoredCourse[] {
  return scored.filter(({ course }) => {
    if (ctx.hiddenIds.has(course.id)) return false;
    if (course.days.split("").some((d) => ctx.offDays.includes(d))) return false;
    return true;
  });
}

/** Best-match-first ranking with a stable rank number attached. */
export function rankByMatch(scored: ScoredCourse[]): RankedCourse[] {
  return scored
    .slice()
    .sort((a, b) => b.pct - a.pct)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export type SortMode = "Best match" | "Highest rated" | "Lightest workload";
export const SORT_MODES: SortMode[] = ["Best match", "Highest rated", "Lightest workload"];

export function sortScored(scored: ScoredCourse[], mode: SortMode): ScoredCourse[] {
  const arr = scored.slice();
  if (mode === "Highest rated") return arr.sort((a, b) => b.course.rating - a.course.rating);
  if (mode === "Lightest workload") return arr.sort((a, b) => a.course.hoursPerWeek - b.course.hoursPerWeek);
  return arr.sort((a, b) => b.pct - a.pct);
}

export interface ExploreFilters {
  query: string;
  depts: string[];
  maxHours: number;
  days: string[];
}

/** Explore's search/filter set — intentionally does not exclude hidden or
 *  off-day courses; that exclusion is specific to the Home feed. */
export function filterForExplore(scored: ScoredCourse[], filters: ExploreFilters): ScoredCourse[] {
  const q = filters.query.trim().toLowerCase();
  return scored.filter(({ course: c }) => {
    if (q && !`${c.code} ${c.name} ${c.instructorName}`.toLowerCase().includes(q)) return false;
    if (filters.depts.length && !filters.depts.includes(c.dept)) return false;
    if (c.hoursPerWeek > filters.maxHours) return false;
    if (filters.days.length && !c.days.split("").every((d) => filters.days.includes(d))) return false;
    return true;
  });
}

export interface ScheduleBlock {
  code: string;
  days: string;
  startTime: number;
  endTime: number;
}

/**
 * Pairwise schedule-conflict check across saved courses: two courses clash
 * when they share at least one meeting day AND their time ranges overlap.
 */
export function detectClashes(saved: ScheduleBlock[]): string[] {
  const clashes: string[] = [];
  for (let i = 0; i < saved.length; i++) {
    for (let j = i + 1; j < saved.length; j++) {
      const a = saved[i];
      const b = saved[j];
      const sharesDay = a.days.split("").some((d) => b.days.includes(d));
      const overlaps = a.startTime < b.endTime && b.startTime < a.endTime;
      if (sharesDay && overlaps) clashes.push(`${a.code} and ${b.code} overlap`);
    }
  }
  return clashes;
}
