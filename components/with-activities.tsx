"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { ActivityIcon } from "@/components/activity-icon";

type Activity = { id: number; name: string; icon: string };

/**
 * "doing Hiking Board games + activity": chips for what the moment was spent doing, and a search to add
 * more. One there only because the text names it (`linked`) is dashed, and tapping locks it in; tapping
 * any other removes it.
 */
export function WithActivities({
  activities,
  chosen,
  linked,
  onChange,
  onLock,
}: {
  activities: Activity[];
  chosen: number[];
  linked: number[];
  onChange: (ids: number[]) => void;
  onLock: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const byId = new Map(activities.map((a) => [a.id, a]));
  const matches = activities
    .filter((a) => !chosen.includes(a.id) && a.name.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 6);
  const add = (id: number) => {
    onChange([...chosen, id]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
      <span className="text-muted">doing</span>
      {chosen.map((id) => {
        const a = byId.get(id);
        if (!a) return null;
        if (linked.includes(id)) {
          const label = `Keep ${a.name} in this moment`;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onLock(id)}
              aria-label={label}
              title={label}
              className="flex items-center gap-1 rounded-md border border-dashed border-ink/45 px-2 py-px font-medium transition-colors hover:bg-surface"
            >
              <ActivityIcon icon={a.icon} size="0.875rem" />
              {a.name}
            </button>
          );
        }
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(chosen.filter((x) => x !== id))}
            aria-label={`Remove ${a.name}`}
            className="group flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 font-medium transition-[filter] hover:brightness-95"
          >
            <ActivityIcon icon={a.icon} size="0.875rem" />
            {a.name}
            <X size="0.75rem" className="opacity-50 group-hover:opacity-100" />
          </button>
        );
      })}

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
          placeholder="Search activities"
          className="w-36 border-b border-line bg-transparent py-0.5 outline-none focus:border-ink"
        />
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-accent hover:bg-surface">
          <Plus size="0.8125rem" />
          activity
        </button>
      )}

      {open && (
        <ul className="absolute top-full left-0 z-10 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-raised py-1 shadow-(--shadow-pop)">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-muted">{activities.length ? "No activity matches" : "Add activities first"}</li>
          ) : (
            matches.map((a, i) => (
              <li key={a.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(a.id)}
                  className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left hover:bg-surface ${i === 0 ? "bg-surface/60" : ""}`}
                >
                  <ActivityIcon icon={a.icon} size="1rem" />
                  {a.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
