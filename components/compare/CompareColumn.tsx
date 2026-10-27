import { Select } from "@/components/ui/Field";
import type { ScoredCourse } from "@/lib/scoring";

export function CompareColumn({
  scored,
  options,
  onChange,
}: {
  scored: ScoredCourse;
  options: ScoredCourse[];
  onChange: (id: string) => void;
}) {
  const { course, pct, band } = scored;
  return (
    <div className="pl-5">
      <Select value={course.id} onChange={(e) => onChange(e.target.value)} className="mb-3">
        {options.map((o) => (
          <option key={o.course.id} value={o.course.id}>
            {o.course.code} — {o.course.name}
          </option>
        ))}
      </Select>
      <div className="font-mono text-[12px] text-oxblood">{course.code}</div>
      <div className="mt-1 text-[22px] font-extrabold leading-[1.15]">{course.name}</div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="font-heading text-[34px] font-extrabold leading-none">{pct}</span>
        <span className="text-[12px] text-graphite">{band}</span>
      </div>
    </div>
  );
}
