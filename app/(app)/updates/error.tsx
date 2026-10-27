"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function UpdatesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Updates couldn't load" />;
}
