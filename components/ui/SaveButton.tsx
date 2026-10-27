"use client";

import { useState, useTransition } from "react";
import { toggleSavedAction } from "@/app/(app)/actions";
import { useToastStore } from "@/lib/store/useToastStore";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";

export function SaveButton({
  courseId,
  courseName,
  initialSaved,
  variant = "secondary",
  size = "sm",
  compact = false,
}: {
  courseId: string;
  courseName: string;
  initialSaved: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon-only circular toggle, for dense card grids. */
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();
  const show = useToastStore((s) => s.show);

  function apply(next: boolean) {
    setSaved(next);
    startTransition(() => {
      toggleSavedAction(courseId);
    });
  }

  function handleClick() {
    const next = !saved;
    apply(next);
    show(next ? `${courseName} saved` : `${courseName} removed from saved`, () => apply(!next));
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${courseName} from saved` : `Save ${courseName}`}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-[16px] transition-colors ${saved ? "bg-ink text-salt" : "bg-salt/90 text-ink hover:bg-stone"}`}
      >
        <span aria-hidden>{saved ? "♥" : "♡"}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={saved ? "dark" : variant}
      size={size}
      onClick={handleClick}
      aria-pressed={saved}
    >
      <span aria-hidden>{saved ? "♥" : "♡"}</span> {saved ? "Saved" : "Save"}
    </Button>
  );
}
