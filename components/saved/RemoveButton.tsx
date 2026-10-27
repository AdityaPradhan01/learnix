"use client";

import { useTransition } from "react";
import { toggleSavedAction } from "@/app/(app)/actions";
import { useToastStore } from "@/lib/store/useToastStore";
import { Button } from "@/components/ui/Button";

export function RemoveButton({ courseId, courseName }: { courseId: string; courseName: string }) {
  const [, startTransition] = useTransition();
  const show = useToastStore((s) => s.show);

  function handleClick() {
    startTransition(() => {
      toggleSavedAction(courseId);
    });
    show(`${courseName} removed from saved`, () => {
      startTransition(() => {
        toggleSavedAction(courseId);
      });
    });
  }

  return (
    <Button type="button" variant="secondary" size="xs" onClick={handleClick}>
      Remove
    </Button>
  );
}
