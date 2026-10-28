import { asc, count, eq, max } from "drizzle-orm";
import { entries, entryPeople, people } from "@/db/schema";
import type { Db } from "@/lib/db";
import { nextColor } from "@/lib/person-colors";
import { NEW_PERSON_CLOSENESS, TIERS } from "@/lib/tiers";

type PersonInput = { name: string; closeness?: number; notes?: string };

/** Trims and checks what the user typed; throws a message fit to show them. */
function clean(input: PersonInput) {
  const name = input.name.trim();
  if (!name) throw new Error("A person needs a name.");
  const closeness = input.closeness ?? NEW_PERSON_CLOSENESS;
  if (!TIERS.some((t) => t.value === closeness)) throw new Error(`Unknown closeness: ${closeness}`);
  return { name, closeness, notes: (input.notes ?? "").trim() };
}

export function createPerson(db: Db, input: PersonInput) {
  const values = clean(input);
  const usage = new Map(
    db
      .select({ color: people.color, n: count() })
      .from(people)
      .groupBy(people.color)
      .all()
      .map((r) => [r.color, r.n]),
  );
  return db
    .insert(people)
    .values({ ...values, color: nextColor(usage) })
    .returning()
    .get();
}

/** Changes name, closeness, and notes. Color stays, so the person stays recognizable. */
export function updatePerson(db: Db, id: number, input: PersonInput) {
  const updated = db.update(people).set(clean(input)).where(eq(people.id, id)).returning().get();
  if (!updated) throw new Error("This person no longer exists.");
  return updated;
}

/** Moves a person to another closeness tier, keeping everything else. */
export function moveToTier(db: Db, id: number, closeness: number) {
  if (!TIERS.some((t) => t.value === closeness)) throw new Error(`Unknown closeness: ${closeness}`);
  const moved = db.update(people).set({ closeness }).where(eq(people.id, id)).returning().get();
  if (!moved) throw new Error("This person no longer exists.");
  return moved;
}

/** Removes the person. Moments stay; they just no longer list this person. */
export function deletePerson(db: Db, id: number) {
  db.delete(people).where(eq(people.id, id)).run();
}

export function getPerson(db: Db, id: number) {
  return db.select().from(people).where(eq(people.id, id)).get();
}

export function listPeople(db: Db) {
  return db
    .select({ id: people.id, name: people.name, closeness: people.closeness, color: people.color })
    .from(people)
    .all();
}

/** Everyone in a tier with the date of their latest moment, least recent first and never-logged at the top. */
export function listTier(db: Db, closeness: number) {
  const lastMoment = max(entries.date);
  return db
    .select({ id: people.id, name: people.name, color: people.color, lastMoment })
    .from(people)
    .leftJoin(entryPeople, eq(entryPeople.personId, people.id))
    .leftJoin(entries, eq(entries.id, entryPeople.entryId))
    .where(eq(people.closeness, closeness))
    .groupBy(people.id)
    .orderBy(asc(lastMoment), asc(people.name))
    .all();
}
