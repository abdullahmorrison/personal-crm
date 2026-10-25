"use client";

import { useState } from "react";

/** Two-step delete: the first tap asks, the second deletes. */
export function DeletePerson({ name, action }: { name: string; action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-sm text-muted underline-offset-4 hover:text-accent hover:underline">
        Delete {name}
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-3 text-sm">
      <span>Delete {name}? Their moments stay in your journal.</span>
      <button className="rounded-full bg-accent px-4 py-2 font-medium text-paper transition hover:brightness-110">Delete</button>
      <button type="button" onClick={() => setConfirming(false)} className="text-muted hover:text-ink">
        Cancel
      </button>
    </form>
  );
}
