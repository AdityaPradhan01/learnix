import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCourses, getDegreeProgress, getScoringContext } from "@/lib/data/repository";
import { scoreCourse } from "@/lib/scoring";
import { buildTermPlan } from "@/lib/data/path";
import { PathScreen } from "@/components/path/PathScreen";

export const metadata = { title: "Path — Learnix" };

export default async function PathPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [courses, scoring, requirements] = await Promise.all([
    getCourses(),
    getScoringContext(userId),
    getDegreeProgress(userId),
  ]);

  const scored = courses.map((c) => scoreCourse(c, scoring.have, scoring.career, scoring.weights, scoring.subscoreContext));
  const { terms, warnings } = buildTermPlan(scored, scoring.subscoreContext.takenCodes, scoring.subscoreContext.hours, 4);

  return <PathScreen terms={terms} requirements={requirements} warnings={warnings} hoursBudget={scoring.subscoreContext.hours} />;
}
