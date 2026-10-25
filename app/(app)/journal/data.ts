import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { listPeople } from "@/lib/people";

/** Everyone, for the "with" picker. Read per request, not at build time. */
export async function peopleForPicker() {
  await connection();
  return listPeople(getDb()).sort((a, b) => a.closeness - b.closeness || a.name.localeCompare(b.name));
}
