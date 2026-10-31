import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ActivityBadge } from "@/components/activity-icon";
import { BackLink } from "@/components/back-link";
import { Panel } from "@/components/panel";
import { SectionLabel } from "@/components/section-label";
import { initials } from "@/lib/names";
import { personColor } from "@/lib/person-colors";
import { tierLabel } from "@/lib/tiers";
import { activityFromParams } from "./data";

async function Activity({ params }: { params: Promise<{ id: string }> }) {
  const activity = await activityFromParams(params);
  const edit = `/activities/${activity.id}/edit`;
  return (
    <Panel close={{ href: "/activities", label: "Close" }}>
      <div className="flex items-center justify-between desk:-ml-3 desk:pr-10">
        <BackLink href="/activities" label="Back to activities" />
        <Link href={edit} className="rounded-full px-3 py-1 text-sm text-muted transition-colors hover:bg-surface hover:text-ink">
          Edit
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <ActivityBadge icon={activity.icon} size="lg" />
        <div className="min-w-0">
          <h1 className="text-[28px] font-medium desk:text-2xl">{activity.name}</h1>
          <p className="text-[13px] text-muted">
            {activity.people.length} {activity.people.length === 1 ? "person" : "people"}
          </p>
        </div>
      </div>

      <section className="mt-10 flex flex-col gap-2.5">
        <SectionLabel>With</SectionLabel>
        <ul className="flex flex-col">
          {activity.people.map((p) => {
            const c = personColor(p.color);
            return (
              <li key={p.id}>
                <Link href={`/people/${p.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface/60">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full font-serif text-[15px] ring-2 ring-halo ${c.fill} ${c.ink}`}>
                    {initials(p.name)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px]">{p.name}</span>
                    <span className="text-xs text-muted">{tierLabel(p.closeness)}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href={edit} className="flex items-center gap-0.5 self-start text-[13px] text-accent hover:underline">
          <Plus size={13} />
          someone
        </Link>
      </section>

      <section className="mt-10 flex flex-col gap-2.5">
        <SectionLabel>Notes</SectionLabel>
        {activity.notes ? (
          <p className="font-serif text-[17px] leading-[27px] whitespace-pre-line">{activity.notes}</p>
        ) : (
          <Link href={edit} className="font-serif text-[17px] text-muted/70 hover:text-muted">
            Add notes about {activity.name}…
          </Link>
        )}
      </section>
    </Panel>
  );
}

export default function ActivityPage(props: PageProps<"/activities/[id]">) {
  return (
    <Suspense>
      <Activity params={props.params} />
    </Suspense>
  );
}
