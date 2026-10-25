import Link from "next/link";
import { Suspense } from "react";
import { BackLink } from "@/components/back-link";
import { initials } from "@/lib/names";
import { personColor } from "@/lib/person-colors";
import { tierLabel } from "@/lib/tiers";
import { personFromParams } from "./data";

const label = "text-[11px] font-medium tracking-[0.12em] text-muted uppercase";

async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const person = await personFromParams(params);
  const color = personColor(person.color);
  return (
    <div className="mx-auto max-w-xl px-7 pt-12 desk:pt-10">
      <div className="flex items-center justify-between">
        <BackLink href="/people" label="Back to people" />
        <Link href={`/people/${person.id}/edit`} className="rounded-full px-3 py-1 text-sm text-muted transition-colors hover:bg-surface hover:text-ink">
          Edit
        </Link>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
        <span
          className={`flex size-22 items-center justify-center rounded-full font-serif text-[32px] shadow-[0_2px_6px_rgba(90,74,58,0.10)] ring-2 ring-white/90 ${color.fill} ${color.ink}`}
        >
          {initials(person.name)}
        </span>
        <h1 className="mt-2 text-[28px] font-medium">{person.name}</h1>
        <p className="text-[13px] text-muted">{tierLabel(person.closeness)}</p>
      </div>

      <section className="mt-10 flex flex-col gap-2.5">
        <h2 className={label}>Notes</h2>
        {person.notes ? (
          <p className="font-serif text-[17px] leading-[27px] whitespace-pre-line">{person.notes}</p>
        ) : (
          <Link href={`/people/${person.id}/edit`} className="font-serif text-[17px] text-muted/70 hover:text-muted">
            Add notes about {person.name.split(" ")[0]}…
          </Link>
        )}
      </section>

      <section className="mt-10 flex flex-col gap-2.5">
        <h2 className={label}>Journal</h2>
        <p className="font-serif text-[17px] text-muted/70">No moments yet.</p>
      </section>
    </div>
  );
}

export default function PersonPage(props: PageProps<"/people/[id]">) {
  return (
    <Suspense>
      <Profile params={props.params} />
    </Suspense>
  );
}
