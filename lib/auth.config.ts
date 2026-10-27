import type { NextAuthConfig } from "next-auth";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The edge-safe half of the auth config — no Prisma, no bcrypt. Used by
 * proxy.ts for a lightweight session check, and spread into the full
 * config in auth.ts (which adds the Credentials provider's Node-only
 * authorize()). Splitting this out keeps Prisma out of the edge bundle.
 *
 * "Remember me": the cookie itself always carries the same (long) Max-Age
 * — Auth.js's JWT strategy doesn't expose a per-login cookie lifetime — so
 * instead the session is invalidated at the application level. On sign-in
 * the token records `remember` and `loginAt`; every later request compares
 * `loginAt` against a 30-day window when remembered, or 1 day when not.
 * Once that window passes, the `jwt` callback returns null, which Auth.js
 * treats as "no session" everywhere `auth()` is checked.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: THIRTY_DAYS_MS / 1000 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.remember = Boolean(user.remember);
        token.loginAt = Date.now();
        return token;
      }

      const maxAgeMs = token.remember ? THIRTY_DAYS_MS : ONE_DAY_MS;
      if (typeof token.loginAt === "number" && Date.now() - token.loginAt > maxAgeMs) {
        return null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
