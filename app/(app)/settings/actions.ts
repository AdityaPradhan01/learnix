"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth-helpers";
import { accountSchema } from "@/lib/validation";

export interface AccountState {
  error?: string;
  success?: boolean;
}

export async function updateAccountAction(
  _prevState: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const userId = await requireUserId();

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    program: formData.get("program"),
    year: formData.get("year"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== userId) {
    return { error: "Another account already uses that email." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  });

  revalidatePath("/settings", "layout");
  return { success: true };
}
