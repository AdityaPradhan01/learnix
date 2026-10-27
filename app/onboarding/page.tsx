import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCareers, getCourses, getProfile } from "@/lib/data/repository";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = { title: "Onboarding — Learnix" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [careers, courses, profile] = await Promise.all([
    getCareers(),
    getCourses(),
    getProfile(session.user.id),
  ]);

  return (
    <OnboardingWizard
      careers={careers}
      courses={courses}
      initialCareerKey={profile.onboarded ? profile.careerKey : "unsure"}
      initialInterests={profile.interests}
      initialHours={profile.hours}
      initialOffDays={profile.offDays}
    />
  );
}
