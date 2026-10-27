"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLargeTextAction } from "@/app/(app)/actions";
import { Switch } from "@/components/ui/Switch";

export function AccessibilityCard({ largeText: initial }: { largeText: boolean }) {
  const [largeText, setLargeText] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !largeText;
    setLargeText(next);
    startTransition(async () => {
      await setLargeTextAction(next);
      router.refresh();
    });
  }

  return (
    <section className="tile bg-pepper p-7">
      <h2 className="font-mono-label text-graphite">Accessibility</h2>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-semibold">Larger text</div>
          <div className="text-[12.5px] text-graphite">Zooms the whole app to 112.5%.</div>
        </div>
        <Switch checked={largeText} onChange={toggle} label="Larger text" />
      </div>
    </section>
  );
}
