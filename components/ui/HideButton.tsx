"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleHiddenAction } from "@/app/(app)/actions";
import { useToastStore } from "@/lib/store/useToastStore";
import { Button, type ButtonSize } from "@/components/ui/Button";

/** "Not for me" — hides a course from Home recommendations. Undoable, and
 *  when used from the course detail page it navigates back to Home after. */
export function HideButton({
  courseId,
  courseName,
  size = "sm",
  navigateAfter = false,
}: {
  courseId: string;
  courseName: string;
  size?: ButtonSize;
  navigateAfter?: boolean;
}) {
  const [, startTransition] = useTransition();
  const show = useToastStore((s) => s.show);
  const router = useRouter();

  function handleClick() {
    startTransition(() => {
      toggleHiddenAction(courseId);
    });
    show(`${courseName} hidden from recommendations`, () => {
      startTransition(() => {
        toggleHiddenAction(courseId);
      });
    });
    if (navigateAfter) router.push("/home");
  }

  return (
    <Button type="button" variant="secondary" size={size} onClick={handleClick}>
      Not for me
    </Button>
  );
}
