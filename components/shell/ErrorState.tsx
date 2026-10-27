"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Tile } from "@/components/ui/Tile";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

/** The route-level error boundary's visual — a gap the prototype doesn't
 *  cover. Reassures the student that their saved state is untouched. */
export function ErrorState({ error, reset, title = "This screen couldn't load" }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-16">
      <Tile tone="salt" className="max-w-[560px] border border-stone/70 p-8">
        <div className="font-mono-label text-oxblood">Error</div>
        <div className="mt-2 font-heading text-[22px] font-extrabold">{title}</div>
        <p className="mt-2 text-[14px] leading-[1.55] text-graphite">
          The catalogue service didn&apos;t respond. Your profile, weights, saved courses and
          settings are untouched — retry when you&apos;re ready.
        </p>
        <Button variant="primary" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </Tile>
    </div>
  );
}
