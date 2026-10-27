/** Whole days from now until `date`, floored at 0. Kept out of any
 *  component body — `Date.now()` is an impure call components shouldn't
 *  make directly. */
export function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}
