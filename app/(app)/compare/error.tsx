"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function CompareError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Compare couldn't load" />;
}
