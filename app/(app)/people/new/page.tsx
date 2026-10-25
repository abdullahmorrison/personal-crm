import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AddPersonForm } from "@/components/add-person-form";

export default function NewPersonPage() {
  return (
    <div className="mx-auto max-w-xl px-7 pt-12 desk:pt-10">
      <Link href="/people" aria-label="Back to people" className="-ml-1 inline-flex rounded-full p-1 text-ink transition-colors hover:bg-surface">
        <ChevronLeft size={24} />
      </Link>
      <h1 className="mt-6 mb-10 text-2xl font-medium">Add a person</h1>
      <AddPersonForm />
    </div>
  );
}
