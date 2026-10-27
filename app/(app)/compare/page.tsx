import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCourses, getProfile, getScoringContext } from "@/lib/data/repository";
import { scoreCourse } from "@/lib/scoring";
import { CompareScreen } from "@/components/compare/CompareScreen";

export const metadata = { title: "Compare — Learnix" };

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const { a, b } = await searchParams;
  const [courses, scoring, profile] = await Promise.all([
    getCourses(),
    getScoringContext(userId),
    getProfile(userId),
  ]);
  const scored = courses.map((c) => scoreCourse(c, scoring.have, scoring.career, scoring.weights, scoring.subscoreContext));

  const ids = scored.map((s) => s.course.id);
  const initialA = a && ids.includes(a) ? a : (ids[0] ?? "");
  const defaultB = ids.find((id) => id !== initialA) ?? initialA;
  const initialB = b && ids.includes(b) && b !== initialA ? b : defaultB;

  return <CompareScreen scored={scored} initialA={initialA} initialB={initialB} hoursBudget={profile.hours} />;
}
