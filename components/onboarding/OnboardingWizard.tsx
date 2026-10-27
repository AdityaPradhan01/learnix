"use client";

import { useMemo, useState, useTransition } from "react";
import { DAYS, DAY_NAMES, INTEREST_OPTIONS } from "@/lib/data/constants";
import {
  DEFAULT_WEIGHTS,
  currentSkills,
  scoreCourse,
  type CareerTarget,
  type Course,
} from "@/lib/scoring";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Ring } from "@/components/ui/Ring";
import { completeOnboardingAction } from "@/app/onboarding/actions";

const GLYPHS = ["circle", "diamond", "triangle", "hexagon", "plus", "ring"] as const;

function CareerGlyph({ index, active }: { index: number; active: boolean }) {
  const shape = GLYPHS[index % GLYPHS.length];
  const color = active ? "var(--color-blush)" : "var(--color-ink)";
  const common = { stroke: color, strokeWidth: 1.6, fill: "none" } as const;
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden focusable="false">
      {shape === "circle" && <circle cx="15" cy="15" r="10" {...common} />}
      {shape === "diamond" && <rect x="7" y="7" width="16" height="16" rx="2" transform="rotate(45 15 15)" {...common} />}
      {shape === "triangle" && <path d="M15 5 L25 24 L5 24 Z" strokeLinejoin="round" {...common} />}
      {shape === "hexagon" && <path d="M15 4 L25 10 V20 L15 26 L5 20 V10 Z" strokeLinejoin="round" {...common} />}
      {shape === "plus" && <path d="M15 5 V25 M5 15 H25" strokeLinecap="round" {...common} />}
      {shape === "ring" && (
        <>
          <circle cx="15" cy="15" r="10" {...common} />
          <circle cx="15" cy="15" r="4" {...common} />
        </>
      )}
    </svg>
  );
}

const STEP_META = [
  { label: "Career", question: "What's your target role?", hint: "This sets the skill profile every course is scored against. You can change it any time in Settings." },
  { label: "Interests", question: "What are you into?", hint: "Pick as many as apply — courses that match get a small boost." },
  { label: "Transcript", question: "Anything you've already completed?", hint: "Tap to exclude anything you haven't actually finished yet." },
  { label: "Limits", question: "How much time do you have?", hint: "Your weekly study-hour budget and any days you can't take a class." },
];

export function OnboardingWizard({
  careers,
  courses,
  initialCareerKey,
  initialInterests,
  initialHours,
  initialOffDays,
}: {
  careers: CareerTarget[];
  courses: Course[];
  initialCareerKey: string;
  initialInterests: string[];
  initialHours: number;
  initialOffDays: string[];
}) {
  const [step, setStep] = useState(1);
  const [careerKey, setCareerKey] = useState(initialCareerKey);
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [hours, setHours] = useState(initialHours);
  const [offDays, setOffDays] = useState<string[]>(initialOffDays);
  const [takenIds, setTakenIds] = useState<Set<string>>(
    () => new Set(courses.filter((c) => c.prerequisites.length === 0).map((c) => c.id)),
  );
  const [pending, startTransition] = useTransition();

  const foundational = useMemo(() => courses.filter((c) => c.prerequisites.length === 0), [courses]);
  const catalogueCodes = useMemo(() => new Set(courses.map((c) => c.code)), [courses]);
  const career = careers.find((c) => c.key === careerKey) ?? careers[0];

  const liveMatchCount = useMemo(() => {
    const takenCourses = courses.filter((c) => takenIds.has(c.id));
    const have = currentSkills(takenCourses);
    const takenCodes = new Set(takenCourses.map((c) => c.code));
    const ctx = { interests, hours, catalogueCodes, takenCodes };
    return courses.filter((c) => {
      if (c.days.split("").some((d) => offDays.includes(d))) return false;
      return scoreCourse(c, have, career, DEFAULT_WEIGHTS, ctx).pct >= 60;
    }).length;
  }, [courses, takenIds, interests, hours, offDays, catalogueCodes, career]);

  function toggleInterest(name: string) {
    setInterests((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : prev.concat(name)));
  }
  function toggleTaken(id: string) {
    setTakenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleOffDay(day: string) {
    setOffDays((prev) => (prev.includes(day) ? prev.filter((x) => x !== day) : prev.concat(day)));
  }

  function finish() {
    startTransition(() => {
      completeOnboardingAction({
        careerKey,
        interests,
        hours,
        offDays,
        takenCourseIds: Array.from(takenIds),
      });
    });
  }

  const meta = STEP_META[step - 1];

  return (
    <div className="mx-auto flex min-h-screen max-w-[720px] flex-col px-7 py-14">
      <div className="flex items-center justify-center gap-2" aria-hidden>
        {STEP_META.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-14 rounded-full ${i + 1 <= step ? "bg-ink" : "bg-stone"}`}
          />
        ))}
      </div>

      <div className="mt-10 flex-1 text-center">
        <div className="font-mono-label text-oxblood">
          Step {step} of {STEP_META.length} — {meta.label}
        </div>
        <h1 className="mx-auto mt-4 max-w-[20ch] text-[clamp(28px,3.6vw,40px)] tracking-[-0.03em]">{meta.question}</h1>
        <p className="mx-auto mt-3 max-w-[46ch] text-[14.5px] text-graphite">{meta.hint}</p>

        <div className="mt-10 text-left">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {careers.map((c, i) => {
                const active = c.key === careerKey;
                return (
                  <button
                    key={c.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCareerKey(c.key)}
                    className={`tile flex flex-col items-start gap-3 p-5 text-left transition-colors ${active ? "bg-ink text-salt" : "bg-pepper text-ink hover:bg-stone/70"}`}
                  >
                    <CareerGlyph index={i} active={active} />
                    <div className="font-heading text-[14.5px] font-extrabold leading-tight">{c.name}</div>
                    <div className={`text-[12px] ${active ? "text-silver" : "text-graphite"}`}>{c.desc}</div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap justify-center gap-2.5">
              {INTEREST_OPTIONS.map((name) => (
                <Pill key={name} selected={interests.includes(name)} onClick={() => toggleInterest(name)}>
                  {name}
                </Pill>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-wrap justify-center gap-2.5">
              {foundational.map((c) => {
                const taken = takenIds.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={taken}
                    onClick={() => toggleTaken(c.id)}
                    className={`pill flex items-center gap-2 border-[1.5px] px-4 py-2 text-[13px] transition-colors ${taken ? "border-ink bg-ink text-salt" : "border-ink/25 bg-transparent text-ink"}`}
                  >
                    <span>{c.code}</span>
                    {taken && <span className="font-mono-label opacity-75">Completed</span>}
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center gap-9">
              <Ring pct={Math.min(100, (hours / 50) * 100)} size={220} strokeWidth={12} label={`${hours}h`} sublabel="per week" />
              <div className="w-full max-w-[360px]">
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  aria-label="Weekly study-hour budget"
                  className="w-full accent-oxblood"
                />
              </div>
              <div>
                <div className="font-mono-label mb-3 text-center text-graphite">Days you can&apos;t take a class</div>
                <div className="flex gap-3">
                  {DAYS.map((d) => {
                    const off = offDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={off}
                        aria-label={DAY_NAMES[d]}
                        onClick={() => toggleOffDay(d)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${off ? "bg-oxblood text-blush" : "bg-pepper text-ink hover:bg-stone"}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 flex items-center justify-between border-t border-stone/60 pt-6">
        <Button variant="secondary" size="sm" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
          Back
        </Button>
        <span aria-live="polite" className="font-mono text-[12.5px] text-graphite">
          {liveMatchCount} course{liveMatchCount === 1 ? "" : "s"} match so far
        </span>
        {step < STEP_META.length ? (
          <Button variant="primary" size="sm" onClick={() => setStep((s) => Math.min(STEP_META.length, s + 1))}>
            Continue
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={finish} disabled={pending}>
            {pending ? "Finishing…" : "Finish"}
          </Button>
        )}
      </div>
    </div>
  );
}
