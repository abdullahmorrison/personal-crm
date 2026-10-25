import { describe, expect, it } from "vitest";
import { firstName, initials } from "./names";

describe("initials", () => {
  it("uses first and last word", () => expect(initials("Sam de la Rivera")).toBe("SR"));
  it("uses two letters for one word", () => expect(initials("mom")).toBe("MO"));
  it("ignores extra spaces", () => expect(initials("  Priya   Shah ")).toBe("PS"));
});

describe("firstName", () => {
  it("returns the first word", () => expect(firstName("Priya Shah")).toBe("Priya"));
});
