"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateOnboarding } from "@/lib/data/repository";
import { requireUserId } from "@/lib/auth-helpers";

export async function completeOnboardingAction(input: {
  careerKey: string;
  interests: string[];
  hours: number;
  offDays: string[];
  takenCourseIds: string[];
}) {
  const userId = await requireUserId();
  await updateOnboarding(userId, input);
  // getProfile/getTranscript are cached across requests — without this the
  // redirect below could land on /home before the cache has caught up with
  // onboarded: true, bouncing the student straight back to /onboarding.
  revalidatePath("/", "layout");
  redirect("/home");
}
