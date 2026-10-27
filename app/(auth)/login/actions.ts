"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") ? "true" : "false";
  const callbackUrl = String(formData.get("callbackUrl") ?? "/home");

  try {
    await signIn("credentials", {
      email,
      password,
      remember,
      redirectTo: callbackUrl || "/home",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // NEXT_REDIRECT is thrown by signIn on success — let it propagate.
    throw error;
  }
}
