import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    /** Whether this login should be a long-lived ("remember me") session. */
    remember?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    remember?: boolean;
    /** Epoch ms this token was issued — used to enforce a short session
     *  when the student didn't check "remember me" (see auth.config.ts). */
    loginAt?: number;
  }
}
