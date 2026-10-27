"use client";

import { useTransition } from "react";
import { toggleHiddenAction } from "@/app/(app)/actions";
import { useToastStore } from "@/lib/store/useToastStore";
import { Button } from "@/components/ui/Button";

export function RestoreButton({ courseId, courseName }: { courseId: string; courseName: string }) {
  const [, startTransition] = useTransition();
  const show = useToastStore((s) => s.show);

  function handleClick() {
    startTransition(() => {
      toggleHiddenAction(courseId);
    });
    show(`${courseName} restored to recommendations`, () => {
      startTransition(() => {
        toggleHiddenAction(courseId);
      });
    });
  }

  return (
    <Button type="button" variant="secondary" size="xs" onClick={handleClick}>
      Restore
    </Button>
  );
}
