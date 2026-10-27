"use client";

import { useState, useTransition } from "react";
import { setNotificationSettingsAction } from "@/app/(app)/actions";
import type { NotificationPrefs } from "@/lib/data/repository";
import { Switch } from "@/components/ui/Switch";

const ROWS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  { key: "deadlines", label: "Registration deadlines", hint: "Priority windows and add/drop cutoffs." },
  { key: "seats", label: "Low seats", hint: "When a course on your radar is close to full." },
  { key: "newCourses", label: "New course matches", hint: "When a newly added course scores well for you." },
  { key: "email", label: "Also email me", hint: "Mirror the above to your account email." },
];

export function NotificationsCard({ settings }: { settings: NotificationPrefs }) {
  const [prefs, setPrefs] = useState(settings);
  const [, startTransition] = useTransition();

  function toggle(key: keyof NotificationPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    startTransition(() => {
      setNotificationSettingsAction(next);
    });
  }

  return (
    <section className="tile bg-pepper p-7">
      <h2 className="font-mono-label text-graphite">Notifications</h2>
      <div className="mt-5 flex flex-col gap-4">
        {ROWS.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold">{r.label}</div>
              <div className="text-[12.5px] text-graphite">{r.hint}</div>
            </div>
            <Switch checked={prefs[r.key]} onChange={() => toggle(r.key)} label={r.label} />
          </div>
        ))}
      </div>
    </section>
  );
}
