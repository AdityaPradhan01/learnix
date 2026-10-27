"use client";

import { ErrorState } from "@/components/shell/ErrorState";

export default function HomeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} reset={reset} title="Home couldn't load" />;
}
