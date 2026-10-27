// Primary nav mirrors the design's derived `nav` array exactly:
// [['home','Home'],['explore','Explore'],['progress','Progress'],['saved','Saved · N']].
// Compare and Path are bonus screens (kept restyled, not part of the
// original 9-screen spec) surfaced as a secondary row.
export const PRIMARY_NAV = [
  { href: "/home", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/progress", label: "Progress" },
  { href: "/saved", label: "Saved" },
] as const;

export const SECONDARY_NAV = [
  { href: "/compare", label: "Compare" },
  { href: "/path", label: "Path" },
] as const;
