"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useCallback, useState, useSyncExternalStore } from "react";
import type { MomentFormState } from "@/app/(app)/journal/actions";
import { DatePicker } from "@/components/date-picker";
import { localToday, longDate } from "@/lib/dates";
import { personColor } from "@/lib/person-colors";

type Person = { id: number; name: string; color: number };

type Props = {
  action: (prev: MomentFormState, form: FormData) => Promise<MomentFormState>;
  people: Person[];
  defaults?: { body: string; date: string; personIds: number[] };
  closeHref: string;
};

const noSubscribe = () => () => {};

export function MomentForm({ action, people, defaults, closeHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Today comes from the viewer's clock, so it's read in the browser, never at build time.
  const today = useSyncExternalStore(noSubscribe, localToday, () => "");
  const [picked, setPicked] = useState<string | null>(defaults?.date ?? null);
  const date = picked ?? today;
  const [chosen, setChosen] = useState<number[]>(defaults?.personIds ?? []);

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

      <WithPeople people={people} chosen={chosen} onChange={setChosen} />
      {chosen.map((id) => (
        <input key={id} type="hidden" name="personIds" value={id} />
      ))}

      <textarea
        name="body"
        required
        autoFocus={!defaults}
        defaultValue={defaults?.body}
        placeholder="What happened?"
        className="mt-7 min-h-48 resize-none bg-transparent font-serif text-[19px] leading-8 outline-none field-sizing-content placeholder:text-muted/60"
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
  const close = useCallback(() => setOpen(false), []);
  return (
    <div className="relative mt-6 self-start">
      <button
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
            close();
          }}
        />
      )}
    </div>
  );
}

/** "with Sam Priya + someone": chips for who was there, and a search to add more. */
function WithPeople({ people, chosen, onChange }: { people: Person[]; chosen: number[]; onChange: (ids: number[]) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const byId = new Map(people.map((p) => [p.id, p]));
  const matches = people
    .filter((p) => !chosen.includes(p.id) && p.name.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 6);
  const add = (id: number) => {
    onChange([...chosen, id]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative mt-2 flex flex-wrap items-center gap-1.5 text-[13px]">
      <span className="text-muted">with</span>
      {chosen.map((id) => {
        const p = byId.get(id);
        if (!p) return null;
        const c = personColor(p.color);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(chosen.filter((x) => x !== id))}
            aria-label={`Remove ${p.name}`}
            className={`group flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${c.fill} ${c.ink}`}
          >
            {p.name}
            <X size={12} className="opacity-50 group-hover:opacity-100" />
          </button>
        );
      })}
      {chosen.length === 0 && !open && <span className="text-muted">just me</span>}

      {open ? (
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (matches[0]) add(matches[0].id);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search people"
          className="w-36 border-b border-line bg-transparent py-0.5 outline-none focus:border-ink"
        />
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-accent hover:bg-surface">
          <Plus size={13} />
          someone
        </button>
      )}

      {open && (
        <ul className="absolute top-full left-0 z-10 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_8px_24px_rgba(90,74,58,0.14)]">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-muted">{people.length ? "No one matches" : "Add people first"}</li>
          ) : (
            matches.map((p, i) => {
              const c = personColor(p.color);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => add(p.id)}
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left hover:bg-surface ${i === 0 ? "bg-surface/60" : ""}`}
                  >
                    <span className={`size-2.5 rounded-full ${c.fill} ring-1 ring-black/5`} />
                    {p.name}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
