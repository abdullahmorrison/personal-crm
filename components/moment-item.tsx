import Link from "next/link";
import { Faces } from "@/components/faces";
import { MomentBody } from "@/components/moment-body";
import { shortDate } from "@/lib/dates";
import type { Moment } from "@/lib/moments";
import { firstName } from "@/lib/names";

const ITEM = "-mx-3 flex flex-col gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface/70 focus-visible:bg-surface/70 focus-visible:outline-none";

/**
 * One moment in a list: who and when, then what happened. Tapping opens it for editing.
 * On a person's own pages (`about` is their id), it leaves them out and names only who else was there,
 * and `href` opens it in their panel instead of the journal.
 */
export function MomentItem({ moment, about, href = `/journal/${moment.id}/edit` }: { moment: Moment; about?: number; href?: string }) {
  if (about !== undefined) {
    const others = moment.people.filter((p) => p.id !== about);
    return (
      <Link href={href} className={ITEM}>
        <span className="flex gap-2 text-xs text-muted">
          <span>{shortDate(moment.date)}</span>
          {others.length > 0 && <span>with {others.map((p) => firstName(p.name)).join(", ")}</span>}
        </span>
        <span className="font-serif text-[17px] leading-[29px] whitespace-pre-line"><MomentBody body={moment.body} people={moment.people} /></span>
      </Link>
    );
  }
  return (
    <Link href={href} className={ITEM}>
      <span className="flex items-center gap-2 text-xs">
        <Faces people={moment.people} />
        <span className="text-muted">{shortDate(moment.date)}</span>
        <span className={moment.people.length ? "font-medium" : "text-muted"}>
          {moment.people.length ? moment.people.map((p) => firstName(p.name)).join(", ") : "Just me"}
        </span>
      </span>
      <span className="font-serif text-lg leading-[29px] whitespace-pre-line"><MomentBody body={moment.body} people={moment.people} /></span>
    </Link>
  );
}
