import Link from "next/link";
import { DAY_NAMES, type DayKey } from "@/lib/data/constants";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Link
      href="/onboarding"
      className="flex items-center justify-between border-b border-stone/60 py-3.5 text-[14px] last:border-b-0 hover:text-oxblood"
    >
      <span className="text-graphite">{label}</span>
      <span className="font-semibold">{value}</span>
    </Link>
  );
}

export function PreferencesCard({
  careerName,
  interests,
  hours,
  offDays,
}: {
  careerName: string;
  interests: string[];
  hours: number;
  offDays: string[];
}) {
  const offDaysLabel = offDays.length ? offDays.map((d) => DAY_NAMES[d as DayKey]).join(", ") : "None";

  return (
    <section className="tile bg-pepper p-7">
      <h2 className="font-mono-label text-graphite">Preferences</h2>
      <p className="mt-1 text-[12.5px] text-graphite">Tap a row to update it in onboarding.</p>
      <div className="mt-4">
        <Row label="Career goal" value={careerName} />
        <Row label="Interests" value={interests.length ? interests.join(", ") : "None selected"} />
        <Row label="Weekly hours" value={`${hours}h`} />
        <Row label="Unavailable days" value={offDaysLabel} />
      </div>
    </section>
  );
}
