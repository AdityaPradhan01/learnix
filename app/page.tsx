import Link from "next/link";
import { auth } from "@/auth";
import { getCareers, getCourses } from "@/lib/data/repository";
import { SIGNALS } from "@/lib/scoring/signals";
import { DAYS, DAY_NAMES } from "@/lib/data/constants";
import { LinkButton } from "@/components/ui/Button";
import { Tile } from "@/components/ui/Tile";
import { Ring } from "@/components/ui/Ring";
import { Reveal } from "@/components/ui/Reveal";
import { Bar } from "@/components/ui/Bar";

export const metadata = { title: "Learnix — Your next term, figured out." };

export default async function LandingPage() {
  const [session, careers, courses] = await Promise.all([auth(), getCareers(), getCourses()]);
  const isAuthed = !!session?.user;
  const primaryHref = isAuthed ? "/home" : "/signup";
  const primaryLabel = isAuthed ? "Go to your home" : "Get started";

  const preview = courses.find((c) => c.code === "CS 361") ?? courses[0];
  const previewReasons = preview
    ? [preview.historyReason, preview.scheduleReason, preview.costReason]
    : [];

  const dayLoad = DAYS.map((d) => ({
    day: d,
    name: DAY_NAMES[d],
    hours: courses.filter((c) => c.days.includes(d)).reduce((sum, c) => sum + c.hoursPerWeek, 0),
  }));
  const maxDayHours = Math.max(1, ...dayLoad.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-salt text-ink font-body">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-stone/60 bg-salt/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-7">
          <span className="font-heading text-[17px] font-extrabold tracking-[-0.02em]">LEARNIX</span>
          <nav className="hidden items-center gap-7 text-[13.5px] font-semibold text-graphite md:flex">
            <Link href="#how-it-works" className="hover:text-ink">How it works</Link>
            <Link href="#courses" className="hover:text-ink">Courses</Link>
            <Link href="#careers" className="hover:text-ink">Careers</Link>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthed ? (
              <LinkButton href="/home" variant="primary" size="sm">Open Learnix</LinkButton>
            ) : (
              <>
                <Link href="/login" className="text-[13.5px] font-semibold hover:text-oxblood">Log in</Link>
                <LinkButton href="/signup" variant="primary" size="sm">Get started</LinkButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1120px] px-7 pb-16 pt-20 text-center">
        <Reveal variant="up">
          <div className="font-mono-label text-oxblood">Course recommendations, explained</div>
          <h1 className="mx-auto mt-5 max-w-[18ch] text-[clamp(44px,7vw,88px)] font-extrabold leading-[1] tracking-[-0.04em]">
            Your next term, figured out.
          </h1>
          <p className="mx-auto mt-6 max-w-[56ch] text-[17px] leading-[1.6] text-graphite">
            Learnix ranks every eligible course against your career goal, skill gaps, transcript
            and schedule — and tells you exactly why, in five weighted signals you can move
            yourself.
          </p>
          <div className="mt-8 flex items-center justify-center gap-5">
            <LinkButton href={primaryHref} variant="primary">{primaryLabel}</LinkButton>
            <Link href="#how-it-works" className="text-[14px] font-semibold text-oxblood hover:underline">
              See how it works
            </Link>
          </div>
        </Reveal>

        {/* App preview */}
        {preview && (
          <Reveal variant="rise" className="mt-16">
            <div className="dot-grid dot-grid-drift tile-hero relative overflow-hidden bg-ink p-10 text-salt shadow-hero">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ maskImage: "radial-gradient(circle at 50% 30%, black, transparent 75%)" }}
              />
              <div className="relative grid grid-cols-[1fr_280px] items-center gap-10 text-left">
                <div>
                  <div className="font-mono-label text-rose">Best fit for you</div>
                  <div className="mt-3 font-mono text-[12px] text-silver">{preview.code}</div>
                  <div className="mt-1 text-[28px] font-extrabold leading-[1.1]">{preview.name}</div>
                  <div className="mt-1.5 text-[13.5px] text-silver">{preview.instructorName} · {preview.slot}</div>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {previewReasons.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-[13.5px] text-blush/90">
                        <span aria-hidden className="mt-1 text-rose">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="tile flex flex-col items-center gap-3 bg-oxblood py-8 text-blush">
                  <Ring
                    pct={92}
                    size={132}
                    strokeWidth={9}
                    color="var(--color-blush)"
                    trackColor="rgba(243,228,230,.25)"
                    sublabel="match"
                    label="92%"
                  />
                  <div className="font-mono-label text-blush/80">Great fit</div>
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* Statement band */}
      <section className="relative overflow-hidden bg-ink py-24 text-center text-salt">
        <div
          aria-hidden
          className="glow-pulse absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-oxblood/50 blur-[100px]"
        />
        <Reveal variant="up" className="relative">
          <h2 className="mx-auto max-w-[16ch] text-[clamp(32px,5vw,60px)] font-extrabold tracking-[-0.03em]">
            Every pick tells you why.
          </h2>
        </Reveal>
      </section>

      {/* 3-tile row */}
      <section id="how-it-works" className="mx-auto max-w-[1120px] px-7 py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Reveal variant="grow">
            <Tile tone="pepper" hover className="h-full p-7">
              <div className="font-mono-label text-graphite">Goal pills</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {careers.map((c) => (
                  <span key={c.key} className="pill border-[1.5px] border-ink/25 px-3.5 py-1.5 text-[12.5px] font-semibold">
                    {c.name}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-[13.5px] leading-[1.5] text-graphite">
                Pick a target career — or stay undecided and keep every track open.
              </p>
            </Tile>
          </Reveal>

          <Reveal variant="grow" delay={0.09}>
            <Tile tone="ink" hover className="h-full p-7">
              <div className="font-mono-label text-silver">Record bars</div>
              <div className="mt-5 flex flex-col gap-3">
                {SIGNALS.map((s) => (
                  <div key={s.key}>
                    <div className="flex justify-between text-[12.5px] text-blush/85">
                      <span>{s.label}</span>
                      <span className="font-mono text-silver">{s.def}%</span>
                    </div>
                    <Bar pct={s.def} height={6} className="mt-1 bg-charcoal" fillClassName="bg-rose" />
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[13.5px] leading-[1.5] text-silver">
                Five signals, always visible. Tune the weights any time in Settings.
              </p>
            </Tile>
          </Reveal>

          <Reveal variant="grow" delay={0.18}>
            <Tile tone="pepper" hover className="h-full p-7">
              <div className="font-mono-label text-graphite">Week bars</div>
              <div className="mt-5 flex items-end gap-2.5" style={{ height: 96 }}>
                {dayLoad.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-full bg-oxblood"
                        style={{ height: `${Math.max(6, (d.hours / maxDayHours) * 100)}%` }}
                        aria-label={`${d.name}: ${d.hours} catalogue hours`}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-graphite">{d.day}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[13.5px] leading-[1.5] text-graphite">
                Real catalogue load by weekday, across {courses.length} courses this term.
              </p>
            </Tile>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-pepper py-20">
        <div className="mx-auto max-w-[640px] px-7 text-center">
          <Reveal variant="up">
            <h2 className="text-[clamp(28px,3.6vw,44px)] tracking-[-0.03em]">Ready to see your ranked courses?</h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-graphite">
              Set your career goal and constraints once — every screen after that uses the same
              candidate set and the same score.
            </p>
            <LinkButton href={primaryHref} variant="primary" className="mt-7">{primaryLabel}</LinkButton>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-stone/60 px-7 py-6 text-center text-[12.5px] text-graphite">
        LEARNIX — an explainable course recommender built for a recommender-systems project.
      </footer>
    </div>
  );
}
