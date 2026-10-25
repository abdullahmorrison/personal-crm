import { count } from "drizzle-orm";
import { people } from "@/db/schema";
import type { Db } from "@/lib/db";
import { nextColor } from "@/lib/person-colors";
import { NEW_PERSON_CLOSENESS } from "@/lib/tiers";

export function createPerson(db: Db, input: { name: string; closeness?: number; notes?: string }) {
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
    .values({
      name: input.name.trim(),
      closeness: input.closeness ?? NEW_PERSON_CLOSENESS,
      notes: input.notes ?? "",
      color: nextColor(usage),
    })
    .returning()
    .get();
}
