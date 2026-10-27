import { SIGNALS } from "./signals";
import { SKILL_AXES, SKILL_AXIS_LABELS } from "./types";
import type {
  CareerTarget,
  Contribution,
  Course,
  MatchBand,
  ScoredCourse,
  SignalKey,
  SkillAxis,
  SkillVector,
  Subscores,
  Weights,
} from "./types";

function clampSubscore(n: number): number {
  return Math.min(99, Math.round(n));
}

/**
 * A course's prerequisites are satisfied when, for every prerequisite code,
 * either no catalogue course carries that code (nothing to check against)
 * or the student has confirmed a transcript entry for it.
 */
export function prereqsMet(course: Course, catalogueCodes: Set<string>, takenCodes: Set<string>): boolean {
  return course.prerequisites.every((code) => !catalogueCodes.has(code) || takenCodes.has(code));
}

export interface SubscoreContext {
  interests: string[];
  /** Weekly study-hour budget the student set in onboarding. */
  hours: number;
  catalogueCodes: Set<string>;
  takenCodes: Set<string>;
}

/**
 * The four live subscores (goals, gap, history, schedule) plus the mostly-
 * static cost subscore. This is the content-based half of the recommender:
 * `goals` rewards courses whose skill vector aligns with the career target
 * (a weighted-cosine-style similarity); `gap` weights that same alignment
 * by how far the student's current skills fall short of the target, so a
 * course that closes a bigger, more numerous gap scores higher than one
 * that just repeats a skill the student already has.
 */
export function subscores(
  course: Course,
  have: SkillVector,
  career: CareerTarget,
  ctx: SubscoreContext,
): { subscores: Subscores; preOk: boolean } {
  const target = career.target;
  let sim = 0;
  let targetSum = 0;
  let gapWeighted = 0;
  let gapSum = 0;

  for (const axis of SKILL_AXES) {
    sim += course.sk[axis] * target[axis];
    targetSum += target[axis];
    const gap = Math.max(0, target[axis] - have[axis]);
    gapWeighted += course.sk[axis] * gap;
    gapSum += gap;
  }

  const haystack = `${course.name} ${course.blurb}`.toLowerCase();
  const interestBonus = ctx.interests.some((interest) =>
    haystack.includes(interest.toLowerCase().slice(0, 6)),
  )
    ? 5
    : 0;

  const preOk = prereqsMet(course, ctx.catalogueCodes, ctx.takenCodes);

  const goals = clampSubscore(38 + 105 * (targetSum ? sim / targetSum : 0) + interestBonus);
  const gap = clampSubscore(30 + 140 * (gapWeighted / (gapSum || 1)));
  const history = preOk ? course.historyScore : Math.round(course.historyScore * 0.5);
  const schedule =
    course.hoursPerWeek > ctx.hours / 2.5 ? Math.round(course.scheduleScore * 0.7) : course.scheduleScore;
  const cost = course.costScore;

  return { subscores: { goals, gap, history, schedule, cost }, preOk };
}

/** Sum of all five weights, guarded against an all-zero slider set. */
export function weightSum(weights: Weights): number {
  return SIGNALS.reduce((sum, s) => sum + Math.max(0, weights[s.key] || 0), 0) || 1;
}

export function matchBand(pct: number): MatchBand {
  if (pct >= 85) return "Great fit";
  if (pct >= 72) return "Good fit";
  return "Okay fit";
}

/** The skill axis this course leans on hardest for the chosen career — drives reason text. */
export function dominantAxis(course: Course, career: CareerTarget): SkillAxis {
  return SKILL_AXES.slice().sort(
    (a, b) => course.sk[b] * career.target[b] - course.sk[a] * career.target[a],
  )[0];
}

function reasonMap(course: Course, career: CareerTarget): Record<SignalKey, string> {
  const axisLabel = SKILL_AXIS_LABELS[dominantAxis(course, career)];
  return {
    goals: `It builds ${axisLabel.toLowerCase()}, which your goal needs`,
    gap: `${axisLabel} is one of your biggest gaps`,
    history: course.historyReason,
    schedule: course.scheduleReason,
    cost: course.costReason,
  };
}

/**
 * The full explainable score for one course: subscores, the weighted-
 * normalised match percentage, its band, and plain-language reasons.
 * `match% = Σ(subscore[k] × weight[k]) / Σweight[k]` — weights are
 * normalised on every read, so a slider set that doesn't sum to 100 still
 * produces a 0-100 match.
 */
export function scoreCourse(
  course: Course,
  have: SkillVector,
  career: CareerTarget,
  weights: Weights,
  ctx: SubscoreContext,
): ScoredCourse {
  const { subscores: s, preOk } = subscores(course, have, career, ctx);
  const total = weightSum(weights);

  const contributions: Contribution[] = SIGNALS.map((sig) => {
    const w = Math.max(0, weights[sig.key] || 0);
    return {
      key: sig.key,
      label: sig.label,
      color: sig.color,
      raw: s[sig.key],
      weight: Math.round((w / total) * 100),
      pts: (s[sig.key] * w) / total,
    };
  });

  const pct = Math.round(contributions.reduce((sum, c) => sum + c.pts, 0));
  const band = matchBand(pct);
  const why = reasonMap(course, career);
  const topContributions = contributions.slice().sort((a, b) => b.pts - a.pts);
  const primary = topContributions.find((c) => c.key !== "goals") ?? topContributions[0];

  return {
    course,
    pct,
    band,
    preOk,
    subscores: s,
    contributions,
    topContributions,
    reason: why[primary.key],
    reasons: topContributions.slice(0, 3).map((c) => ({ text: why[c.key], color: c.color })),
    bars: contributions.map((c) => ({ ...c, pts: Math.round(c.pts) })),
  };
}
