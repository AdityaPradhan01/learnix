import { clsx } from "@/lib/clsx";

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  displayValue: string;
  onChange: (value: number) => void;
  accentValue?: boolean;
  id?: string;
}

export function RangeSlider({
  label,
  value,
  min,
  max,
  displayValue,
  onChange,
  accentValue,
  id,
}: RangeSliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-heading text-[13px] font-extrabold">
          {label}
        </label>
        <span className={clsx("font-mono text-[11.5px]", accentValue ? "text-oxblood" : "text-graphite")}>
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2.5 w-full accent-oxblood"
      />
    </div>
  );
}
