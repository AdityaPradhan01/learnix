"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function ExploreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Explore couldn't load" />;
}
