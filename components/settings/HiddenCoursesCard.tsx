import type { Course } from "@/lib/scoring";
import { RestoreButton } from "./RestoreButton";

export function HiddenCoursesCard({ courses }: { courses: Course[] }) {
  return (
    <section className="tile bg-pepper p-7">
      <h2 className="font-mono-label text-graphite">Hidden courses</h2>
      {courses.length === 0 ? (
        <p className="mt-3 text-[13.5px] text-graphite">Nothing hidden — courses you dismiss from Home appear here.</p>
      ) : (
        <div className="mt-4 flex flex-col divide-y divide-stone/60">
          {courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <div className="font-mono text-[11px] text-graphite">{c.code}</div>
                <div className="text-[14px] font-semibold">{c.name}</div>
              </div>
              <RestoreButton courseId={c.id} courseName={c.name} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
