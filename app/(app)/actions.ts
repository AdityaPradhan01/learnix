"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/data/repository";
import { requireUserId } from "@/lib/auth-helpers";
import type { Weights } from "@/lib/scoring";

export async function toggleSavedAction(courseId: string): Promise<boolean> {
  const userId = await requireUserId();
  const saved = await repo.toggleSaved(userId, courseId);
  revalidatePath("/", "layout");
  return saved;
}

export async function toggleHiddenAction(courseId: string): Promise<boolean> {
  const userId = await requireUserId();
  const hidden = await repo.toggleHidden(userId, courseId);
  revalidatePath("/", "layout");
  return hidden;
}

export async function setTranscriptConfirmedAction(courseId: string, confirmed: boolean) {
  const userId = await requireUserId();
  await repo.setTranscriptConfirmed(userId, courseId, confirmed);
  revalidatePath("/", "layout");
}

export async function setWeightsAction(weights: Weights) {
  const userId = await requireUserId();
  await repo.setWeights(userId, weights);
  revalidatePath("/", "layout");
}

export async function resetWeightsAction() {
  const userId = await requireUserId();
  await repo.resetWeights(userId);
  revalidatePath("/", "layout");
}

export async function setNotificationSettingsAction(prefs: repo.NotificationPrefs) {
  const userId = await requireUserId();
  await repo.setNotificationSettings(userId, prefs);
  revalidatePath("/settings");
}

export async function setLargeTextAction(largeText: boolean) {
  const userId = await requireUserId();
  await repo.setLargeText(userId, largeText);
  revalidatePath("/", "layout");
}

export async function markNotificationReadAction(notificationId: string, read: boolean) {
  const userId = await requireUserId();
  await repo.markNotificationRead(userId, notificationId, read);
  revalidatePath("/updates");
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const userId = await requireUserId();
  await repo.markAllNotificationsRead(userId);
  revalidatePath("/updates");
  revalidatePath("/", "layout");
}
