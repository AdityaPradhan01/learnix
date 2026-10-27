import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getCourses,
  getNotifications,
  getProfile,
  getSavedCourses,
  getScoringContext,
} from "@/lib/data/repository";
import { excludeForHome, projectedSkills, rankByMatch, scoreCourse, skillGaps } from "@/lib/scoring";
import { daysUntil } from "@/lib/dates";
import { HomeScreen } from "@/components/home/HomeScreen";

export const metadata = { title: "Home — Learnix" };

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [profile, courses, notifications, savedCourses, scoring] = await Promise.all([
    getProfile(userId),
    getCourses(),
    getNotifications(userId),
    getSavedCourses(userId),
    getScoringContext(userId),
  ]);

  if (!profile.onboarded) redirect("/onboarding");

  const scored = courses.map((c) => scoreCourse(c, scoring.have, scoring.career, scoring.weights, scoring.subscoreContext));
  const ranked = rankByMatch(excludeForHome(scored, { hiddenIds: scoring.hiddenIds, offDays: scoring.offDays }));

  const after = projectedSkills(scoring.have, savedCourses);
  const gaps = skillGaps(scoring.have, after, scoring.career).sort((a, b) => b.gap - a.gap);
  const biggestGap = gaps[0];

  const registrationNotif = notifications.find((n) => n.kind === "Deadline" && n.occursAt);
  const daysToRegistration = registrationNotif?.occursAt ? daysUntil(registrationNotif.occursAt) : null;

  const savedHours = savedCourses.reduce((sum, c) => sum + c.hoursPerWeek, 0);
  const savedIds = new Set(savedCourses.map((c) => c.id));

  return (
    <HomeScreen
      studentName={session.user.name ?? "Student"}
      hero={ranked[0]}
      rail={ranked.slice(1, 7)}
      savedIds={savedIds}
      daysToRegistration={daysToRegistration}
      registrationLabel={registrationNotif?.title ?? null}
      biggestGap={biggestGap}
      savedHours={savedHours}
      hoursBudget={profile.hours}
    />
  );
}
