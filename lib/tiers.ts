// Closeness tiers. People store closeness as a number, so screens read tiers from here.
export const TIERS = [
  { value: 1, label: "Inner circle", plural: "Inner circle" },
  { value: 2, label: "Close", plural: "Close" },
  { value: 3, label: "Friend", plural: "Friends" },
  { value: 4, label: "Acquaintance", plural: "Acquaintances" },
  // People you'd like to know but don't yet. They're counted apart from everyone else.
  { value: 5, label: "Prospect", plural: "Prospects", band: "Prospects" },
] as const;

export const ACQUAINTANCE = 4;
export const PROSPECT = 5;
export const NEW_PERSON_CLOSENESS = ACQUAINTANCE;

export function tierLabel(closeness: number) {
  return TIERS.find((t) => t.value === closeness)?.label ?? "Unknown";
}
