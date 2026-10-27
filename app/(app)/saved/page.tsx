import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotifications, getProfile, getSavedCourses } from "@/lib/data/repository";
import { detectClashes } from "@/lib/scoring";
import { SavedScreen } from "@/components/saved/SavedScreen";

export const metadata = { title: "Saved — Learnix" };

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [profile, savedCourses, notifications] = await Promise.all([
    getProfile(userId),
    getSavedCourses(userId),
    getNotifications(userId),
  ]);

  const clashes = detectClashes(savedCourses.map((c) => ({ code: c.code, days: c.days, startTime: c.startTime, endTime: c.endTime })));
  const savedHours = savedCourses.reduce((sum, c) => sum + c.hoursPerWeek, 0);
  const registrationNotif = notifications.find((n) => n.kind === "Deadline" && n.occursAt);

  return (
    <SavedScreen
      courses={savedCourses}
      offDays={profile.offDays}
      hoursBudget={profile.hours}
      savedHours={savedHours}
      clashes={clashes}
      registrationDate={registrationNotif?.occursAt?.toISOString() ?? null}
      registrationLabel={registrationNotif?.title ?? null}
    />
  );
}
