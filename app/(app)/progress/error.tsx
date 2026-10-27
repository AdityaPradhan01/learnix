"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function ProgressError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Progress couldn't load" />;
}
