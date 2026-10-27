import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-salt text-ink font-body">
      <div className="border-b border-stone/60 px-7 py-5">
        <Link href="/" className="font-heading text-[17px] font-extrabold tracking-[-0.02em]">
          LEARNIX
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
