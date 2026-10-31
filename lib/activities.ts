import { asc, eq, inArray } from "drizzle-orm";
import { activities, activityPeople, people } from "@/db/schema";
import { isActivityIcon } from "@/lib/activity-icons";
import type { Db } from "@/lib/db";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

type ActivityInput = { name: string; icon: string; notes?: string; personIds?: number[] };

/** Trims and checks what the user typed; throws a message fit to show them. */
function clean(input: ActivityInput) {
  const name = input.name.trim();
  if (!name) throw new Error("An activity needs a name.");
  if (!isActivityIcon(input.icon)) throw new Error(`Unknown icon: ${input.icon}`);
  return { name, icon: input.icon, notes: (input.notes ?? "").trim() };
}

function setPeople(db: Tx, activityId: number, personIds: number[]) {
  db.delete(activityPeople).where(eq(activityPeople.activityId, activityId)).run();
  const ids = [...new Set(personIds)];
  if (ids.length) db.insert(activityPeople).values(ids.map((personId) => ({ activityId, personId }))).run();
}

export function createActivity(db: Db, input: ActivityInput) {
  const values = clean(input);
  return db.transaction((tx) => {
    const created = tx.insert(activities).values(values).returning().get();
    setPeople(tx, created.id, input.personIds ?? []);
    return created;
  });
}

/** Changes name, icon, notes, and who it's with. */
export function updateActivity(db: Db, id: number, input: ActivityInput) {
  const values = clean(input);
  return db.transaction((tx) => {
    const updated = tx.update(activities).set(values).where(eq(activities.id, id)).returning().get();
    if (!updated) throw new Error("This activity no longer exists.");
    setPeople(tx, id, input.personIds ?? []);
    return updated;
  });
}

/** Removes the activity. The people stay. */
export function deleteActivity(db: Db, id: number) {
  db.delete(activities).where(eq(activities.id, id)).run();
}

/** Who each activity is with, closest first. */
function peopleFor(db: Db, activityIds: number[]) {
  const byActivity = new Map<number, { id: number; name: string; color: number; closeness: number }[]>();
  if (!activityIds.length) return byActivity;
  const rows = db
    .select({ activityId: activityPeople.activityId, id: people.id, name: people.name, color: people.color, closeness: people.closeness })
    .from(activityPeople)
    .innerJoin(people, eq(people.id, activityPeople.personId))
    .where(inArray(activityPeople.activityId, activityIds))
    .orderBy(asc(people.closeness), asc(people.name))
    .all();
  for (const { activityId, ...person } of rows) byActivity.set(activityId, [...(byActivity.get(activityId) ?? []), person]);
  return byActivity;
}

export function getActivity(db: Db, id: number) {
  const activity = db.select().from(activities).where(eq(activities.id, id)).get();
  if (!activity) return undefined;
  return { ...activity, people: peopleFor(db, [id]).get(id) ?? [] };
}

/** Every activity with its people, the ones done with the most people first. */
export function listActivities(db: Db) {
  const rows = db.select({ id: activities.id, name: activities.name, icon: activities.icon }).from(activities).all();
  const withPeople = peopleFor(db, rows.map((r) => r.id));
  return rows
    .map((r) => ({ ...r, people: withPeople.get(r.id) ?? [] }))
    .sort((a, b) => b.people.length - a.people.length || a.name.localeCompare(b.name));
}
