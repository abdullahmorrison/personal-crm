"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useActionState, useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { MomentFormState } from "@/app/(app)/journal/actions";
import { DatePicker } from "@/components/date-picker";
import { MomentEditor } from "@/components/moment-editor";
import { WithPeople } from "@/components/with-people";
import { localToday, longDate } from "@/lib/dates";
import { linkedAfterHandEdit, mentionedIds, syncWith } from "@/lib/mentions";

type Person = { id: number; name: string; color: number };

type Props = {
  action: (prev: MomentFormState, form: FormData) => Promise<MomentFormState>;
  people: Person[];
  defaults?: { body: string; date: string; personIds: number[]; viaMention: number[] };
  closeHref: string;
};

const noSubscribe = () => () => {};

export function MomentForm({ action, people, defaults, closeHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Today comes from the viewer's clock, so it's read in the browser, never at build time.
  const today = useSyncExternalStore(noSubscribe, localToday, () => "");
  const [picked, setPicked] = useState<string | null>(defaults?.date ?? null);
  const date = picked ?? today;
  // Who was there, and which of them a mention put there (so removing the mention removes them).
  const [withState, setWith] = useState({ chosen: defaults?.personIds ?? [], linked: defaults?.viaMention ?? [] });
  const { chosen } = withState;

  return (
    <form action={formAction} className="flex flex-col">
      <div className="flex items-center justify-between">
        <Link href={closeHref} aria-label="Close" className="-ml-1.5 rounded-full p-1.5 text-ink transition-colors hover:bg-surface">
          <X size={22} />
        </Link>
        <button disabled={pending || !date} className="rounded-full px-3 py-1.5 text-[15px] font-medium text-accent transition-colors hover:bg-surface disabled:opacity-50">
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
          onChange={(ids) => setWith((w) => ({ chosen: ids, linked: linkedAfterHandEdit(w.linked, w.chosen, ids) }))}
          onLock={(id) => setWith((w) => ({ ...w, linked: w.linked.filter((x) => x !== id) }))}
        />
      </div>
      {chosen.map((id) => (
        <input key={id} type="hidden" name="personIds" value={id} />
      ))}
      {withState.linked.map((id) => (
        <input key={id} type="hidden" name="viaMention" value={id} />
      ))}

      <MomentEditor
        people={people}
        defaultValue={defaults?.body}
        autoFocus={!defaults}
        onMention={(p) => setWith((w) => (w.chosen.includes(p.id) ? w : { chosen: [...w.chosen, p.id], linked: [...w.linked, p.id] }))}
        onChange={(body) => setWith((w) => ({ ...w, chosen: syncWith(w.chosen, w.linked, mentionedIds(body)) }))}
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
        className={`rounded-lg font-serif text-[26px] italic underline-offset-4 decoration-line hover:underline ${open ? "underline" : ""}`}
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
