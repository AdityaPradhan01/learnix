"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function SavedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Saved couldn't load" />;
}
