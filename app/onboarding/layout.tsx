import type { ReactNode } from "react";
import { requireUserId } from "@/lib/auth-helpers";

// Full-screen wizard — deliberately not wrapped in the app shell/top nav,
// so there's nothing to distract from the four steps.
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  await requireUserId();
  return <div className="min-h-screen bg-salt text-ink font-body">{children}</div>;
}
