// Closeness tiers. People store closeness as a number, so screens read tiers from here.
export const TIERS = [
  { value: 1, label: "Inner circle" },
  { value: 2, label: "Close" },
  { value: 3, label: "Friend" },
  { value: 4, label: "Acquaintance" },
] as const;

export const NEW_PERSON_CLOSENESS = TIERS[TIERS.length - 1].value;

export function tierLabel(closeness: number) {
  return TIERS.find((t) => t.value === closeness)?.label ?? "Unknown";
}
