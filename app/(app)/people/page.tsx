import { connection } from "next/server";
import { Suspense } from "react";
import { PeopleTiers } from "@/components/people-tiers";
import { getDb } from "@/lib/db";
import { listPeople } from "@/lib/people";

async function People() {
  await connection(); // read the database per request, not at build time
  return <PeopleTiers people={listPeople(getDb())} />;
}

export default function PeoplePage() {
  return (
    <Suspense>
      <People />
    </Suspense>
  );
}
