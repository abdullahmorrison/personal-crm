import { afterEach, describe, expect, it, vi } from "vitest";
import { dayLabel, isDate, localToday, longDate, monthGrid, monthLabel, shiftMonth, shortDate, shortMonth } from "./dates";

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
