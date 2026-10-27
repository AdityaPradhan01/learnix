import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getCourses,
  getDegreeProgress,
  getSavedCourses,
  getScoringContext,
  getTotalCredits,
} from "@/lib/data/repository";
import { excludeForHome, projectedSkills, scoreCourse, skillGaps } from "@/lib/scoring";
import { ProgressScreen } from "@/components/progress/ProgressScreen";

export const metadata = { title: "Progress — Learnix" };

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [courses, scoring, savedCourses, requirements, totalCredits] = await Promise.all([
    getCourses(),
    getScoringContext(userId),
    getSavedCourses(userId),
    getDegreeProgress(userId),
    getTotalCredits(userId),
  ]);

  const after = projectedSkills(scoring.have, savedCourses);
  const gaps = skillGaps(scoring.have, after, scoring.career);

  const scored = courses.map((c) => scoreCourse(c, scoring.have, scoring.career, scoring.weights, scoring.subscoreContext));
  const takenIds = new Set(scored.filter((s) => scoring.subscoreContext.takenCodes.has(s.course.code)).map((s) => s.course.id));
  const candidates = excludeForHome(scored, { hiddenIds: scoring.hiddenIds, offDays: scoring.offDays }).filter(
    (s) => !scoring.savedIds.has(s.course.id) && !takenIds.has(s.course.id),
  );
  const focusNext = candidates.slice().sort((a, b) => b.subscores.gap - a.subscores.gap)[0];

  const creditsNeeded = requirements.reduce((sum, r) => sum + r.need, 0) || 1;

  return (
    <ProgressScreen
      totalCredits={totalCredits}
      creditsNeeded={creditsNeeded}
      gaps={gaps}
      requirements={requirements}
      focusNext={focusNext}
    />
  );
}
