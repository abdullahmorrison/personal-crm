// Order matters: new people take the least-used color, earliest in this list on ties.
export const PERSON_COLORS = [
  { name: "clay", fill: "bg-clay", ink: "text-clay-ink", hover: "hover:bg-clay" },
  { name: "sand", fill: "bg-sand", ink: "text-sand-ink", hover: "hover:bg-sand" },
  { name: "sage", fill: "bg-sage", ink: "text-sage-ink", hover: "hover:bg-sage" },
  { name: "sky", fill: "bg-sky", ink: "text-sky-ink", hover: "hover:bg-sky" },
  { name: "lilac", fill: "bg-lilac", ink: "text-lilac-ink", hover: "hover:bg-lilac" },
  { name: "rose", fill: "bg-rose", ink: "text-rose-ink", hover: "hover:bg-rose" },
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
