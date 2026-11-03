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

// Shows the year only for dates outside the current one.
const yearIfOther = (date: string) => (day(date).getUTCFullYear() === new Date().getUTCFullYear() ? undefined : "numeric");

/** "Oct 22", or "Oct 22, 2024" outside the current year */
export const dayLabel = (date: string) => fmt({ month: "short", day: "numeric", year: yearIfOther(date) }).format(day(date));

/** "Thursday, Oct 22", or "Thursday, Oct 22, 2024" outside the current year */
export const dayHeading = (date: string) => fmt({ weekday: "long", month: "short", day: "numeric", year: yearIfOther(date) }).format(day(date));

/** "Oct" */
export const shortMonth = (date: string) => fmt({ month: "short" }).format(day(date));

/** "October 2026" */
export const monthLabel = (date: string) => fmt({ month: "long", year: "numeric" }).format(day(date));

/** Today in the viewer's own time zone, as YYYY-MM-DD. */
export function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

// Times are plain HH:MM on the writer's clock, beside the date they belong to.
export function isTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** "7:15 PM" */
export const timeLabel = (time: string) => fmt({ hour: "numeric", minute: "2-digit" }).format(new Date(`1970-01-01T${time}:00Z`));

/** "19:15" as the parts of a 12-hour clock: { hour: 7, minute: 15, pm: true } */
export function toClock(time: string) {
  const [h, minute] = time.split(":").map(Number);
  return { hour: h % 12 || 12, minute, pm: h >= 12 };
}

/** The parts of a 12-hour clock back to HH:MM. */
export function fromClock({ hour, minute, pm }: { hour: number; minute: number; pm: boolean }) {
  return `${String((hour % 12) + (pm ? 12 : 0)).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** The time now on the viewer's own clock, as HH:MM. */
export function localNow() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * The time to save with a moment on `date`. An edit keeps its saved time unless the day changes;
 * otherwise a moment logged on its day gets the time now, and one logged later none, rather than a wrong one.
 */
export function momentTime(date: string, today: string, now: string, saved?: { date: string; time: string }) {
  if (date === saved?.date) return saved.time;
  return date === today ? now : "";
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
