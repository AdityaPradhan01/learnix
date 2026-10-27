import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCourseDetail, getCourses, getScoringContext } from "@/lib/data/repository";
import { rankByMatch, scoreCourse } from "@/lib/scoring";
import { CourseDetailScreen, type DetailTab } from "@/components/course/CourseDetailScreen";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourseDetail(id);
  return { title: course ? `${course.code} — Learnix` : "Course — Learnix" };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const { id } = await params;
  const { tab } = await searchParams;

  const [course, scoring, allCourses] = await Promise.all([
    getCourseDetail(id),
    getScoringContext(userId),
    getCourses(),
  ]);
  if (!course) notFound();

  const scored = scoreCourse(course, scoring.have, scoring.career, scoring.weights, scoring.subscoreContext);

  const allScored = allCourses.map((c) => scoreCourse(c, scoring.have, scoring.career, scoring.weights, scoring.subscoreContext));
  const ranked = rankByMatch(allScored);
  const rank = ranked.findIndex((r) => r.course.id === course.id) + 1;

  const validTabs: DetailTab[] = ["overview", "syllabus", "instructor", "reviews"];
  const activeTab = validTabs.includes(tab as DetailTab) ? (tab as DetailTab) : "overview";

  return (
    <CourseDetailScreen
      scored={scored}
      detail={course}
      rank={rank}
      totalRanked={ranked.length}
      takenCodes={Array.from(scoring.subscoreContext.takenCodes)}
      saved={scoring.savedIds.has(course.id)}
      hidden={scoring.hiddenIds.has(course.id)}
      activeTab={activeTab}
    />
  );
}
