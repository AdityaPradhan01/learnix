import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  getCareer,
  getHiddenCourses,
  getNotificationSettings,
  getProfile,
  getWeights,
} from "@/lib/data/repository";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { AccountForm } from "@/components/settings/AccountForm";
import { PreferencesCard } from "@/components/settings/PreferencesCard";
import { WeightsCard } from "@/components/settings/WeightsCard";
import { NotificationsCard } from "@/components/settings/NotificationsCard";
import { AccessibilityCard } from "@/components/settings/AccessibilityCard";
import { HiddenCoursesCard } from "@/components/settings/HiddenCoursesCard";

export const metadata = { title: "Settings — Learnix" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [account, profile, weights, notifSettings, hiddenCourses] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    getProfile(userId),
    getWeights(userId),
    getNotificationSettings(userId),
    getHiddenCourses(userId),
  ]);
  if (!account) redirect("/login");
  const career = await getCareer(profile.careerKey);

  const initials = account.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div>
      <ScreenHeader kicker="Settings" title="Profile & settings" />

      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-silver text-[18px] font-extrabold">
            {initials || "?"}
          </div>
          <div>
            <div className="text-[17px] font-extrabold">{account.name}</div>
            <div className="text-[13px] text-graphite">{account.email}</div>
          </div>
        </div>

        <PreferencesCard careerName={career?.name ?? "Not set"} interests={profile.interests} hours={profile.hours} offDays={profile.offDays} />

        <WeightsCard weights={weights} />

        <NotificationsCard settings={notifSettings} />

        <AccessibilityCard largeText={profile.largeText} />

        <HiddenCoursesCard courses={hiddenCourses} />

        <section className="tile bg-pepper p-7">
          <h2 className="font-mono-label text-graphite">Account details</h2>
          <div className="mt-5">
            <AccountForm name={account.name} email={account.email} program={account.program} year={account.year} />
          </div>
        </section>
      </div>
    </div>
  );
}
