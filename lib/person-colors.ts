// Order matters: new people take the least-used color, earliest in this list on ties.
export const PERSON_COLORS = [
  { name: "clay", fill: "bg-clay", ink: "text-clay-ink" },
  { name: "sand", fill: "bg-sand", ink: "text-sand-ink" },
  { name: "sage", fill: "bg-sage", ink: "text-sage-ink" },
  { name: "sky", fill: "bg-sky", ink: "text-sky-ink" },
  { name: "lilac", fill: "bg-lilac", ink: "text-lilac-ink" },
  { name: "rose", fill: "bg-rose", ink: "text-rose-ink" },
] as const;

export function personColor(index: number) {
  const n = PERSON_COLORS.length;
  return PERSON_COLORS[((index % n) + n) % n];
}

/** Color index for a new person, given how many people already use each index. */
export function nextColor(usage: Map<number, number>) {
  let best = 0;
  for (let i = 1; i < PERSON_COLORS.length; i++) {
    if ((usage.get(i) ?? 0) < (usage.get(best) ?? 0)) best = i;
  }
  return best;
}
