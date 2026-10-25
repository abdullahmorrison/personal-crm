import { notFound } from "next/navigation";
import { Suspense } from "react";
import { editMoment, removeMoment } from "@/app/(app)/journal/actions";
import { peopleForPicker } from "@/app/(app)/journal/data";
import { ConfirmDelete } from "@/components/confirm-delete";
import { MomentForm } from "@/components/moment-form";
import { getDb } from "@/lib/db";
import { getMoment } from "@/lib/moments";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const people = await peopleForPicker(); // also waits for the request, before reading the moment
  const id = Number((await params).id);
  const moment = Number.isInteger(id) ? getMoment(getDb(), id) : undefined;
  if (!moment) notFound();
  return (
    <>
      <MomentForm
        action={editMoment.bind(null, moment.id)}
        people={people}
        closeHref="/journal"
        defaults={{ body: moment.body, date: moment.date, personIds: moment.people.map((p) => p.id) }}
      />
      <div className="mt-14 border-t border-line pt-6">
        <ConfirmDelete label="Delete this moment" warning="Delete this moment? This can't be undone." action={removeMoment.bind(null, moment.id)} />
      </div>
    </>
  );
}

export default function EditMomentPage(props: PageProps<"/journal/[id]/edit">) {
  return (
    <div className="mx-auto max-w-xl px-7 pt-12 pb-10 desk:pt-8">
      <Suspense>
        <Edit params={props.params} />
      </Suspense>
    </div>
  );
}
