import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Resolves the current session's user id and confirms that row still
 * exists. A JWT session can outlive the row it points to (e.g. a database
 * reset during development, or an account deleted elsewhere) — every
 * mutation goes through here instead of trusting the session id blindly,
 * so a stale session redirects to login with a clear reason instead of
 * crashing on a foreign-key violation deep in a Prisma call.
 *
 * Request-memoized: the (app) layout, most pages, and every mutation all
 * call this, so it should cost one query per request, not one per caller.
 */
export const requireUserId = cache(async (): Promise<string> => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const exists = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!exists) redirect("/login?error=session-expired");

  return session.user.id;
});
