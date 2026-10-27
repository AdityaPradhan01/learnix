import type { ScoredCourse } from "./scoring/types";

export interface CompareRow {
  label: string;
  a: string;
  b: string;
  aWins: boolean;
  bWins: boolean;
}

function row(label: string, a: string, b: string, aWins: boolean, bWins: boolean): CompareRow {
  return { label, a, b, aWins, bWins };
}

/** The compare screen's scorecard, built from two already-scored courses. */
export function buildCompareRows(a: ScoredCourse, b: ScoredCourse): CompareRow[] {
  const sa = a.subscores;
  const sb = b.subscores;
  return [
    row("Match", `${a.pct}%`, `${b.pct}%`, a.pct > b.pct, b.pct > a.pct),
    row("Credits", `${a.course.credits} cr`, `${b.course.credits} cr`, a.course.credits > b.course.credits, b.course.credits > a.course.credits),
    row("Weekly hours", `${a.course.hoursPerWeek} h`, `${b.course.hoursPerWeek} h`, a.course.hoursPerWeek < b.course.hoursPerWeek, b.course.hoursPerWeek < a.course.hoursPerWeek),
    row("Meets", a.course.slot, b.course.slot, false, false),
    row("Instructor", a.course.instructorName, b.course.instructorName, false, false),
    row("Career goal", String(sa.goals), String(sb.goals), sa.goals > sb.goals, sb.goals > sa.goals),
    row("Skill gap", String(sa.gap), String(sb.gap), sa.gap > sb.gap, sb.gap > sa.gap),
    row("Past courses", String(sa.history), String(sb.history), sa.history > sb.history, sb.history > sa.history),
    row("Schedule fit", String(sa.schedule), String(sb.schedule), sa.schedule > sb.schedule, sb.schedule > sa.schedule),
    row("Credit value", String(sa.cost), String(sb.cost), sa.cost > sb.cost, sb.cost > sa.cost),
    row("Top reason", a.reason, b.reason, false, false),
    row("Requirement", a.course.requirementCategory, b.course.requirementCategory, false, false),
  ];
}

export function compareVerdict(a: ScoredCourse, b: ScoredCourse, hoursBudget: number): string {
  const leader = a.pct >= b.pct ? a : b;
  const trailer = a.pct >= b.pct ? b : a;
  const together = a.course.hoursPerWeek + b.course.hoursPerWeek;
  const fits =
    together <= hoursBudget
      ? `Both fit inside your ${hoursBudget}h weekly budget, so taking them together is feasible.`
      : `Together they need ${together}h/wk, over your ${hoursBudget}h budget — pick one.`;
  return `${leader.course.code} scores higher under your current weights (${leader.pct}% vs ${trailer.pct}%). ${fits}`;
}
