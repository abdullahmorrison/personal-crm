import { Suspense } from "react";
import { editPerson, removePerson } from "@/app/(app)/people/actions";
import { BackLink } from "@/components/back-link";
import { DeletePerson } from "@/components/delete-person";
import { Panel } from "@/components/panel";
import { PersonForm } from "@/components/person-form";
import { personFromParams } from "../data";

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const person = await personFromParams(params);
  return (
    <Panel close={{ href: `/people/${person.id}`, label: `Back to ${person.name}` }}>
      <BackLink href={`/people/${person.id}`} label={`Back to ${person.name}`} />
      <h1 className="mt-6 mb-10 pr-10 text-2xl font-medium desk:mt-0 desk:mb-9 desk:text-[22px]">Edit {person.name}</h1>
      <PersonForm action={editPerson.bind(null, person.id)} submitLabel="Save" defaults={person} />
      <div className="mt-14 border-t border-line pt-6">
        <DeletePerson name={person.name} action={removePerson.bind(null, person.id)} />
      </div>
    </Panel>
  );
}

export default function EditPersonPage(props: PageProps<"/people/[id]/edit">) {
  return (
    <Suspense>
      <Edit params={props.params} />
    </Suspense>
  );
}
