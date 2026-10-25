import { describe, expect, it } from "vitest";
import { layoutTiers, type LayoutPerson } from "./tier-layout";
import { TIERS } from "./tiers";

const phone = { width: 402, height: 800, top: 100, bottom: 140, tiers: TIERS };
const people = (n: number, closeness: number): LayoutPerson[] =>
  Array.from({ length: n }, (_, i) => ({ id: closeness * 100 + i, name: `P${String(i).padStart(2, "0")}`, closeness, color: 0 }));

describe("layoutTiers", () => {
  it("puts the closest tier lowest on screen", () => {
    const { bands } = layoutTiers([], phone);
    const labels = bands.map((b) => b.labelY);
    expect(labels).toEqual([...labels].sort((a, b) => b - a));
    expect(bands[0].label).toBe("Inner circle");
  });

  it("counts everyone in a tier, including hidden people", () => {
    const { bands } = layoutTiers(people(30, 4), phone);
    expect(bands[3].count).toBe(30);
  });

  it("shows everyone when they fit", () => {
    const { bubbles } = layoutTiers(people(3, 1), phone);
    expect(bubbles.filter((b) => b.kind === "person")).toHaveLength(3);
    expect(bubbles.some((b) => b.kind === "overflow")).toBe(false);
  });

  it("adds an overflow bubble when a tier is full", () => {
    const { bubbles } = layoutTiers(people(30, 4), phone);
    const shown = bubbles.filter((b) => b.kind === "person").length;
    const overflow = bubbles.find((b) => b.kind === "overflow");
    expect(overflow).toBeDefined();
    expect(shown + (overflow?.kind === "overflow" ? overflow.hidden : 0)).toBe(30);
  });

  it("fits more people on a wider screen", () => {
    const narrow = layoutTiers(people(30, 4), phone).bubbles.filter((b) => b.kind === "person").length;
    const wide = layoutTiers(people(30, 4), { ...phone, width: 1200 }).bubbles.filter((b) => b.kind === "person").length;
    expect(wide).toBeGreaterThan(narrow);
  });

  it("keeps every bubble inside the screen", () => {
    for (const width of [360, 402, 1200]) {
      for (const b of layoutTiers([...people(3, 1), ...people(6, 2), ...people(12, 3), ...people(30, 4)], { ...phone, width }).bubbles) {
        expect(b.x - b.size / 2).toBeGreaterThanOrEqual(0);
        expect(b.x + b.size / 2).toBeLessThanOrEqual(width);
      }
    }
  });

  it("centres a lone person", () => {
    const [b] = layoutTiers(people(1, 2), phone).bubbles;
    expect(b.x).toBe(phone.width / 2);
  });
});
