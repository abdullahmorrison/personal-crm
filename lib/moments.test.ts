import { describe, expect, it } from "vitest";
import { entryPeople } from "@/db/schema";
import { openDb } from "./db";
import { createMoment, deleteMoment, getMoment, groupByMonth, listMoments, updateMoment } from "./moments";
import { createPerson, deletePerson } from "./people";

function setup() {
  const db = openDb(":memory:");
  const sam = createPerson(db, { name: "Sam Rivera" });
  const priya = createPerson(db, { name: "Priya Shah" });
  return { db, sam, priya };
}

describe("createMoment", () => {
  it("saves the text, date, and people", () => {
    const { db, sam, priya } = setup();
    const m = createMoment(db, { body: "  Ramen on 5th.  ", date: "2026-10-20", personIds: [sam.id, priya.id, sam.id] });
    expect(getMoment(db, m.id)).toMatchObject({
      body: "Ramen on 5th.",
      date: "2026-10-20",
      people: [
        { id: priya.id, name: "Priya Shah" },
        { id: sam.id, name: "Sam Rivera" },
      ],
    });
  });

  it("allows a solo moment", () => {
    const { db } = setup();
    const m = createMoment(db, { body: "Rough day.", date: "2026-10-22", personIds: [] });
    expect(getMoment(db, m.id)?.people).toEqual([]);
  });

  it("rejects empty text, bad dates, and unknown people", () => {
    const { db } = setup();
    expect(() => createMoment(db, { body: "  ", date: "2026-10-22", personIds: [] })).toThrow("Write something");
    expect(() => createMoment(db, { body: "Hi", date: "2026-02-30", personIds: [] })).toThrow("Pick a date");
    expect(() => createMoment(db, { body: "Hi", date: "2026-10-22", personIds: [999] })).toThrow("no longer exists");
    expect(listMoments(db)).toHaveLength(0);
  });
});

describe("updateMoment", () => {
  it("replaces the text, date, and people", () => {
    const { db, sam, priya } = setup();
    const m = createMoment(db, { body: "Ramen", date: "2026-10-20", personIds: [sam.id] });
    updateMoment(db, m.id, { body: "Ramen with Priya", date: "2026-10-21", personIds: [priya.id] });
    expect(getMoment(db, m.id)).toMatchObject({ body: "Ramen with Priya", date: "2026-10-21", people: [{ id: priya.id }] });
  });

  it("leaves the moment as it was when an edit is rejected", () => {
    const { db, sam } = setup();
    const m = createMoment(db, { body: "Ramen", date: "2026-10-20", personIds: [sam.id] });
    expect(() => updateMoment(db, m.id, { body: "  ", date: "2026-10-21", personIds: [] })).toThrow("Write something");
    expect(() => updateMoment(db, m.id, { body: "Ramen", date: "2026-10-21", personIds: [999] })).toThrow("no longer exists");
    expect(getMoment(db, m.id)).toMatchObject({ body: "Ramen", date: "2026-10-20", people: [{ id: sam.id }] });
  });

  it("fails clearly when the moment is gone", () => {
    const { db } = setup();
    expect(() => updateMoment(db, 999, { body: "Hi", date: "2026-10-22", personIds: [] })).toThrow("no longer exists");
  });
});

describe("deleteMoment", () => {
  it("removes the moment and its links", () => {
    const { db, sam } = setup();
    const m = createMoment(db, { body: "Ramen", date: "2026-10-20", personIds: [sam.id] });
    deleteMoment(db, m.id);
    expect(getMoment(db, m.id)).toBeUndefined();
    expect(db.select().from(entryPeople).all()).toHaveLength(0);
  });
});

describe("listMoments", () => {
  it("lists newest first, and a deleted person drops out of their moments", () => {
    const { db, sam } = setup();
    createMoment(db, { body: "Older", date: "2026-09-14", personIds: [sam.id] });
    createMoment(db, { body: "Newer", date: "2026-10-20", personIds: [sam.id] });
    createMoment(db, { body: "Same day, later", date: "2026-10-20", personIds: [] });
    expect(listMoments(db).map((m) => m.body)).toEqual(["Same day, later", "Newer", "Older"]);
    deletePerson(db, sam.id);
    expect(listMoments(db).every((m) => m.people.length === 0)).toBe(true);
  });
});

describe("groupByMonth", () => {
  it("groups consecutive moments by month in order", () => {
    const groups = groupByMonth([{ date: "2026-10-22" }, { date: "2026-10-01" }, { date: "2026-09-14" }]);
    expect(groups.map((g) => [g.label, g.moments.length])).toEqual([
      ["October 2026", 2],
      ["September 2026", 1],
    ]);
  });
});
