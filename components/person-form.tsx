"use client";

import { SmilePlus } from "lucide-react";
import { useActionState, useState } from "react";
import type { PersonFormState } from "@/app/(app)/people/actions";
import { EmojiBadge } from "@/components/emoji-badge";
import { SectionLabel } from "@/components/section-label";
import { lastEmoji } from "@/lib/emoji";
import { initials } from "@/lib/names";
import { personColor } from "@/lib/person-colors";
import { NEW_PERSON_CLOSENESS, TIERS } from "@/lib/tiers";

// Quick picks for where you know someone from; any other emoji can be typed.
const SUGGESTED = ["💼", "🎓", "🏡", "🏋️", "🤝", "💬", "🙏", "✈️", "🏠", "❤️", "⚽", "🎉", "☕", "🧗", "📚", "🐕"];

type Props = {
  action: (prev: PersonFormState, form: FormData) => Promise<PersonFormState>;
  submitLabel: string;
  color: number; // the person's avatar color, for the preview
  defaults?: { name: string; closeness: number; emoji: string; notes: string };
};

export function PersonForm({ action, submitLabel, color, defaults }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [name, setName] = useState(defaults?.name ?? "");
  const [emoji, setEmoji] = useState(defaults?.emoji ?? "");
  const [picking, setPicking] = useState(false);
  const c = personColor(color);
  return (
    <form action={formAction} className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPicking(!picking)}
          aria-label={emoji ? `Change emoji ${emoji}` : "Add an emoji"}
          aria-expanded={picking}
          className={`relative flex size-16 shrink-0 items-center justify-center rounded-full font-serif text-[1.375rem] shadow-(--shadow-avatar) ring-2 ring-halo ${c.fill} ${c.ink}`}
        >
          {initials(name)}
          {emoji ? (
            <EmojiBadge emoji={emoji} />
          ) : (
            <span className="absolute -right-0.75 -bottom-0.75 flex size-6 items-center justify-center rounded-full border border-dashed border-muted bg-paper text-muted">
              <SmilePlus size="0.875rem" />
            </span>
          )}
        </button>
        <input type="hidden" name="emoji" value={emoji} />
        <input
          name="name"
          required
          autoFocus={!defaults}
          autoComplete="off"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 border-b border-line bg-transparent pb-2 font-serif text-3xl outline-none placeholder:text-muted/60 focus:border-ink"
        />
      </div>

      {picking && (
        <EmojiPicker
          current={emoji}
          onPick={(e) => {
            setEmoji(e);
            setPicking(false);
          }}
        />
      )}

      <fieldset className="flex flex-col gap-3">
        <SectionLabel as="legend" className="mb-3">
          How close
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <label key={t.value} className="cursor-pointer">
              <input
                type="radio"
                name="closeness"
                value={t.value}
                defaultChecked={t.value === (defaults?.closeness ?? NEW_PERSON_CLOSENESS)}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-muted hover:text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-3">
        <SectionLabel as="span">Notes</SectionLabel>
        <textarea
          name="notes"
          rows={4}
          defaultValue={defaults?.notes}
          placeholder="How you met, what matters to them…"
          className="resize-none bg-transparent font-serif text-lg leading-relaxed outline-none placeholder:text-muted/60"
        />
      </label>

      {state.error && <p className="text-sm text-accent" aria-live="polite">{state.error}</p>}

      <button
        disabled={pending}
        className="self-start rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

/** Quick picks, a field for any other emoji, and a way to clear it. */
function EmojiPicker({ current, onPick }: { current: string; onPick: (emoji: string) => void }) {
  return (
    <div className="-mt-4 flex flex-col gap-3 rounded-2xl bg-surface p-3">
      <div className="grid grid-cols-8 gap-1">
        {SUGGESTED.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            aria-pressed={e === current}
            className={`flex aspect-square items-center justify-center rounded-lg text-xl ${e === current ? "bg-paper ring-[1.5px] ring-accent" : "hover:bg-paper"}`}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 px-1">
        <input
          autoComplete="off"
          placeholder="Or type any emoji"
          aria-label="Type any emoji"
          onChange={(e) => {
            const typed = lastEmoji(e.target.value);
            if (typed) onPick(typed);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          className="min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted"
        />
        {current && (
          <button type="button" onClick={() => onPick("")} className="text-sm text-muted hover:text-ink">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
