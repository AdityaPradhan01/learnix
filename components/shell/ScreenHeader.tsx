import type { ReactNode } from "react";

interface ScreenHeaderProps {
  kicker: string;
  title: string;
  context?: ReactNode;
  right?: ReactNode;
}

/** The shared header pattern on every app screen: mono-label kicker, h2,
 *  optional context line, optional right-aligned controls. */
export function ScreenHeader({ kicker, title, context, right }: ScreenHeaderProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div>
        <div className="font-mono-label text-oxblood">{kicker}</div>
        <h1 className="mt-2 text-[clamp(28px,3.6vw,44px)] tracking-[-0.03em]">{title}</h1>
        {context && <div className="mt-1.5 text-[14px] text-graphite">{context}</div>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
