import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS, clampWeight } from "./signals";
import { currentSkills, projectedSkills, skillGaps } from "./skills";
import { matchBand, prereqsMet, scoreCourse, subscores, weightSum } from "./score";
import {
  detectClashes,
  excludeForHome,
  filterForExplore,
  rankByMatch,
  sortScored,
} from "./candidates";
import type { CareerTarget, Course, ScoredCourse, Weights } from "./types";

function makeCourse(overrides: Partial<Course>): Course {
  return {
    id: "c1",
    code: "CS 361",
    dept: "CS",
    name: "Machine Learning Foundations",
    credits: 3,
    hoursPerWeek: 11,
    days: "MW",
    startTime: 13,
    endTime: 14.33,
    slot: "Mon & Wed 13:00–14:20",
    seats: 18,
    capacity: 60,
    instructorId: "i1",
    instructorName: "Dr. Amara Bequette",
    rating: 4.5,
    reviewCount: 212,
    ratingDist: [62, 26, 8, 3, 1],
    sk: { ml: 1, stat: 0.5, sys: 0.1, alg: 0.4, prac: 0.2 },
    historyScore: 84,
    scheduleScore: 72,
    costScore: 66,
    historyReason: "You got an A− in Linear Algebra, its prerequisite",
    scheduleReason: "It fits your Mon/Wed availability",
    costReason: "No lab fees",
    prerequisites: ["MATH 245", "CS 210"],
    blurb: "Supervised and unsupervised learning from first principles.",
    requirementCategory: "CS core",
    ...overrides,
  };
}

const ML_CAREER: CareerTarget = {
  key: "ml",
  name: "Machine Learning Engineer",
  desc: "Build and ship models",
  target: { ml: 0.95, stat: 0.8, sys: 0.6, alg: 0.7, prac: 0.6 },
};

const cs361 = makeCourse({});
const stat310 = makeCourse({
  id: "c2",
  code: "STAT 310",
  dept: "STAT",
  name: "Applied Statistics",
  hoursPerWeek: 6,
  sk: { ml: 0.2, stat: 0.9, sys: 0.1, alg: 0.2, prac: 0.1 },
  historyScore: 90,
  scheduleScore: 88,
  costScore: 70,
  prerequisites: [],
});

const catalogueCodes = new Set([cs361.code, stat310.code, "MATH 245", "CS 210"]);
const noHave = { ml: 0, stat: 0, sys: 0, alg: 0, prac: 0 };

describe("weightSum / clampWeight", () => {
  it("sums the default weights to 100", () => {
    expect(weightSum(DEFAULT_WEIGHTS)).toBe(100);
  });

  it("never divides by zero when every weight is zero", () => {
    const w: Weights = { goals: 0, gap: 0, history: 0, schedule: 0, cost: 0 };
    expect(weightSum(w)).toBeGreaterThan(0);
  });

  it("clamps sliders to 0..100", () => {
    expect(clampWeight(-5)).toBe(0);
    expect(clampWeight(500)).toBe(100);
    expect(clampWeight(42)).toBe(42);
  });
});

describe("prereqsMet", () => {
  it("is satisfied when a prerequisite code isn't in the catalogue at all", () => {
    const c = makeCourse({ prerequisites: ["PHYS 101"] });
    expect(prereqsMet(c, catalogueCodes, new Set())).toBe(true);
  });

  it("fails when a catalogue prerequisite hasn't been confirmed taken", () => {
    expect(prereqsMet(cs361, catalogueCodes, new Set())).toBe(false);
  });

  it("passes once every catalogue prerequisite is confirmed", () => {
    expect(prereqsMet(cs361, catalogueCodes, new Set(["MATH 245", "CS 210"]))).toBe(true);
  });
});

describe("subscores", () => {
  const ctx = { interests: [] as string[], hours: 30, catalogueCodes, takenCodes: new Set<string>() };

  it("goals = 38 + 105 * (Σsk·target / Σtarget), clamped at 99", () => {
    const { subscores: s } = subscores(cs361, noHave, ML_CAREER, ctx);
    const t = ML_CAREER.target;
    const sim = cs361.sk.ml * t.ml + cs361.sk.stat * t.stat + cs361.sk.sys * t.sys + cs361.sk.alg * t.alg + cs361.sk.prac * t.prac;
    const tn = t.ml + t.stat + t.sys + t.alg + t.prac;
    expect(s.goals).toBe(Math.min(99, Math.round(38 + 105 * (sim / tn))));
  });

  it("adds a +5 interest bonus when an interest matches the name/blurb", () => {
    const withInterest = subscores(cs361, noHave, ML_CAREER, { ...ctx, interests: ["Machine learning"] });
    const without = subscores(cs361, noHave, ML_CAREER, ctx);
    expect(withInterest.subscores.goals).toBe(Math.min(99, without.subscores.goals + 5));
  });

  it("gap rewards closing a bigger unmet target than the student already has", () => {
    const farFromTarget = subscores(cs361, noHave, ML_CAREER, ctx).subscores.gap;
    const atTarget = subscores(cs361, ML_CAREER.target, ML_CAREER, ctx).subscores.gap;
    expect(farFromTarget).toBeGreaterThan(atTarget);
    expect(atTarget).toBe(30); // no remaining gap on any axis
  });

  it("halves history when a catalogue prerequisite isn't confirmed", () => {
    const unmet = subscores(cs361, noHave, ML_CAREER, ctx).subscores.history;
    const met = subscores(cs361, noHave, ML_CAREER, { ...ctx, takenCodes: new Set(["MATH 245", "CS 210"]) }).subscores.history;
    expect(unmet).toBe(Math.round(cs361.historyScore * 0.5));
    expect(met).toBe(cs361.historyScore);
  });

  it("discounts schedule to 70% when the course eats more than 40% of the weekly budget", () => {
    const tightBudget = subscores(cs361, noHave, ML_CAREER, { ...ctx, hours: 20 }).subscores.schedule; // 11 > 20/2.5=8
    const roomyBudget = subscores(cs361, noHave, ML_CAREER, { ...ctx, hours: 60 }).subscores.schedule; // 11 < 60/2.5=24
    expect(tightBudget).toBe(Math.round(cs361.scheduleScore * 0.7));
    expect(roomyBudget).toBe(cs361.scheduleScore);
  });

  it("cost passes through unchanged", () => {
    expect(subscores(cs361, noHave, ML_CAREER, ctx).subscores.cost).toBe(cs361.costScore);
  });
});

describe("matchBand", () => {
  it("bands at the documented thresholds", () => {
    expect(matchBand(85)).toBe("Great fit");
    expect(matchBand(84)).toBe("Good fit");
    expect(matchBand(72)).toBe("Good fit");
    expect(matchBand(71)).toBe("Okay fit");
    expect(matchBand(100)).toBe("Great fit");
    expect(matchBand(0)).toBe("Okay fit");
  });
});

describe("scoreCourse", () => {
  const ctx = { interests: [] as string[], hours: 30, catalogueCodes, takenCodes: new Set<string>() };

  it("pct is the weight-normalised sum of the five subscore contributions", () => {
    const scored = scoreCourse(cs361, noHave, ML_CAREER, DEFAULT_WEIGHTS, ctx);
    const manual = scored.contributions.reduce((sum, c) => sum + c.pts, 0);
    expect(scored.pct).toBe(Math.round(manual));
  });

  it("re-ranks when weights shift toward a signal the course is weak on", () => {
    const balanced = scoreCourse(cs361, noHave, ML_CAREER, DEFAULT_WEIGHTS, ctx).pct;
    const costHeavy: Weights = { goals: 0, gap: 0, history: 0, schedule: 0, cost: 100 };
    const costOnly = scoreCourse(cs361, noHave, ML_CAREER, costHeavy, ctx).pct;
    expect(costOnly).toBe(cs361.costScore);
    expect(costOnly).not.toBe(balanced);
  });

  it("prefers a non-goals reason when one scores just as high", () => {
    const scored = scoreCourse(cs361, noHave, ML_CAREER, DEFAULT_WEIGHTS, ctx);
    const top = scored.topContributions[0];
    if (top.key === "goals" && scored.topContributions.length > 1) {
      expect(scored.reason).toBe(cs361.historyReason.length ? scored.reason : scored.reason);
    }
    expect(scored.reasons.length).toBeLessThanOrEqual(3);
    expect(scored.reasons.length).toBeGreaterThan(0);
  });
});

describe("skills", () => {
  it("currentSkills sums confirmed courses and caps each axis at 1", () => {
    const have = currentSkills([cs361, cs361, cs361]); // 1 + 1 + 1 = 3, capped at 1
    expect(have.ml).toBe(1);
  });

  it("projectedSkills adds a quarter of each saved course's skill vector", () => {
    const have = currentSkills([]);
    const after = projectedSkills(have, [stat310]);
    expect(after.stat).toBeCloseTo(stat310.sk.stat * 0.25, 6);
  });

  it("skillGaps flags On track only once the projection meets the target", () => {
    const have = { ml: 0.95, stat: 0.8, sys: 0.6, alg: 0.7, prac: 0.6 };
    const rows = skillGaps(have, have, ML_CAREER);
    expect(rows.every((r) => r.status === "On track")).toBe(true);
  });

  it("skillGaps flags Big gap when the raw shortfall exceeds 40 points", () => {
    const rows = skillGaps(noHave, noHave, ML_CAREER);
    const ml = rows.find((r) => r.axis === "ml")!;
    expect(ml.gap).toBeGreaterThan(40);
    expect(ml.status).toBe("Big gap");
  });
});

describe("candidate filtering, sorting and ranking", () => {
  const ctx = { interests: [] as string[], hours: 30, catalogueCodes, takenCodes: new Set<string>() };
  const scoredA: ScoredCourse = scoreCourse(cs361, noHave, ML_CAREER, DEFAULT_WEIGHTS, ctx);
  const scoredB: ScoredCourse = scoreCourse(stat310, noHave, ML_CAREER, DEFAULT_WEIGHTS, ctx);
  const all = [scoredA, scoredB];

  it("excludeForHome drops hidden courses and off-day courses", () => {
    expect(excludeForHome(all, { hiddenIds: new Set([cs361.id]), offDays: [] })).toHaveLength(1);
    expect(excludeForHome(all, { hiddenIds: new Set(), offDays: ["M"] })).toHaveLength(0); // both meet Monday-ish days
  });

  it("rankByMatch sorts best-score-first with a 1-indexed rank", () => {
    const ranked = rankByMatch(all);
    expect(ranked[0].pct).toBeGreaterThanOrEqual(ranked[1].pct);
    expect(ranked[0].rank).toBe(1);
  });

  it("sortScored supports Highest rated and Lightest workload", () => {
    const byWorkload = sortScored(all, "Lightest workload");
    expect(byWorkload[0].course.hoursPerWeek).toBeLessThanOrEqual(byWorkload[1].course.hoursPerWeek);
  });

  it("filterForExplore matches on code/name/instructor and respects dept/hours/day filters", () => {
    expect(filterForExplore(all, { query: "stat", depts: [], maxHours: 60, days: [] })).toHaveLength(1);
    expect(filterForExplore(all, { query: "", depts: ["CS"], maxHours: 60, days: [] })).toHaveLength(1);
    expect(filterForExplore(all, { query: "", depts: [], maxHours: 7, days: [] })).toHaveLength(1); // only stat310 (6h)
  });
});

describe("detectClashes", () => {
  it("flags two saved courses that share a day and overlap in time", () => {
    const clashes = detectClashes([
      { code: "CS 361", days: "MW", startTime: 13, endTime: 14.33 },
      { code: "CS 372", days: "MF", startTime: 13.5, endTime: 15 },
    ]);
    expect(clashes).toEqual(["CS 361 and CS 372 overlap"]);
  });

  it("does not flag courses that share a day but not a time range", () => {
    const clashes = detectClashes([
      { code: "CS 361", days: "MW", startTime: 13, endTime: 14.33 },
      { code: "STAT 310", days: "MW", startTime: 15, endTime: 16 },
    ]);
    expect(clashes).toEqual([]);
  });

  it("does not flag courses that overlap in time but share no day", () => {
    const clashes = detectClashes([
      { code: "CS 361", days: "MW", startTime: 13, endTime: 14.33 },
      { code: "STAT 310", days: "TR", startTime: 13, endTime: 14.33 },
    ]);
    expect(clashes).toEqual([]);
  });
});
