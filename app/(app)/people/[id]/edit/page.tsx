import { Suspense } from "react";
import { editPerson, removePerson } from "@/app/(app)/people/actions";
import { BackLink } from "@/components/back-link";
import { DeletePerson } from "@/components/delete-person";
import { PersonForm } from "@/components/person-form";
import { personFromParams } from "../data";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const person = await personFromParams(params);
  return (
    <div className="mx-auto max-w-xl px-7 pt-12 pb-10 desk:pt-10">
      <BackLink href={`/people/${person.id}`} label={`Back to ${person.name}`} />
      <h1 className="mt-6 mb-10 text-2xl font-medium">Edit {person.name}</h1>
      <PersonForm action={editPerson.bind(null, person.id)} submitLabel="Save" defaults={person} />
      <div className="mt-14 border-t border-line pt-6">
        <DeletePerson name={person.name} action={removePerson.bind(null, person.id)} />
      </div>
    </div>
  );
}

export default function EditPersonPage(props: PageProps<"/people/[id]/edit">) {
  return (
    <Suspense>
      <Edit params={props.params} />
    </Suspense>
  );
}
