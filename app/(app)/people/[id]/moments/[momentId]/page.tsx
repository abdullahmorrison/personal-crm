import { notFound } from "next/navigation";
import { Suspense } from "react";
import { editMoment, removeMoment } from "@/app/(app)/journal/actions";
import { activitiesForPicker, peopleForPicker } from "@/app/(app)/journal/data";
import { ConfirmDelete } from "@/components/confirm-delete";
import { MomentForm } from "@/components/moment-form";
import { Panel } from "@/components/panel";
import { getDb } from "@/lib/db";
import { formDefaults, getMoment } from "@/lib/moments";
import { personFromParams } from "../../data";

// A moment opened from a person's profile or timeline, edited in their panel. Closing or saving goes back there.
async function Edit({ params, searchParams }: PageProps<"/people/[id]/moments/[momentId]">) {
  const person = await personFromParams(params);
  const people = await peopleForPicker();
  const id = Number((await params).momentId);
  const moment = Number.isInteger(id) ? getMoment(getDb(), id) : undefined;
  if (!moment) notFound();
  const back = (await searchParams).from === "all" ? `/people/${person.id}/moments` : `/people/${person.id}`;
  return (
    <Panel>
      <MomentForm
        action={editMoment.bind(null, moment.id, back)}
        people={people}
        activities={await activitiesForPicker()}
        closeHref={back}
        defaults={formDefaults(moment)}
      />
      <div className="mt-14 border-t border-line pt-6">
        <ConfirmDelete label="Delete this moment" warning="Delete this moment? This can't be undone." action={removeMoment.bind(null, moment.id, back)} />
      </div>
    </Panel>
  );
}

export default function PersonMomentPage(props: PageProps<"/people/[id]/moments/[momentId]">) {
  return (
    <Suspense>
      <Edit {...props} />
    </Suspense>
  );
}
