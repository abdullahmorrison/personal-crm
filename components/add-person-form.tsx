"use client";

import { useActionState } from "react";
import { addPerson } from "@/app/(app)/people/actions";
import { NEW_PERSON_CLOSENESS, TIERS } from "@/lib/tiers";

export function AddPersonForm() {
  const [state, action, pending] = useActionState(addPerson, {});
  return (
    <form action={action} className="flex flex-col gap-8">
      <input
        name="name"
        required
        autoFocus
        autoComplete="off"
        placeholder="Name"
        className="border-b border-line bg-transparent pb-2 font-serif text-3xl outline-none placeholder:text-muted/60 focus:border-ink"
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[11px] font-medium tracking-[0.12em] text-muted uppercase">How close</legend>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input type="radio" name="closeness" value={t.value} defaultChecked={t.value === NEW_PERSON_CLOSENESS} className="peer sr-only" />
              <span className="block rounded-full border border-line px-4 py-2 text-sm text-muted peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-3">
        <span className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">Notes</span>
        <textarea
          name="notes"
          rows={4}
          placeholder="How you met, what matters to them…"
          className="resize-none bg-transparent font-serif text-lg leading-relaxed outline-none placeholder:text-muted/60"
        />
      </label>

      {state.error && <p className="text-sm text-accent" aria-live="polite">{state.error}</p>}

      <button disabled={pending} className="self-start rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper disabled:opacity-60">
        {pending ? "Adding…" : "Add person"}
      </button>
    </form>
  );
}
