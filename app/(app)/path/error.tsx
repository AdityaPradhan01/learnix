"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function PathError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Path couldn't load" />;
}
