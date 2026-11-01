"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useActionState, useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { MomentFormState } from "@/app/(app)/journal/actions";
import { DatePicker } from "@/components/date-picker";
import { MomentEditor } from "@/components/moment-editor";
import { WithActivities } from "@/components/with-activities";
import { WithPeople } from "@/components/with-people";
import { localToday, longDate } from "@/lib/dates";
import { linkedAfterHandEdit, mentionedActivityIds, mentionedIds, syncWith } from "@/lib/mentions";

type Person = { id: number; name: string; color: number };
type Activity = { id: number; name: string; icon: string };

type Props = {
  action: (prev: MomentFormState, form: FormData) => Promise<MomentFormState>;
  people: Person[];
  activities: Activity[];
  defaults?: { body: string; date: string; personIds: number[]; viaMention: number[]; activityIds: number[]; activityViaMention: number[] };
  closeHref: string;
};

type Picked = { chosen: number[]; linked: number[] };

// Shared by "with" and "doing": a mention adds to both lists, a hand edit unties it, a tap locks it in.
const mentioned = (s: Picked, id: number): Picked => (s.chosen.includes(id) ? s : { chosen: [...s.chosen, id], linked: [...s.linked, id] });
const handEdited = (s: Picked, ids: number[]): Picked => ({ chosen: ids, linked: linkedAfterHandEdit(s.linked, s.chosen, ids) });
const locked = (s: Picked, id: number): Picked => ({ ...s, linked: s.linked.filter((x) => x !== id) });

const noSubscribe = () => () => {};

export function MomentForm({ action, people, activities, defaults, closeHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Today comes from the viewer's clock, so it's read in the browser, never at build time.
  const today = useSyncExternalStore(noSubscribe, localToday, () => "");
  const [picked, setPicked] = useState<string | null>(defaults?.date ?? null);
  const date = picked ?? today;
  // Who was there, and which of them a mention put there (so removing the mention removes them).
  const [withState, setWith] = useState({ chosen: defaults?.personIds ?? [], linked: defaults?.viaMention ?? [] });
  const { chosen } = withState;
  // What it was spent doing, tracked the same way.
  const [doing, setDoing] = useState({ chosen: defaults?.activityIds ?? [], linked: defaults?.activityViaMention ?? [] });

  return (
    <form action={formAction} className="flex flex-col">
      <div className="flex items-center justify-between">
        <Link href={closeHref} aria-label="Close" className="-ml-1.5 rounded-full p-1.5 text-ink transition-colors hover:bg-surface">
          <X size="1.375rem" />
        </Link>
        <button disabled={pending || !date} className="rounded-full px-3 py-1.5 text-[0.9375rem] font-medium text-accent transition-colors hover:bg-surface disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
      </div>

      <DateHeading date={date} today={today} onChange={setPicked} />
      <input type="hidden" name="date" value={date} />

      <div className="mt-2">
        <WithPeople
          label="with"
          empty="just me"
          people={people}
          chosen={chosen}
          linked={withState.linked}
          onChange={(ids) => setWith((w) => handEdited(w, ids))}
          onLock={(id) => setWith((w) => locked(w, id))}
        />
      </div>
      <div className="mt-2">
        <WithActivities
          activities={activities}
          chosen={doing.chosen}
          linked={doing.linked}
          onChange={(ids) => setDoing((d) => handEdited(d, ids))}
          onLock={(id) => setDoing((d) => locked(d, id))}
        />
      </div>
      {chosen.map((id) => (
        <input key={id} type="hidden" name="personIds" value={id} />
      ))}
      {withState.linked.map((id) => (
        <input key={id} type="hidden" name="viaMention" value={id} />
      ))}
      {doing.chosen.map((id) => (
        <input key={id} type="hidden" name="activityIds" value={id} />
      ))}
      {doing.linked.map((id) => (
        <input key={id} type="hidden" name="activityViaMention" value={id} />
      ))}

      <MomentEditor
        people={people}
        activities={activities}
        defaultValue={defaults?.body}
        autoFocus={!defaults}
        onMention={(p) => setWith((w) => mentioned(w, p.id))}
        onActivity={(a) => setDoing((d) => mentioned(d, a.id))}
        onChange={(body) => {
          setWith((w) => ({ ...w, chosen: syncWith(w.chosen, w.linked, mentionedIds(body)) }));
          setDoing((d) => ({ ...d, chosen: syncWith(d.chosen, d.linked, mentionedActivityIds(body)) }));
        }}
      />

      {state.error && (
        <p className="mt-4 text-sm text-accent" aria-live="polite">
          {state.error}
        </p>
      )}
    </form>
  );
}

/** The date as an italic heading; tapping it opens a calendar under it. */
function DateHeading({ date, today, onChange }: { date: string; today: string; onChange: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  // Closing removes the focused day, so hand focus back to the heading (unless a tap moved it elsewhere).
  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  }, []);
  return (
    <div className="relative mt-6 self-start">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        disabled={!date}
        className={`rounded-lg font-serif text-[1.625rem] italic underline-offset-4 decoration-line hover:underline ${open ? "underline" : ""}`}
      >
        {date ? longDate(date) : " "}
      </button>
      {open && (
        <DatePicker
          date={date}
          today={today}
          onClose={close}
          onPick={(d) => {
            onChange(d);
            close(true);
          }}
        />
      )}
    </div>
  );
}
