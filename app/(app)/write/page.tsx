import { Suspense } from "react";
import { addMoment } from "@/app/(app)/journal/actions";
import { peopleForPicker } from "@/app/(app)/journal/data";
import { MomentForm } from "@/components/moment-form";

async function Write() {
  return <MomentForm action={addMoment} people={await peopleForPicker()} closeHref="/journal" />;
}

export default function WritePage() {
  return (
    <div className="mx-auto max-w-xl px-7 pt-12 pb-10 desk:pt-8">
      <Suspense>
        <Write />
      </Suspense>
    </div>
  );
}
