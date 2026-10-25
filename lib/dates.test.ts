import { afterEach, describe, expect, it, vi } from "vitest";
import { isDate, localToday, longDate, monthLabel, shortDate } from "./dates";

describe("dates", () => {
  it("formats calendar days without shifting them", () => {
    expect(longDate("2026-10-22")).toBe("Thursday, October 22");
    expect(shortDate("2026-01-01")).toBe("Thu, Jan 1");
    expect(monthLabel("2026-12-31")).toBe("December 2026");
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
