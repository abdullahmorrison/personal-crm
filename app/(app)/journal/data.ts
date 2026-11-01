import { connection } from "next/server";
import { listActivities } from "@/lib/activities";
import { getDb } from "@/lib/db";
import { listPeople } from "@/lib/people";

/** Everyone, for the "with" picker. Read per request, not at build time. */
export async function peopleForPicker() {
  await connection();
  return listPeople(getDb()).sort((a, b) => a.closeness - b.closeness || a.name.localeCompare(b.name));
}

/** Every activity, for the "doing" picker and the / menu, the ones done with the most people first. */
export async function activitiesForPicker() {
  await connection();
  return listActivities(getDb()).map(({ id, name, icon }) => ({ id, name, icon }));
}
