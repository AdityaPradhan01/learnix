"use client";

import { useMemo, useState, useTransition } from "react";
import { clsx } from "@/lib/clsx";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/(app)/actions";
import { ScreenHeader } from "@/components/shell/ScreenHeader";
import { Segmented } from "@/components/ui/Segmented";
import { Button } from "@/components/ui/Button";

type Filter = "All" | "Unread" | "Deadlines";
const FILTERS: Filter[] = ["All", "Unread", "Deadlines"];

interface NotificationVM {
  id: string;
  kind: "Deadline" | "Seats" | "New";
  title: string;
  body: string;
  occursAt: string | null;
  read: boolean;
}

export function UpdatesScreen({ notifications: initial }: { notifications: NotificationVM[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [filter, setFilter] = useState<Filter>("All");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "Unread") return notifications.filter((n) => !n.read);
    if (filter === "Deadlines") return notifications.filter((n) => n.kind === "Deadline");
    return notifications;
  }, [notifications, filter]);

  function toggleRead(id: string, read: boolean) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));
    startTransition(() => {
      markNotificationReadAction(id, read);
    });
  }

  function markAll() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(() => {
      markAllNotificationsReadAction();
    });
  }

  return (
    <div>
      <ScreenHeader
        kicker="Updates"
        title="What's changed"
        right={<Button variant="secondary" size="sm" onClick={markAll}>Mark all read</Button>}
      />

      <Segmented name="Filter" options={FILTERS} value={filter} onChange={setFilter} />

      <div className="relative mt-8 flex flex-col gap-6 border-l border-dashed border-stone pl-8">
        {filtered.length === 0 && (
          <div className="py-8 text-[13.5px] text-graphite">Nothing here.</div>
        )}
        {filtered.map((n) => (
          <div key={n.id} className="relative">
            <span
              aria-hidden
              className={clsx(
                "absolute -left-[41px] top-1 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold",
                n.kind === "Deadline" ? "bg-ink text-salt" : "bg-pepper text-graphite",
              )}
            >
              {n.occursAt ? new Date(n.occursAt).getDate() : "•"}
            </span>
            <div className="tile flex items-start justify-between gap-4 bg-pepper p-5">
              <div>
                <div className="flex items-center gap-2">
                  {!n.read && <span aria-hidden className="h-2 w-2 rounded-full bg-oxblood" />}
                  <span className={clsx("text-[14.5px]", n.read ? "font-medium" : "font-extrabold")}>{n.title}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-[1.5] text-graphite">{n.body}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRead(n.id, !n.read)}
                className="flex-none text-[12.5px] font-semibold text-oxblood hover:underline"
              >
                {n.read ? "Mark unread" : "Mark read"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
