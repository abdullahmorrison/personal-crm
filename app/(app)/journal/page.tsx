import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { MomentItem } from "@/components/moment-item";
import { SectionLabel } from "@/components/section-label";
import { getDb } from "@/lib/db";
import { groupByMonth, listMoments } from "@/lib/moments";

async function Feed() {
  await connection(); // read the database per request, not at build time
  const months = groupByMonth(listMoments(getDb()));

  if (months.length === 0) {
    return (
      <div className="mt-16 text-center">
        <p className="font-serif text-[22px]">No moments yet.</p>
        <p className="mt-1.5 text-[13px] text-muted">Write down the times worth remembering, big or small.</p>
        <Link href="/write" className="mt-2 inline-block text-[13px] font-medium text-accent underline-offset-4 hover:underline">
          Log your first moment
        </Link>
      </div>
    );
  }

  const latest = months[0];
  const peopleCount = new Set(latest.moments.flatMap((m) => m.people.map((p) => p.id))).size;
  return (
    <>
      <p className="text-[13px] text-muted">
        {latest.label.split(" ")[0]} · {latest.moments.length} {latest.moments.length === 1 ? "moment" : "moments"}
        {peopleCount > 0 && ` with ${peopleCount} ${peopleCount === 1 ? "person" : "people"}`}
      </p>
      {months.map((month) => (
        <section key={month.key} className="mt-9 flex flex-col gap-3">
          <SectionLabel>{month.label}</SectionLabel>
          <div className="flex flex-col gap-3">
            {month.moments.map((m) => (
              <MomentItem key={m.id} moment={m} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-xl px-7 pt-14 pb-10 desk:pt-8">
      <h1 className="text-2xl font-medium desk:text-[28px]">Journal</h1>
      <Suspense>
        <Feed />
      </Suspense>
    </div>
  );
}
