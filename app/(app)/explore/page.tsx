import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCourses, getSavedCourseIds, getScoringContext } from "@/lib/data/repository";
import { scoreCourse } from "@/lib/scoring";
import { ExploreScreen } from "@/components/explore/ExploreScreen";

export const metadata = { title: "Explore — Learnix" };

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [courses, scoring, savedIds] = await Promise.all([
    getCourses(),
    getScoringContext(userId),
    getSavedCourseIds(userId),
  ]);

  const scored = courses.map((c) => scoreCourse(c, scoring.have, scoring.career, scoring.weights, scoring.subscoreContext));
  const depts = Array.from(new Set(courses.map((c) => c.dept))).sort();

  const maxCourseHours = Math.max(...courses.map((c) => c.hoursPerWeek));

  return (
    <ExploreScreen scored={scored} depts={depts} savedIds={Array.from(savedIds)} maxCourseHours={maxCourseHours} />
  );
}
