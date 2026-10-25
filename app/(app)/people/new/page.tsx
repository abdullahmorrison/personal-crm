import { addPerson } from "@/app/(app)/people/actions";
import { BackLink } from "@/components/back-link";
import { PersonForm } from "@/components/person-form";

export default function NewPersonPage() {
  return (
    <div className="mx-auto max-w-xl px-7 pt-12 desk:pt-10">
      <BackLink href="/people" label="Back to people" />
      <h1 className="mt-6 mb-10 text-2xl font-medium">Add a person</h1>
      <PersonForm action={addPerson} submitLabel="Add person" />
    </div>
  );
}
