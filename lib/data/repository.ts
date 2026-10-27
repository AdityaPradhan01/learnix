import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { CareerTarget, Course, SkillVector, SubscoreContext, Weights } from "@/lib/scoring";
import { DEFAULT_WEIGHTS, currentSkills } from "@/lib/scoring";

/**
 * The one seam between the app and its data. Every read and write below
 * goes through Prisma against a real Postgres database — nothing here is a
 * fixture. Course/career rows are mapped into the plain shapes lib/scoring
 * expects so the ranking math never has to know about Prisma.
 *
 * Performance: every exported read is wrapped in React's `cache()` so
 * repeated calls with the same arguments within one request (e.g.
 * `generateMetadata` and the page body both asking for the same course, or
 * a component re-deriving data the layout already fetched) hit memory, not
 * the database, once per request. Catalogue reads that are identical for
 * every student (`getCourses`, `getCareers`, `getCareer`) additionally use
 * `unstable_cache` so they're shared *across* requests for a short window —
 * the biggest single win, since the course+instructor join otherwise ran on
 * every single page view for every student. Per-student reads (profile,
 * weights, saved/hidden ids, transcript, notifications) get the same
 * `unstable_cache` treatment on a shorter window — the database is a pooled
 * remote Postgres instance, so without it AppShell's three per-student
 * queries alone would cost a network round trip on every page view.
 */

// ── Mapping: Prisma rows → scoring-engine shapes ──────────────────────────

type CourseWithInstructor = Prisma.CourseGetPayload<{ include: { instructor: true } }>;

function toSkillVector(row: {
  skMl: number;
  skStat: number;
  skSys: number;
  skAlg: number;
  skPrac: number;
}): SkillVector {
  return { ml: row.skMl, stat: row.skStat, sys: row.skSys, alg: row.skAlg, prac: row.skPrac };
}

function toCourse(row: CourseWithInstructor): Course {
  return {
    id: row.id,
    code: row.code,
    dept: row.dept,
    name: row.name,
    credits: row.credits,
    hoursPerWeek: row.hoursPerWeek,
    days: row.days,
    startTime: row.startTime,
    endTime: row.endTime,
    slot: row.slot,
    seats: row.seats,
    capacity: row.capacity,
    instructorId: row.instructorId,
    instructorName: row.instructor.name,
    rating: row.rating,
    reviewCount: row.reviewCount,
    ratingDist: row.ratingDist,
    sk: toSkillVector(row),
    historyScore: row.historyScore,
    scheduleScore: row.scheduleScore,
    costScore: row.costScore,
    historyReason: row.historyReason,
    scheduleReason: row.scheduleReason,
    costReason: row.costReason,
    prerequisites: row.prerequisites,
    blurb: row.blurb,
    requirementCategory: row.requirementCategory,
  };
}

function toCareerTarget(row: {
  key: string;
  name: string;
  desc: string;
  tMl: number;
  tStat: number;
  tSys: number;
  tAlg: number;
  tPrac: number;
}): CareerTarget {
  return {
    key: row.key,
    name: row.name,
    desc: row.desc,
    target: { ml: row.tMl, stat: row.tStat, sys: row.tSys, alg: row.tAlg, prac: row.tPrac },
  };
}

// ── Catalogue reads ────────────────────────────────────────────────────────
// Shared across every student and cheap to run a little stale — cached
// across requests for 60s, on top of the per-request memoization every
// exported function gets below.

const CATALOGUE_REVALIDATE_SECONDS = 1800;

// Per-student reads below share the same cross-request cache, on a shorter
// window since they change far more often than the catalogue. The database
// is a pooled remote Postgres instance, so every read that skips this cache
// costs a full network round trip — and AppShell alone fans out three of
// these on every single page view. Every mutation that touches this data
// already calls revalidatePath("/", "layout") (see app/(app)/actions.ts and
// app/onboarding/actions.ts), which invalidates unstable_cache entries the
// same way it does React's cache(), so a toggle/save/edit is reflected on
// the very next request rather than waiting out the window.
const USER_REVALIDATE_SECONDS = 300;

export const getCareers = cache(
  unstable_cache(
    async (): Promise<CareerTarget[]> => {
      const rows = await prisma.career.findMany({ orderBy: { name: "asc" } });
      return rows.map(toCareerTarget);
    },
    ["learnix-careers"],
    { revalidate: CATALOGUE_REVALIDATE_SECONDS },
  ),
);

export const getCareer = cache(
  unstable_cache(
    async (key: string): Promise<CareerTarget | null> => {
      const row = await prisma.career.findUnique({ where: { key } });
      return row ? toCareerTarget(row) : null;
    },
    ["learnix-career"],
    { revalidate: CATALOGUE_REVALIDATE_SECONDS },
  ),
);

export const getCourses = cache(
  unstable_cache(
    async (): Promise<Course[]> => {
      const rows = await prisma.course.findMany({ include: { instructor: true }, orderBy: { code: "asc" } });
      return rows.map(toCourse);
    },
    ["learnix-courses"],
    { revalidate: CATALOGUE_REVALIDATE_SECONDS },
  ),
);

export const getCourseById = cache(
  unstable_cache(
    async (id: string): Promise<Course | null> => {
      const row = await prisma.course.findUnique({ where: { id }, include: { instructor: true } });
      return row ? toCourse(row) : null;
    },
    ["learnix-course-by-id"],
    { revalidate: CATALOGUE_REVALIDATE_SECONDS },
  ),
);

export interface CourseDetail extends Course {
  instructor: { name: string; role: string; years: number; rating: number; bio: string };
  syllabus: string[];
  assessment: { name: string; percent: number }[];
  reviews: { who: string; term: string; stars: number; text: string }[];
}

export const getCourseDetail = cache(
  unstable_cache(
    async (id: string): Promise<CourseDetail | null> => {
      const row = await prisma.course.findUnique({
        where: { id },
        include: { instructor: true, reviews: true },
      });
      if (!row) return null;
      return {
        ...toCourse(row),
        instructor: {
          name: row.instructor.name,
          role: row.instructor.role,
          years: row.instructor.years,
          rating: row.instructor.rating,
          bio: row.instructor.bio,
        },
        syllabus: row.syllabus,
        assessment: row.assessment as { name: string; percent: number }[],
        reviews: row.reviews.map((r) => ({ who: r.who, term: r.term, stars: r.stars, text: r.text })),
      };
    },
    ["learnix-course-detail"],
    { revalidate: CATALOGUE_REVALIDATE_SECONDS },
  ),
);

// Derived from the already-cached course list rather than its own query —
// also sidesteps unstable_cache, which JSON-serializes its result and so
// cannot safely cache a Set.
export const getCatalogueCodes = cache(async (): Promise<Set<string>> => {
  const courses = await getCourses();
  return new Set(courses.map((c) => c.code));
});

// ── Per-student reads ───────────────────────────────────────────────────────

export interface StudentProfile {
  careerKey: string;
  interests: string[];
  hours: number;
  offDays: string[];
  onboarded: boolean;
  largeText: boolean;
}

const DEFAULT_PROFILE: StudentProfile = {
  careerKey: "unsure",
  interests: [],
  hours: 30,
  offDays: [],
  onboarded: false,
  largeText: false,
};

export const getProfile = cache(
  unstable_cache(
    async (userId: string): Promise<StudentProfile> => {
      const row = await prisma.profile.findUnique({ where: { userId } });
      if (!row) return DEFAULT_PROFILE;
      return {
        careerKey: row.careerKey,
        interests: row.interests,
        hours: row.hours,
        offDays: row.offDays,
        onboarded: row.onboarded,
        largeText: row.largeText,
      };
    },
    ["learnix-profile"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

export const getWeights = cache(
  unstable_cache(
    async (userId: string): Promise<Weights> => {
      const row = await prisma.weightsProfile.findUnique({ where: { userId } });
      if (!row) return DEFAULT_WEIGHTS;
      return { goals: row.goals, gap: row.gap, history: row.history, schedule: row.schedule, cost: row.cost };
    },
    ["learnix-weights"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

export interface NotificationPrefs {
  deadlines: boolean;
  seats: boolean;
  newCourses: boolean;
  email: boolean;
}

export const getNotificationSettings = cache(
  unstable_cache(
    async (userId: string): Promise<NotificationPrefs> => {
      const row = await prisma.notificationSettings.findUnique({ where: { userId } });
      return row ?? { deadlines: true, seats: true, newCourses: true, email: false };
    },
    ["learnix-notification-settings"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

export interface TranscriptRow {
  courseId: string;
  code: string;
  name: string;
  credits: number;
  grade: string | null;
  term: string;
  confirmed: boolean;
}

export const getTranscript = cache(
  unstable_cache(
    async (userId: string): Promise<TranscriptRow[]> => {
      const rows = await prisma.transcriptEntry.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { course: { code: "asc" } },
      });
      return rows.map((r) => ({
        courseId: r.courseId,
        code: r.course.code,
        name: r.course.name,
        credits: r.course.credits,
        grade: r.grade,
        term: r.term,
        confirmed: r.confirmed,
      }));
    },
    ["learnix-transcript"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

// Cached as the plain array unstable_cache can serialize; Sets are derived
// outside the cache boundary, same pattern as getCatalogueCodes above.
const getTakenCodeList = unstable_cache(
  async (userId: string): Promise<string[]> => {
    const rows = await prisma.transcriptEntry.findMany({
      where: { userId, confirmed: true },
      include: { course: { select: { code: true } } },
    });
    return rows.map((r) => r.course.code);
  },
  ["learnix-taken-codes"],
  { revalidate: USER_REVALIDATE_SECONDS },
);

export const getTakenCodes = cache(async (userId: string): Promise<Set<string>> => {
  return new Set(await getTakenCodeList(userId));
});

const getConfirmedTranscriptCourses = cache(
  unstable_cache(
    async (userId: string): Promise<Course[]> => {
      const rows = await prisma.transcriptEntry.findMany({
        where: { userId, confirmed: true },
        include: { course: { include: { instructor: true } } },
      });
      return rows.map((r) => toCourse(r.course));
    },
    ["learnix-confirmed-transcript-courses"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

const getSavedCourseIdList = unstable_cache(
  async (userId: string): Promise<string[]> => {
    const rows = await prisma.savedCourse.findMany({ where: { userId }, select: { courseId: true } });
    return rows.map((r) => r.courseId);
  },
  ["learnix-saved-course-ids"],
  { revalidate: USER_REVALIDATE_SECONDS },
);

export const getSavedCourseIds = cache(async (userId: string): Promise<Set<string>> => {
  return new Set(await getSavedCourseIdList(userId));
});

const getHiddenCourseIdList = unstable_cache(
  async (userId: string): Promise<string[]> => {
    const rows = await prisma.hiddenCourse.findMany({ where: { userId }, select: { courseId: true } });
    return rows.map((r) => r.courseId);
  },
  ["learnix-hidden-course-ids"],
  { revalidate: USER_REVALIDATE_SECONDS },
);

export const getHiddenCourseIds = cache(async (userId: string): Promise<Set<string>> => {
  return new Set(await getHiddenCourseIdList(userId));
});

export const getSavedCourses = cache(
  unstable_cache(
    async (userId: string): Promise<Course[]> => {
      const rows = await prisma.savedCourse.findMany({
        where: { userId },
        include: { course: { include: { instructor: true } } },
        orderBy: { savedAt: "asc" },
      });
      return rows.map((r) => toCourse(r.course));
    },
    ["learnix-saved-courses"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

export const getHiddenCourses = cache(
  unstable_cache(
    async (userId: string): Promise<Course[]> => {
      const rows = await prisma.hiddenCourse.findMany({
        where: { userId },
        include: { course: { include: { instructor: true } } },
        orderBy: { hiddenAt: "desc" },
      });
      return rows.map((r) => toCourse(r.course));
    },
    ["learnix-hidden-courses"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

/** Everything the scoring engine needs to rank courses for this student, in one call. */
export interface ScoringContext {
  have: SkillVector;
  career: CareerTarget;
  weights: Weights;
  subscoreContext: SubscoreContext;
  hiddenIds: Set<string>;
  savedIds: Set<string>;
  offDays: string[];
}

export const getScoringContext = cache(async (userId: string): Promise<ScoringContext> => {
  // Each of these is itself request-memoized, so callers that also fetch
  // e.g. getProfile or getSavedCourseIds directly incur no extra query.
  // takenCodes is derived from takenCourses below rather than its own
  // query — same underlying rows, no reason to ask twice.
  const [profile, weights, catalogueCodes, hiddenIds, savedIds, takenCourses] = await Promise.all([
    getProfile(userId),
    getWeights(userId),
    getCatalogueCodes(),
    getHiddenCourseIds(userId),
    getSavedCourseIds(userId),
    getConfirmedTranscriptCourses(userId),
  ]);
  const takenCodes = new Set(takenCourses.map((c) => c.code));
  const career = (await getCareer(profile.careerKey)) ?? { key: "unsure", name: "Still deciding", desc: "", target: { ml: 0.6, stat: 0.6, sys: 0.6, alg: 0.6, prac: 0.6 } };
  return {
    have: currentSkills(takenCourses),
    career,
    weights,
    subscoreContext: { interests: profile.interests, hours: profile.hours, catalogueCodes, takenCodes },
    hiddenIds,
    savedIds,
    offDays: profile.offDays,
  };
});

// ── Degree progress & GPA (derived, never stored) ──────────────────────────

const GRADE_POINTS: Record<string, number> = {
  A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, "C-": 1.7, D: 1.0, F: 0,
};

export interface RequirementProgress {
  name: string;
  have: number;
  need: number;
  pct: number;
}

// Shared by getDegreeProgress/getTotalCredits/getGpa — one query instead of
// three near-identical ones when a page needs more than one of them.
const getConfirmedTranscriptWithCredits = cache(
  unstable_cache(
    async (userId: string) => {
      return prisma.transcriptEntry.findMany({
        where: { userId, confirmed: true },
        include: { course: { select: { credits: true, requirementCategory: true } } },
      });
    },
    ["learnix-confirmed-transcript-credits"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

// Program requirement buckets are static reference data (like Career/Course)
// with no mutation path anywhere in the app — safe to cache on the long
// catalogue window with no staleness risk.
const getProgramRequirements = cache(
  unstable_cache(
    async (program: string) => prisma.programRequirement.findMany({ where: { program } }),
    ["learnix-program-requirements"],
    { revalidate: CATALOGUE_REVALIDATE_SECONDS },
  ),
);

export const getDegreeProgress = cache(async (userId: string): Promise<RequirementProgress[]> => {
  const [user, transcript] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { program: true } }),
    getConfirmedTranscriptWithCredits(userId),
  ]);
  const requirements = await getProgramRequirements(user?.program ?? "");
  return requirements.map((req) => {
    const have = transcript
      .filter((t) => t.course.requirementCategory === req.name)
      .reduce((sum, t) => sum + t.course.credits, 0);
    return { name: req.name, have, need: req.creditsNeed, pct: Math.round((have / req.creditsNeed) * 100) };
  });
});

export const getTotalCredits = cache(async (userId: string): Promise<number> => {
  const rows = await getConfirmedTranscriptWithCredits(userId);
  return rows.reduce((sum, r) => sum + r.course.credits, 0);
});

/** Only graded, confirmed courses count toward GPA — a self-reported
 *  "already taken" entry from onboarding has no grade and is excluded. */
export const getGpa = cache(
  unstable_cache(
    async (userId: string): Promise<number> => {
      const rows = await prisma.transcriptEntry.findMany({
        where: { userId, confirmed: true, grade: { not: null } },
        include: { course: { select: { credits: true } } },
      });
      if (rows.length === 0) return 0;
      let points = 0;
      let credits = 0;
      for (const r of rows) {
        const gp = GRADE_POINTS[r.grade!] ?? 0;
        points += gp * r.course.credits;
        credits += r.course.credits;
      }
      return credits ? Math.round((points / credits) * 100) / 100 : 0;
    },
    ["learnix-gpa"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

// ── Notifications ───────────────────────────────────────────────────────────

export interface NotificationRow {
  id: string;
  kind: "Deadline" | "Seats" | "New";
  title: string;
  body: string;
  occursAt: Date | null;
  read: boolean;
}

// The notification list itself is the same for every student (like the
// catalogue) — only read/unread status is per-user. Cached separately so
// the shared list rides the long catalogue window while read status stays
// on the shorter per-user one. occursAt round-trips as an ISO string since
// unstable_cache JSON-serializes its result; getNotifications below turns
// it back into a Date so callers (e.g. daysUntil) see the same shape as
// before this was cached.
const getCachedNotificationList = unstable_cache(
  async () => {
    const notifs = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
    return notifs.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      occursAt: n.occursAt ? n.occursAt.toISOString() : null,
    }));
  },
  ["learnix-notification-list"],
  { revalidate: CATALOGUE_REVALIDATE_SECONDS },
);

const getReadNotificationIds = cache(
  unstable_cache(
    async (userId: string): Promise<string[]> => {
      const reads = await prisma.notificationRead.findMany({ where: { userId }, select: { notificationId: true } });
      return reads.map((r) => r.notificationId);
    },
    ["learnix-notification-reads"],
    { revalidate: USER_REVALIDATE_SECONDS },
  ),
);

export const getNotifications = cache(async (userId: string): Promise<NotificationRow[]> => {
  const [notifs, readIds] = await Promise.all([getCachedNotificationList(), getReadNotificationIds(userId)]);
  const readSet = new Set(readIds);
  return notifs.map((n) => ({
    id: n.id,
    kind: n.kind as NotificationRow["kind"],
    title: n.title,
    body: n.body,
    occursAt: n.occursAt ? new Date(n.occursAt) : null,
    read: readSet.has(n.id),
  }));
});

/** Every page reaches this via the top nav, so it rides on the same
 *  request-memoized getNotifications() call the Updates screen makes
 *  rather than issuing its own count queries. */
export const getUnreadNotificationCount = cache(async (userId: string): Promise<number> => {
  const notifications = await getNotifications(userId);
  return notifications.filter((n) => !n.read).length;
});

// ── Mutations ────────────────────────────────────────────────────────────

export async function createStudentAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
  program: string;
  year: number;
  careerKey: string;
}) {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      program: input.program,
      year: input.year,
      profile: { create: { careerKey: input.careerKey, interests: [], hours: 30, offDays: [], onboarded: false } },
      weights: { create: { ...DEFAULT_WEIGHTS } },
      notifSettings: { create: {} },
    },
  });
  return user;
}

export async function updateOnboarding(
  userId: string,
  input: { careerKey: string; interests: string[]; hours: number; offDays: string[]; takenCourseIds: string[] },
) {
  await prisma.$transaction([
    prisma.profile.upsert({
      where: { userId },
      update: { careerKey: input.careerKey, interests: input.interests, hours: input.hours, offDays: input.offDays, onboarded: true },
      create: { userId, careerKey: input.careerKey, interests: input.interests, hours: input.hours, offDays: input.offDays, onboarded: true },
    }),
    ...input.takenCourseIds.map((courseId) =>
      prisma.transcriptEntry.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { confirmed: true },
        // Self-reported during onboarding, not a registrar grade — left
        // ungraded rather than inventing a letter grade (see getGpa).
        create: { userId, courseId, grade: null, term: "Prior term", confirmed: true },
      }),
    ),
  ]);
}

export async function setTranscriptConfirmed(userId: string, courseId: string, confirmed: boolean) {
  await prisma.transcriptEntry.updateMany({ where: { userId, courseId }, data: { confirmed } });
}

export async function setWeights(userId: string, weights: Weights) {
  await prisma.weightsProfile.upsert({
    where: { userId },
    update: weights,
    create: { userId, ...weights },
  });
}

export async function resetWeights(userId: string) {
  await setWeights(userId, DEFAULT_WEIGHTS);
}

export async function setNotificationSettings(userId: string, prefs: NotificationPrefs) {
  await prisma.notificationSettings.upsert({
    where: { userId },
    update: prefs,
    create: { userId, ...prefs },
  });
}

export async function setLargeText(userId: string, largeText: boolean) {
  await prisma.profile.update({ where: { userId }, data: { largeText } });
}

export async function toggleSaved(userId: string, courseId: string): Promise<boolean> {
  const existing = await prisma.savedCourse.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) {
    await prisma.savedCourse.delete({ where: { userId_courseId: { userId, courseId } } });
    return false;
  }
  await prisma.savedCourse.create({ data: { userId, courseId } });
  return true;
}

export async function toggleHidden(userId: string, courseId: string): Promise<boolean> {
  const existing = await prisma.hiddenCourse.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) {
    await prisma.hiddenCourse.delete({ where: { userId_courseId: { userId, courseId } } });
    return false;
  }
  await prisma.hiddenCourse.create({ data: { userId, courseId } });
  return true;
}

export async function markNotificationRead(userId: string, notificationId: string, read: boolean) {
  if (read) {
    await prisma.notificationRead.upsert({
      where: { userId_notificationId: { userId, notificationId } },
      update: {},
      create: { userId, notificationId },
    });
  } else {
    await prisma.notificationRead
      .delete({ where: { userId_notificationId: { userId, notificationId } } })
      .catch(() => undefined);
  }
}

export async function markAllNotificationsRead(userId: string) {
  const notifs = await prisma.notification.findMany({ select: { id: true } });
  await prisma.notificationRead.createMany({
    data: notifs.map((n) => ({ userId, notificationId: n.id })),
    skipDuplicates: true,
  });
}
