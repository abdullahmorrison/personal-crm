// Moments store dates as plain YYYY-MM-DD. Formatting treats them as calendar days in UTC,
// so a moment never shifts a day because of the viewer's time zone.
const day = (date: string) => new Date(`${date}T00:00:00Z`);
const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });

export function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && day(value).toISOString().startsWith(value);
}

/** "Thursday, October 22" */
export const longDate = (date: string) => fmt({ weekday: "long", month: "long", day: "numeric" }).format(day(date));

/** "Thu, Oct 22" */
export const shortDate = (date: string) => fmt({ weekday: "short", month: "short", day: "numeric" }).format(day(date));

/** "October 2026" */
export const monthLabel = (date: string) => fmt({ month: "long", year: "numeric" }).format(day(date));

/** Today in the viewer's own time zone, as YYYY-MM-DD. */
export function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** The calendar for the month holding `date`: blank cells before the 1st (weeks start Sunday), then every day. */
export function monthGrid(date: string) {
  const first = day(`${date.slice(0, 7)}-01`);
  const blanks = first.getUTCDay();
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const days = Array.from({ length: count }, (_, i) => `${date.slice(0, 8)}${String(i + 1).padStart(2, "0")}`);
  return { blanks, days };
}

/** The 1st of the month `months` away from `date`'s month. */
export function shiftMonth(date: string, months: number) {
  const d = day(`${date.slice(0, 7)}-01`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}
