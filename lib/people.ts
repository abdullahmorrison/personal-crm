import { asc, count } from "drizzle-orm";
import { people } from "@/db/schema";
import type { Db } from "@/lib/db";
import { nextColor } from "@/lib/person-colors";
import { NEW_PERSON_CLOSENESS, TIERS } from "@/lib/tiers";

export function createPerson(db: Db, input: { name: string; closeness?: number; notes?: string }) {
  const name = input.name.trim();
  if (!name) throw new Error("A person needs a name.");
  const closeness = input.closeness ?? NEW_PERSON_CLOSENESS;
  if (!TIERS.some((t) => t.value === closeness)) throw new Error(`Unknown closeness: ${closeness}`);

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
    .values({ name, closeness, notes: input.notes ?? "", color: nextColor(usage) })
    .returning()
    .get();
}

export function listPeople(db: Db) {
  return db
    .select({ id: people.id, name: people.name, closeness: people.closeness, color: people.color })
    .from(people)
    .orderBy(asc(people.name))
    .all();
}
