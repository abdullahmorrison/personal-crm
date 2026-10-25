import { connection } from "next/server";
import { PeopleTiers } from "@/components/people-tiers";
import { getDb } from "@/lib/db";
import { listPeople } from "@/lib/people";

/** The arcs, filled from the database. */
export async function Tiers() {
  await connection(); // read the database per request, not at build time
  return <PeopleTiers people={listPeople(getDb())} />;
}
