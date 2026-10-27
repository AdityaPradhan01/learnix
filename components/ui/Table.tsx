import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return <table className={clsx("w-full border-collapse text-[14px]", className)}>{children}</table>;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        "font-mono-label border-b border-stone px-3 py-3 text-left text-graphite",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx("border-b border-stone/70 px-3 py-3", className)} {...props} />;
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={clsx("hover:bg-pepper/60", className)}>{children}</tr>;
}
