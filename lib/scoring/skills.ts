import { SKILL_AXES, SKILL_AXIS_LABELS, emptySkillVector } from "./types";
import type { CareerTarget, SkillAxis, SkillVector } from "./types";

/**
 * Current skill level, derived only from courses the student has confirmed
 * as taken (TranscriptEntry.confirmed). Each completed course contributes
 * its full skill vector; nothing is assumed. Capped at 1 per axis so one
 * heavy course can't blow past a career target on its own.
 */
export function currentSkills(takenCourses: { sk: SkillVector }[]): SkillVector {
  const have = emptySkillVector();
  for (const c of takenCourses) {
    for (const a of SKILL_AXES) {
      have[a] = Math.min(1, have[a] + c.sk[a]);
    }
  }
  return have;
}

/**
 * Projected skill level if every currently-saved-but-not-yet-taken course
 * were completed. Each saved course contributes a quarter of its skill
 * vector — a saved plan is a bet, not a transcript.
 */
export function projectedSkills(have: SkillVector, savedCourses: { sk: SkillVector }[]): SkillVector {
  const after = { ...have };
  for (const c of savedCourses) {
    for (const a of SKILL_AXES) {
      after[a] = Math.min(1, after[a] + c.sk[a] * 0.25);
    }
  }
  return after;
}

export interface SkillGapRow {
  axis: SkillAxis;
  label: string;
  have: number;
  after: number;
  target: number;
  gap: number;
  status: "On track" | "Some gap" | "Big gap";
}

/** Per-axis progress rows for the Progress screen's skill tiles. */
export function skillGaps(have: SkillVector, after: SkillVector, career: CareerTarget): SkillGapRow[] {
  return SKILL_AXES.map((a) => {
    const haveP = Math.round(have[a] * 100);
    const afterP = Math.round(after[a] * 100);
    const targetP = Math.round(career.target[a] * 100);
    const gap = Math.max(0, targetP - haveP);
    const status: SkillGapRow["status"] = afterP >= targetP ? "On track" : gap > 40 ? "Big gap" : "Some gap";
    return { axis: a, label: SKILL_AXIS_LABELS[a], have: haveP, after: afterP, target: targetP, gap, status };
  });
}
