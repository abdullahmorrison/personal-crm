import { afterEach, describe, expect, it, vi } from "vitest";
import { dayHeading, fromClock, dayLabel, isDate, isTime, localNow, localToday, momentTime, longDate, monthGrid, monthLabel, shiftMonth, shortDate, shortMonth, timeLabel, toClock } from "./dates";

describe("dates", () => {
  it("formats calendar days without shifting them", () => {
    expect(longDate("2026-10-22")).toBe("Thursday, October 22");
    expect(shortDate("2026-01-01")).toBe("Thu, Jan 1");
    expect(monthLabel("2026-12-31")).toBe("December 2026");
    expect(shortMonth("2026-01-01")).toBe("Jan");
  });

  it("accepts only real YYYY-MM-DD dates", () => {
    expect(isDate("2026-02-28")).toBe(true);
    expect(isDate("2026-02-30")).toBe(false);
    expect(isDate("2026-2-3")).toBe(false);
    expect(isDate("")).toBe(false);
  });
});

describe("times", () => {
  afterEach(() => vi.useRealTimers());

  it("accepts only real HH:MM times", () => {
    expect(isTime("00:00")).toBe(true);
    expect(isTime("23:59")).toBe(true);
    expect(isTime("24:00")).toBe(false);
    expect(isTime("7:15")).toBe(false);
  });

  it("formats them on a 12-hour clock", () => {
    expect(timeLabel("19:15")).toBe("7:15 PM");
    expect(timeLabel("00:05")).toBe("12:05 AM");
  });

  it("converts to a 12-hour clock and back", () => {
    expect(toClock("19:15")).toEqual({ hour: 7, minute: 15, pm: true });
    expect(toClock("00:05")).toEqual({ hour: 12, minute: 5, pm: false });
    expect(toClock("12:00")).toEqual({ hour: 12, minute: 0, pm: true });
    for (const t of ["00:00", "00:59", "11:30", "12:00", "12:45", "23:59"]) expect(fromClock(toClock(t))).toBe(t);
  });

  it("reads the viewer's clock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 22, 9, 5));
    expect(localNow()).toBe("09:05");
  });

  it("heads a day with its weekday, and the year only outside this one", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-02T12:00:00Z"));
    expect(dayHeading("2026-10-22")).toBe("Thursday, Oct 22");
    expect(dayHeading("2025-10-22")).toBe("Wednesday, Oct 22, 2025");
  });
});

describe("momentTime", () => {
  const today = "2026-10-22";
  it("is now for a new moment today, and empty for an earlier day", () => {
    expect(momentTime(today, today, "21:40")).toBe("21:40");
    expect(momentTime("2026-10-20", today, "21:40")).toBe("");
  });

  it("keeps an edit's saved time, even an empty one, unless the day changes", () => {
    expect(momentTime(today, today, "21:40", { date: today, time: "12:30" })).toBe("12:30");
    expect(momentTime(today, today, "21:40", { date: today, time: "" })).toBe("");
    expect(momentTime("2026-10-21", today, "21:40", { date: "2026-10-20", time: "19:15" })).toBe("");
    expect(momentTime(today, today, "21:40", { date: "2026-10-20", time: "19:15" })).toBe("21:40");
  });
});

describe("localToday", () => {
  const tz = process.env.TZ;
  afterEach(() => {
    vi.useRealTimers();
    process.env.TZ = tz;
  });

  it("uses the viewer's calendar day, not UTC's", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T03:30:00Z")); // still the 22nd in Toronto
    process.env.TZ = "America/Toronto";
    expect(localToday()).toBe("2026-10-22");

    vi.setSystemTime(new Date("2026-10-22T20:30:00Z")); // already the 23rd in Tokyo
    process.env.TZ = "Asia/Tokyo";
    expect(localToday()).toBe("2026-10-23");
  });
});

describe("dayLabel", () => {
  afterEach(() => vi.useRealTimers());

  it("adds the year only outside the current one", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
    expect(dayLabel("2026-02-03")).toBe("Feb 3");
    expect(dayLabel("2025-12-31")).toBe("Dec 31, 2025");
  });
});

describe("monthGrid", () => {
  it("starts on the right weekday and has every day of the month", () => {
    const { blanks, days } = monthGrid("2026-10-22"); // Oct 1 2026 is a Thursday
    expect(blanks).toBe(4);
    expect(days).toHaveLength(31);
    expect([days[0], days.at(-1)]).toEqual(["2026-10-01", "2026-10-31"]);
  });

  it("knows leap years", () => {
    expect(monthGrid("2028-02-10").days).toHaveLength(29);
    expect(monthGrid("2026-02-10").days).toHaveLength(28);
  });
});

describe("shiftMonth", () => {
  it("moves across years from any day of the month", () => {
    expect(shiftMonth("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftMonth("2026-01-31", -1)).toBe("2025-12-01");
  });
});
