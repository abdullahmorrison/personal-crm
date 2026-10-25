import { describe, expect, it } from "vitest";
import { openDb } from "./db";
import { createPerson } from "./people";
import { NEW_PERSON_CLOSENESS } from "./tiers";

describe("createPerson", () => {
  it("gives the first six people six different colors", () => {
    const db = openDb(":memory:");
    const colors = ["Sam", "Priya", "Jordan", "Leila", "Marcus", "Theo"].map((name) => createPerson(db, { name }).color);
    expect(new Set(colors).size).toBe(6);
  });

  it("puts new people in the outermost tier and trims the name", () => {
    const db = openDb(":memory:");
    const p = createPerson(db, { name: "  Noor " });
    expect(p.name).toBe("Noor");
    expect(p.closeness).toBe(NEW_PERSON_CLOSENESS);
  });
});
