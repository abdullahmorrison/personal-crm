import Link from "next/link";
import { Suspense } from "react";
import { BackLink } from "@/components/back-link";
import { Panel } from "@/components/panel";
import { SectionLabel } from "@/components/section-label";
import { firstName, initials } from "@/lib/names";
import { personColor } from "@/lib/person-colors";
import { tierLabel } from "@/lib/tiers";
import { personFromParams } from "./data";

async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const person = await personFromParams(params);
  const color = personColor(person.color);
  return (
    <Panel close={{ href: "/people", label: "Close" }}>
      <div className="flex items-center justify-between desk:-ml-3">
        <BackLink href="/people" label="Back to people" />
        <Link href={`/people/${person.id}/edit`} className="rounded-full px-3 py-1 text-sm text-muted transition-colors hover:bg-surface hover:text-ink">
          Edit
        </Link>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1.5 text-center desk:flex-row desk:gap-4 desk:text-left">
        <span
          className={`flex size-22 shrink-0 items-center justify-center rounded-full font-serif text-[32px] shadow-[0_2px_6px_rgba(90,74,58,0.10)] ring-2 ring-white/90 ${color.fill} ${color.ink}`}
        >
          {initials(person.name)}
        </span>
        <div>
          <h1 className="mt-2 text-[28px] font-medium desk:mt-0 desk:text-2xl">{person.name}</h1>
          <p className="text-[13px] text-muted">{tierLabel(person.closeness)}</p>
        </div>
      </div>

      <section className="mt-10 flex flex-col gap-2.5">
        <SectionLabel>Notes</SectionLabel>
        {person.notes ? (
          <p className="font-serif text-[17px] leading-[27px] whitespace-pre-line">{person.notes}</p>
        ) : (
          <Link href={`/people/${person.id}/edit`} className="font-serif text-[17px] text-muted/70 hover:text-muted">
            Add notes about {firstName(person.name)}…
          </Link>
        )}
      </section>

      <section className="mt-10 flex flex-col gap-2.5">
        <SectionLabel>Journal</SectionLabel>
        <p className="font-serif text-[17px] text-muted/70">No moments yet.</p>
      </section>
    </Panel>
  );
}

export default function PersonPage(props: PageProps<"/people/[id]">) {
  return (
    <Suspense>
      <Profile params={props.params} />
    </Suspense>
  );
}
