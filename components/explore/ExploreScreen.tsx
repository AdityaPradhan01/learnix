"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { filterForExplore, sortScored, SORT_MODES, type ScoredCourse, type SortMode } from "@/lib/scoring";
import { DAYS } from "@/lib/data/constants";
import { Segmented } from "@/components/ui/Segmented";
import { Pill } from "@/components/ui/Pill";
import { Ring } from "@/components/ui/Ring";
import { Tag } from "@/components/ui/Tag";
import { SaveButton } from "@/components/ui/SaveButton";
import { Button } from "@/components/ui/Button";

export function ExploreScreen({
  scored,
  depts,
  savedIds,
  maxCourseHours,
}: {
  scored: ScoredCourse[];
  depts: string[];
  savedIds: string[];
  maxCourseHours: number;
}) {
  const [query, setQuery] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [maxHours, setMaxHours] = useState(maxCourseHours);
  const [sort, setSort] = useState<SortMode>("Best match");
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const filtered = useMemo(
    () => sortScored(filterForExplore(scored, { query, depts: selectedDepts, maxHours, days: selectedDays }), sort),
    [scored, query, selectedDepts, maxHours, selectedDays, sort],
  );

  const hasFilters = query !== "" || selectedDepts.length > 0 || selectedDays.length > 0 || maxHours < maxCourseHours;

  function clearFilters() {
    setQuery("");
    setSelectedDepts([]);
    setSelectedDays([]);
    setMaxHours(maxCourseHours);
  }

  function toggleDept(d: string) {
    setSelectedDepts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : prev.concat(d)));
  }
  function toggleDay(d: string) {
    setSelectedDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : prev.concat(d)));
  }

  return (
    <div>
      <div className="text-center">
        <div className="font-mono-label text-oxblood">Explore</div>
        <h1 className="mt-2 text-[clamp(28px,3.6vw,44px)] tracking-[-0.03em]">Every eligible course</h1>
      </div>

      <div className="mx-auto mt-8 max-w-[640px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code, title or instructor"
          aria-label="Search courses"
          className="pill h-16 w-full bg-salt px-7 text-[16px] text-ink shadow-hero placeholder:text-graphite/60"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        {depts.map((d) => (
          <Pill key={d} selected={selectedDepts.includes(d)} onClick={() => toggleDept(d)}>
            {d}
          </Pill>
        ))}
        <span className="mx-1 h-5 w-px bg-stone" aria-hidden />
        {DAYS.map((d) => (
          <Pill key={d} selected={selectedDays.includes(d)} onClick={() => toggleDay(d)}>
            {d}
          </Pill>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
        <div className="pill flex items-center gap-3 bg-pepper px-5 py-2.5">
          <label htmlFor="maxHours" className="font-mono-label text-graphite">Max h/wk</label>
          <input
            id="maxHours"
            type="range"
            min={2}
            max={maxCourseHours}
            value={maxHours}
            onChange={(e) => setMaxHours(Number(e.target.value))}
            className="accent-oxblood"
          />
          <span className="font-mono text-[12.5px]">{maxHours}h</span>
        </div>
        <Segmented name="Sort" options={SORT_MODES} value={sort} onChange={setSort} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span aria-live="polite" className="font-mono text-[13px] text-graphite">
          {filtered.length} course{filtered.length === 1 ? "" : "s"}
        </span>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="text-[13px] font-semibold text-oxblood hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="tile mt-6 flex flex-col items-center gap-3 bg-pepper p-14 text-center">
          <div className="font-heading text-[18px] font-extrabold">No courses match those filters</div>
          <p className="max-w-[40ch] text-[13.5px] text-graphite">
            Try widening the workload cap or clearing the department and day filters.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.course.id} className="tile group relative flex flex-col gap-4 bg-pepper p-6 transition-transform duration-[450ms] ease-[var(--ease-brand)] hover:-translate-y-1.5">
              <div className="absolute right-4 top-4">
                <SaveButton courseId={s.course.id} courseName={s.course.name} initialSaved={savedSet.has(s.course.id)} compact />
              </div>
              <Link href={`/course/${s.course.id}`} className="flex flex-col gap-4">
                <Ring pct={s.pct} size={56} strokeWidth={5} />
                <div>
                  <div className="font-mono text-[11px] text-graphite">{s.course.code}</div>
                  <div className="mt-0.5 pr-8 text-[16px] font-extrabold leading-tight">{s.course.name}</div>
                  <div className="mt-1 text-[12.5px] text-graphite">{s.course.instructorName}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Tag mono>{s.course.rating.toFixed(1)} ★</Tag>
                  <Tag mono>{s.course.hoursPerWeek}h/wk</Tag>
                  <Tag mono variant={s.course.seats < 15 ? "accent" : "neutral"}>
                    {s.course.seats} seats
                  </Tag>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
