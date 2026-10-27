"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function CourseError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="This course couldn't load" />;
}
