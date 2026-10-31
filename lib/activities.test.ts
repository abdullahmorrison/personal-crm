import { describe, expect, it } from "vitest";
import { openDb } from "./db";
import { createActivity, deleteActivity, getActivity, listActivities, updateActivity } from "./activities";
import { createPerson, deletePerson, getPerson } from "./people";

describe("createActivity", () => {
  it("trims the name and notes and keeps who it's with", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam" });
    const a = createActivity(db, { name: " Pickleball ", icon: "pickleball", notes: " Tuesdays ", personIds: [sam.id] });
    expect(a).toMatchObject({ name: "Pickleball", icon: "pickleball", notes: "Tuesdays" });
    expect(getActivity(db, a.id)?.people.map((p) => p.name)).toEqual(["Sam"]);
  });

  it("rejects a blank name or an unknown icon", () => {
    const db = openDb(":memory:");
    expect(() => createActivity(db, { name: "  ", icon: "dices" })).toThrow("needs a name");
    expect(() => createActivity(db, { name: "Chess", icon: "chess" })).toThrow("Unknown icon");
  });
});

describe("updateActivity", () => {
  it("replaces who it's with", () => {
    const db = openDb(":memory:");
    const [sam, priya] = ["Sam", "Priya"].map((name) => createPerson(db, { name }));
    const a = createActivity(db, { name: "Hiking", icon: "mountain-snow", personIds: [sam.id] });
    updateActivity(db, a.id, { name: "Hiking", icon: "mountain-snow", personIds: [priya.id, priya.id] });
    expect(getActivity(db, a.id)?.people.map((p) => p.name)).toEqual(["Priya"]);
  });

  it("fails clearly when the activity is gone", () => {
    const db = openDb(":memory:");
    expect(() => updateActivity(db, 999, { name: "Ghost", icon: "dices" })).toThrow("no longer exists");
  });
});

describe("listActivities", () => {
  it("puts the activities with the most people first, then by name", () => {
    const db = openDb(":memory:");
    const [sam, priya] = ["Sam", "Priya"].map((name) => createPerson(db, { name }));
    createActivity(db, { name: "Climbing", icon: "mountain" });
    createActivity(db, { name: "Board games", icon: "dices", personIds: [sam.id] });
    createActivity(db, { name: "Pickleball", icon: "pickleball", personIds: [sam.id, priya.id] });
    createActivity(db, { name: "Bowling", icon: "trophy" });
    expect(listActivities(db).map((a) => a.name)).toEqual(["Pickleball", "Board games", "Bowling", "Climbing"]);
  });

  it("lists people closest first", () => {
    const db = openDb(":memory:");
    const far = createPerson(db, { name: "Aaron", closeness: 4 });
    const close = createPerson(db, { name: "Zoe", closeness: 1 });
    createActivity(db, { name: "Hiking", icon: "mountain-snow", personIds: [far.id, close.id] });
    expect(listActivities(db)[0].people.map((p) => p.name)).toEqual(["Zoe", "Aaron"]);
  });
});

describe("deleting", () => {
  it("an activity keeps its people", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam" });
    const a = createActivity(db, { name: "Hiking", icon: "mountain-snow", personIds: [sam.id] });
    deleteActivity(db, a.id);
    expect(getActivity(db, a.id)).toBeUndefined();
    expect(getPerson(db, sam.id)).toBeDefined();
  });

  it("a person takes them off their activities", () => {
    const db = openDb(":memory:");
    const sam = createPerson(db, { name: "Sam" });
    const a = createActivity(db, { name: "Hiking", icon: "mountain-snow", personIds: [sam.id] });
    deletePerson(db, sam.id);
    expect(getActivity(db, a.id)?.people).toEqual([]);
  });
});
