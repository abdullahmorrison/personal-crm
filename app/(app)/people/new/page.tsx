import { addPerson } from "@/app/(app)/people/actions";
import { BackLink } from "@/components/back-link";
import { Panel } from "@/components/panel";
import { PersonForm } from "@/components/person-form";

export default function NewPersonPage() {
  return (
    <Panel close={{ href: "/people", label: "Close" }}>
      <BackLink href="/people" label="Back to people" />
      <h1 className="mt-6 mb-10 pr-10 text-2xl font-medium desk:mt-0 desk:mb-9 desk:text-[22px]">Add a person</h1>
      <PersonForm action={addPerson} submitLabel="Add person" />
    </Panel>
  );
}
