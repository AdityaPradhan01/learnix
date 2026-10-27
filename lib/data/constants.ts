// Fixed app taxonomy — not student data. Interests are tags a student picks
// from during onboarding; days are the five weekday keys used everywhere a
// course's meeting days or a student's off-days are represented.
export const INTEREST_OPTIONS = [
  "Machine learning",
  "Statistics",
  "Databases",
  "Systems",
  "Visualisation",
  "Human factors",
  "Algorithms",
  "Security",
  "Maths",
  "Writing",
] as const;

export const DAYS = ["M", "T", "W", "R", "F"] as const;
export type DayKey = (typeof DAYS)[number];

export const DAY_NAMES: Record<DayKey, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday",
};
