import { clsx } from "@/lib/clsx";

interface SegmentedProps<T extends string> {
  name: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labels?: Partial<Record<T, string>>;
}

/** Pepper track, 4px padding, active segment an ink pill with salt text.
 *  Used for course tabs, sort, notification filters — anywhere a mutually
 *  exclusive small set of options needs a single control. */
export function Segmented<T extends string>({ name, options, value, onChange, labels }: SegmentedProps<T>) {
  return (
    <div role="tablist" aria-label={name} className="pill inline-flex items-center gap-1 bg-pepper p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="tab"
          aria-selected={value === opt}
          onClick={() => onChange(opt)}
          className={clsx(
            "pill px-4 py-[9px] text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors",
            value === opt ? "bg-ink text-salt" : "text-ink/70 hover:text-ink",
          )}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}
