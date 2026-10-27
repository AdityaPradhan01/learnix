import type { ScoredCourse } from "../scoring/types";
import { detectClashes } from "../scoring/candidates";

/**
 * A greedy multi-term planner: each term, take the highest-match courses
 * whose prerequisites are already satisfied, up to a credit cap and the
 * student's weekly-hour budget, then move to the next term. Not a fixture —
 * it runs over whatever courses and match scores the student actually has.
 */

export interface PlannedCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  hoursPerWeek: number;
  pct: number;
  reason: string;
}

export interface TermPlan {
  name: string;
  credits: number;
  hoursPerWeek: number;
  current: boolean;
  courses: PlannedCourse[];
}

export type WarningKind = "ORDER" | "LOAD" | "CONFLICT" | "OFFERING";

export interface PlanWarning {
  kind: WarningKind;
  text: string;
}

const CREDIT_CAP_PER_TERM = 18;
const TERM_NAMES = ["This term", "Next term", "Term after", "Final planned term"];

export function buildTermPlan(
  scored: ScoredCourse[],
  takenCodes: Set<string>,
  hoursBudget: number,
  termCount = 4,
): { terms: TermPlan[]; warnings: PlanWarning[] } {
  const remaining = scored.filter((s) => !takenCodes.has(s.course.code)).sort((a, b) => b.pct - a.pct);
  const scheduledCodes = new Set(takenCodes);
  const pool = remaining.slice();
  const terms: TermPlan[] = [];
  const warnings: PlanWarning[] = [];

  for (let i = 0; i < termCount && pool.length; i++) {
    const termName = TERM_NAMES[i] ?? `Term ${i + 1}`;
    const termCourses: ScoredCourse[] = [];
    let credits = 0;
    let hours = 0;

    for (let j = 0; j < pool.length; ) {
      const candidate = pool[j];
      const prereqsReady = candidate.course.prerequisites.every(
        (code) => !remaining.some((r) => r.course.code === code) || scheduledCodes.has(code),
      );
      const fitsCredits = credits + candidate.course.credits <= CREDIT_CAP_PER_TERM;
      const fitsHours = hours + candidate.course.hoursPerWeek <= hoursBudget;

      if (prereqsReady && fitsCredits && fitsHours) {
        termCourses.push(candidate);
        credits += candidate.course.credits;
        hours += candidate.course.hoursPerWeek;
        pool.splice(j, 1);
      } else {
        j++;
      }
    }

    // Nothing schedulable this term — remaining courses are blocked on
    // prerequisites further out than the planning window. Stop rather than
    // looping through empty terms.
    if (termCourses.length === 0) break;

    detectClashes(
      termCourses.map((c) => ({ code: c.course.code, days: c.course.days, startTime: c.course.startTime, endTime: c.course.endTime })),
    ).forEach((text) => warnings.push({ kind: "CONFLICT", text: `${text}, both scheduled in ${termName}.` }));

    if (hours > hoursBudget * 0.9) {
      warnings.push({ kind: "LOAD", text: `${termName} reaches ${hours}h/wk, close to your ${hoursBudget}h budget.` });
    }

    termCourses.forEach((c) => scheduledCodes.add(c.course.code));
    terms.push({
      name: termName,
      credits,
      hoursPerWeek: hours,
      current: i === 0,
      courses: termCourses.map((c) => ({
        id: c.course.id,
        code: c.course.code,
        name: c.course.name,
        credits: c.course.credits,
        hoursPerWeek: c.course.hoursPerWeek,
        pct: c.pct,
        reason: c.reason,
      })),
    });
  }

  if (pool.length > 0) {
    warnings.push({
      kind: "OFFERING",
      text: `${pool.length} more course${pool.length === 1 ? "" : "s"} couldn't be scheduled in ${termCount} terms — their prerequisite chain runs longer than the planning window.`,
    });
  }

  return { terms, warnings };
}
