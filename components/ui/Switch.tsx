import { clsx } from "@/lib/clsx";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

/** 52x32 pill, 26px knob — on = oxblood, off = silver. */
export function Switch({ checked, onChange, label, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-8 w-[52px] flex-none cursor-pointer items-center rounded-full p-[3px] transition-colors",
        checked ? "bg-oxblood" : "bg-silver",
      )}
    >
      <span
        className={clsx(
          "block h-[26px] w-[26px] rounded-full bg-salt shadow-sm transition-transform duration-200 ease-[var(--ease-brand)]",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
