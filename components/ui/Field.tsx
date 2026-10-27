import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="font-mono-label mb-2 block text-graphite">
        {label}
      </label>
      {children}
      {error && (
        <div role="alert" className="mt-1.5 text-[12.5px] text-oxblood">
          {error}
        </div>
      )}
    </div>
  );
}

const fieldClasses =
  "pill w-full min-h-12 px-5 py-2.5 text-[14px] text-ink bg-pepper placeholder:text-graphite/70 hover:bg-stone/60 focus-visible:bg-salt transition-colors";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldClasses, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(fieldClasses, className)} {...props} />;
}

export function Checkbox({
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="inline-flex cursor-pointer items-start gap-2 text-[14px] text-ink">
      <input type="checkbox" className="mt-0.5 accent-oxblood" {...props} />
      <span>{children}</span>
    </label>
  );
}
