import { describe, expect, it } from "vitest";
import { nextColor, PERSON_COLORS, personColor } from "./person-colors";

describe("nextColor", () => {
  it("starts with the first color", () => {
    expect(nextColor(new Map())).toBe(0);
  });

  it("takes the least-used color", () => {
    expect(nextColor(new Map([[0, 2], [1, 1], [2, 2], [3, 2], [4, 2], [5, 2]]))).toBe(1);
  });

  it("breaks ties by list order", () => {
    expect(nextColor(new Map([[0, 1], [1, 1]]))).toBe(2);
  });
});

describe("personColor", () => {
  it("wraps out-of-range indexes", () => {
    expect(personColor(PERSON_COLORS.length).name).toBe("clay");
    expect(personColor(-1).name).toBe("rose");
  });
});
