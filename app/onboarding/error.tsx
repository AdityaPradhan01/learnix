"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function OnboardingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center gap-4 py-24 text-center">
      <div className="font-mono-label text-oxblood">Error</div>
      <h1 className="text-[22px] font-extrabold">Onboarding couldn&apos;t load</h1>
      <p className="text-[13.5px] text-graphite">Nothing you&apos;ve picked so far was lost — retry when you&apos;re ready.</p>
      <Button variant="primary" onClick={reset}>Try again</Button>
    </div>
  );
}
