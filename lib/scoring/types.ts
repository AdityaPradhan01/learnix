// The recommender's shared vocabulary. See README "How recommendations work"
// for the plain-language version of everything below.

/** The five skill axes every course and every career target is measured on. */
export type SkillAxis = "ml" | "stat" | "sys" | "alg" | "prac";

export const SKILL_AXES: SkillAxis[] = ["ml", "stat", "sys", "alg", "prac"];

export const SKILL_AXIS_LABELS: Record<SkillAxis, string> = {
  ml: "Machine learning",
  stat: "Statistics",
  sys: "Systems",
  alg: "Algorithms",
  prac: "Engineering practice",
};

/** A point in skill-space, 0..1 per axis. */
export type SkillVector = Record<SkillAxis, number>;

export function emptySkillVector(): SkillVector {
  return { ml: 0, stat: 0, sys: 0, alg: 0, prac: 0 };
}

/** The five ranking signals a course is scored on. */
export type SignalKey = "goals" | "gap" | "history" | "schedule" | "cost";

export type Weights = Record<SignalKey, number>;
export type Subscores = Record<SignalKey, number>;

export interface CareerTarget {
  key: string;
  name: string;
  desc: string;
  /** The skill vector this career rewards — courses are matched against it. */
  target: SkillVector;
}

/** A course as the scoring engine sees it — a plain, DB-shape-agnostic
 *  projection built by lib/data/repository.ts from Prisma rows. */
export interface Course {
  id: string;
  code: string;
  dept: string;
  name: string;
  credits: number;
  hoursPerWeek: number;
  days: string;
  startTime: number;
  endTime: number;
  slot: string;
  seats: number;
  capacity: number;
  instructorId: string;
  instructorName: string;
  rating: number;
  reviewCount: number;
  ratingDist: number[];
  sk: SkillVector;
  /** Base subscores the live formulas discount/reward — never the displayed match itself. */
  historyScore: number;
  scheduleScore: number;
  costScore: number;
  historyReason: string;
  scheduleReason: string;
  costReason: string;
  prerequisites: string[];
  blurb: string;
  requirementCategory: string;
}

export interface Contribution {
  key: SignalKey;
  label: string;
  color: string;
  raw: number;
  weight: number;
  pts: number;
}

export type MatchBand = "Great fit" | "Good fit" | "Okay fit";

export interface ScoredCourse {
  course: Course;
  pct: number;
  band: MatchBand;
  /** Whether every prerequisite the student hasn't confirmed is satisfied. */
  preOk: boolean;
  subscores: Subscores;
  contributions: Contribution[];
  topContributions: Contribution[];
  reason: string;
  reasons: { text: string; color: string }[];
  bars: Contribution[];
}

export interface RankedCourse extends ScoredCourse {
  rank: number;
}
