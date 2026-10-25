import { describe, expect, it } from "vitest";
import { isDate, longDate, monthLabel, shortDate } from "./dates";

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
