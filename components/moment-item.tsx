import Link from "next/link";
import { Faces } from "@/components/faces";
import { shortDate } from "@/lib/dates";
import type { Moment } from "@/lib/moments";
import { firstName } from "@/lib/names";

/** One moment in a list: who and when, then what happened. Tapping opens it for editing. */
export function MomentItem({ moment }: { moment: Moment }) {
  return (
    <Link
      href={`/journal/${moment.id}/edit`}
      className="-mx-3 flex flex-col gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface/70 focus-visible:bg-surface/70 focus-visible:outline-none"
    >
      <span className="flex items-center gap-2 text-xs">
        <Faces people={moment.people} />
        <span className="text-muted">{shortDate(moment.date)}</span>
        <span className={moment.people.length ? "font-medium" : "text-muted"}>
          {moment.people.length ? moment.people.map((p) => firstName(p.name)).join(", ") : "Just me"}
        </span>
      </span>
      <span className="font-serif text-lg leading-[29px] whitespace-pre-line">{moment.body}</span>
    </Link>
  );
}
