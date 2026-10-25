import { desc, eq, inArray } from "drizzle-orm";
import { entries, entryPeople, people } from "@/db/schema";
import type { Db } from "@/lib/db";
import { isDate, monthLabel } from "@/lib/dates";
import { mentionedIds } from "@/lib/mentions";

// viaMention: those in personIds who are there only because the text mentions them.
export type MomentInput = { body: string; date: string; personIds: number[]; viaMention?: number[] };
export type Moment = Awaited<ReturnType<typeof listMoments>>[number];

/** Trims and checks what the user wrote; throws a message fit to show them. */
function clean(db: Db, input: MomentInput) {
  const body = input.body.trim();
  if (!body) throw new Error("Write something about the moment.");
  if (!isDate(input.date)) throw new Error("Pick a date for the moment.");
  const personIds = [...new Set(input.personIds)];
  if (personIds.length) {
    const found = db.select({ id: people.id }).from(people).where(inArray(people.id, personIds)).all();
    if (found.length !== personIds.length) throw new Error("Someone you tagged no longer exists.");
  }
  const viaMention = (input.viaMention ?? []).filter((id) => personIds.includes(id));
  return { body, date: input.date, personIds, viaMention };
}

function link(db: Pick<Db, "insert">, entryId: number, personIds: number[], viaMention: number[]) {
  if (personIds.length)
    db.insert(entryPeople)
      .values(personIds.map((personId) => ({ entryId, personId, viaMention: viaMention.includes(personId) })))
      .run();
}

export function createMoment(db: Db, input: MomentInput) {
  const { personIds, viaMention, ...values } = clean(db, input);
  return db.transaction((tx) => {
    const entry = tx.insert(entries).values(values).returning().get();
    link(tx, entry.id, personIds, viaMention);
    return entry;
  });
}

export function updateMoment(db: Db, id: number, input: MomentInput) {
  const { personIds, viaMention, ...values } = clean(db, input);
  return db.transaction((tx) => {
    const entry = tx.update(entries).set(values).where(eq(entries.id, id)).returning().get();
    if (!entry) throw new Error("This moment no longer exists.");
    tx.delete(entryPeople).where(eq(entryPeople.entryId, id)).run();
    link(tx, id, personIds, viaMention);
    return entry;
  });
}

export function deleteMoment(db: Db, id: number) {
  db.delete(entries).where(eq(entries.id, id)).run(); // links go with it (cascade)
}

/**
 * Every moment, newest first, with the people in it and everyone its text mentions (who may not be
 * in it any more). Narrow it to one moment, or to one person's moments.
 */
export function listMoments(db: Db, where?: { id?: number; personId?: number }) {
  const withPerson = (personId: number) =>
    inArray(entries.id, db.select({ id: entryPeople.entryId }).from(entryPeople).where(eq(entryPeople.personId, personId)));
  const rows = db
    .select()
    .from(entries)
    .where(where?.id ? eq(entries.id, where.id) : where?.personId ? withPerson(where.personId) : undefined)
    .orderBy(desc(entries.date), desc(entries.id))
    .all();
  const links = rows.length
    ? db
        .select({ entryId: entryPeople.entryId, id: people.id, name: people.name, color: people.color, viaMention: entryPeople.viaMention })
        .from(entryPeople)
        .innerJoin(people, eq(people.id, entryPeople.personId))
        .where(
          inArray(
            entryPeople.entryId,
            rows.map((r) => r.id),
          ),
        )
        .orderBy(people.name)
        .all()
    : [];
  const mentionIds = [...new Set(rows.flatMap((r) => mentionedIds(r.body)))];
  const mentionable = mentionIds.length
    ? db.select({ id: people.id, name: people.name, color: people.color }).from(people).where(inArray(people.id, mentionIds)).all()
    : [];
  return rows.map((r) => {
    const ids = mentionedIds(r.body);
    return {
      id: r.id,
      body: r.body,
      date: r.date,
      people: links.filter((l) => l.entryId === r.id).map(({ id, name, color, viaMention }) => ({ id, name, color, viaMention })),
      mentioned: mentionable.filter((p) => ids.includes(p.id)),
    };
  });
}

export function getMoment(db: Db, id: number) {
  return listMoments(db, { id })[0];
}

/** Groups a newest-first list into months, keeping order: [{ label: "October 2026", moments }]. */
export function groupByMonth<T extends { date: string }>(moments: T[]) {
  const groups: { key: string; label: string; moments: T[] }[] = [];
  for (const m of moments) {
    const key = m.date.slice(0, 7);
    if (groups.at(-1)?.key !== key) groups.push({ key, label: monthLabel(m.date), moments: [] });
    groups.at(-1)!.moments.push(m);
  }
  return groups;
}
