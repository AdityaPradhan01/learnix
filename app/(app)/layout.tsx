import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { requireUserId } from "@/lib/auth-helpers";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Confirms the session's user id still exists — catches a stale session
  // (e.g. left over from a database reset) at page-load rather than
  // letting it crash the first mutation that touches it.
  await requireUserId();

  return <AppShell user={session.user}>{children}</AppShell>;
}
