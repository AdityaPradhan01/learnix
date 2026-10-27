"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav";

export function TopNav({
  studentName,
  initials,
  savedCount,
  unreadCount,
}: {
  studentName: string;
  initials: string;
  savedCount: number;
  unreadCount: number;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-stone/60 bg-salt/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 overflow-x-auto px-4 sm:gap-4 sm:px-7">
        <Link href="/home" className="flex-none font-heading text-[17px] font-extrabold tracking-[-0.02em]">
          LEARNIX
        </Link>

        <nav
          aria-label="Primary"
          className="pill flex flex-none items-center gap-1 bg-pepper p-1"
        >
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const label = item.href === "/saved" ? `Saved · ${savedCount}` : item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "pill px-4 py-[9px] text-[13px] font-semibold whitespace-nowrap transition-colors",
                  active ? "bg-ink text-salt" : "text-ink/75 hover:text-ink",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-none items-center gap-3">
          <nav aria-label="More" className="hidden items-center gap-3 lg:flex">
            {SECONDARY_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "text-[13px] font-semibold",
                    active ? "text-oxblood" : "text-graphite hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/updates"
            aria-label={unreadCount > 0 ? `Updates, ${unreadCount} unread` : "Updates"}
            className="pill relative flex h-10 w-10 items-center justify-center bg-pepper text-ink hover:bg-stone"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span
                aria-hidden
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-oxblood"
              />
            )}
          </Link>

          <Link
            href="/settings"
            aria-label={`Settings — ${studentName}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-silver text-[12px] font-bold text-ink hover:bg-pepper"
          >
            {initials}
          </Link>

          <Link
            href="/logout"
            aria-label="Sign out"
            title="Sign out"
            className="pill flex h-10 w-10 items-center justify-center bg-pepper text-ink hover:bg-stone"
          >
            <SignOutIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}

function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M15 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 12h10m0 0-3.5-3.5M20 12l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M12 3a5 5 0 0 0-5 5v3.2c0 .6-.2 1.2-.6 1.7L5 15h14l-1.4-2.1a2.8 2.8 0 0 1-.6-1.7V8a5 5 0 0 0-5-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
