import { describe, expect, it } from "vitest";
import { openDb } from "./db";
import { entries, entryPeople } from "@/db/schema";
import { createPerson, deletePerson, getPerson, moveToTier, updatePerson } from "./people";
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

  it("rejects a blank name", () => {
    const db = openDb(":memory:");
    expect(() => createPerson(db, { name: "   " })).toThrow("needs a name");
  });

  it("rejects a closeness outside the tiers", () => {
    const db = openDb(":memory:");
    expect(() => createPerson(db, { name: "Sam", closeness: 0 })).toThrow("Unknown closeness");
    expect(() => createPerson(db, { name: "Sam", closeness: 7 })).toThrow("Unknown closeness");
  });
});

describe("updatePerson", () => {
  it("changes name, closeness, and notes but keeps the color", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam" });
    const updated = updatePerson(db, sam.id, { name: " Sam Rivera ", closeness: 1, notes: " Met at soccer " });
    expect(updated).toMatchObject({ name: "Sam Rivera", closeness: 1, notes: "Met at soccer", color: sam.color });
  });

  it("applies the same checks as creating", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam" });
    expect(() => updatePerson(db, sam.id, { name: "" })).toThrow("needs a name");
    expect(() => updatePerson(db, sam.id, { name: "Sam", closeness: 9 })).toThrow("Unknown closeness");
  });

  it("fails clearly when the person is gone", () => {
    const db = openDb(":memory:");
    expect(() => updatePerson(db, 999, { name: "Ghost" })).toThrow("no longer exists");
  });
});

describe("deletePerson", () => {
  it("removes the person but keeps their moments", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam" });
    const entry = db.insert(entries).values({ body: "Ramen", date: "2026-10-20" }).returning().get();
    db.insert(entryPeople).values({ entryId: entry.id, personId: sam.id }).run();

    deletePerson(db, sam.id);

    expect(getPerson(db, sam.id)).toBeUndefined();
    expect(db.select().from(entries).all()).toHaveLength(1);
    expect(db.select().from(entryPeople).all()).toHaveLength(0);
  });
});

describe("moveToTier", () => {
  it("changes only the closeness", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam", notes: "Soccer" });
    expect(moveToTier(db, sam.id, 1)).toMatchObject({ name: "Sam", notes: "Soccer", color: sam.color, closeness: 1 });
  });

  it("rejects unknown tiers and missing people", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam" });
    expect(() => moveToTier(db, sam.id, 0)).toThrow("Unknown closeness");
    expect(() => moveToTier(db, 999, 1)).toThrow("no longer exists");
  });
});
