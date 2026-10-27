import type { ReactNode } from "react";
import { getProfile, getSavedCourseIds, getUnreadNotificationCount } from "@/lib/data/repository";
import { TopNav } from "./TopNav";
import { Toaster } from "@/components/ui/Toaster";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export async function AppShell({ children, user }: { children: ReactNode; user: SessionUser }) {
  // The session already carries the account name from sign-in — no need to
  // re-query it on every single page. It only goes stale for the rest of
  // the current session if the student renames their account, which a
  // fresh login picks up.
  const name = user.name ?? "Student";

  const [savedIds, unreadCount, profile] = await Promise.all([
    getSavedCourseIds(user.id),
    getUnreadNotificationCount(user.id),
    getProfile(user.id),
  ]);

  return (
    <div className="min-h-screen bg-salt text-ink font-body">
      <TopNav studentName={name} initials={initialsFor(name)} savedCount={savedIds.size} unreadCount={unreadCount} />
      <main
        className="mx-auto max-w-[1040px] px-4 py-8 sm:px-7 sm:py-12"
        style={{ zoom: profile.largeText ? 1.125 : 1 }}
      >
        {children}
      </main>
      <Toaster />
    </div>
  );
}
