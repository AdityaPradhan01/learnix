"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { createStudentAccount } from "@/lib/data/repository";
import { signupSchema } from "@/lib/validation";

export interface SignupState {
  error?: string;
}

export async function signupAction(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await createStudentAccount({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    program: "BS Computer Science",
    year: 1,
    careerKey: "unsure",
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created — sign in to continue." };
    }
    throw error;
  }
}
