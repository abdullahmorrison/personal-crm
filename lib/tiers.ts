// Closeness tiers. People store closeness as a number, so screens read tiers from here.
export const TIERS = [
  { value: 1, label: "Inner circle" },
  { value: 2, label: "Close" },
  { value: 3, label: "Friend" },
  { value: 4, label: "Acquaintance" },
  // People you'd like to know but don't yet. They're counted apart from everyone else.
  { value: 5, label: "Prospect", band: "Prospects" },
] as const;

export const ACQUAINTANCE = 4;
export const PROSPECT = 5;
export const NEW_PERSON_CLOSENESS = ACQUAINTANCE;

export function tierLabel(closeness: number) {
  return TIERS.find((t) => t.value === closeness)?.label ?? "Unknown";
}
