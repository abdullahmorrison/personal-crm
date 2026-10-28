// Geometry for the People screen: closeness tiers drawn as arcs around a point below the screen,
// closest tier at the bottom (near the thumb). Pure math so it can be tested without a browser.

export type LayoutPerson = { id: number; name: string; closeness: number; color: number };

export type Band = { tier: number; label: string; count: number; outerRadius: number; labelY: number };
export type Bubble = { kind: "person"; person: LayoutPerson; x: number; y: number; size: number };
export type Overflow = { kind: "overflow"; tier: number; hidden: number; x: number; y: number; size: number };

export type TierLayout = {
  center: { x: number; y: number };
  innerRadius: number;
  bands: Band[];
  bubbles: (Bubble | Overflow)[];
};

type Options = {
  width: number;
  height: number;
  top: number; // space reserved above the outermost band (header)
  bottom: number; // space reserved below the innermost band (buttons, tab bar)
  tiers: readonly { value: number; label: string }[]; // closest first
};

// Bubble diameter per tier, closest first; tiers past the end reuse the last size.
const SIZES = [64, 56, 50, 44, 40];
const SIDE_MARGIN = 28;
const LABEL_GAP = 34; // from a band's outer edge to its row of bubbles

export function bubbleSize(tierIndex: number) {
  return SIZES[Math.min(tierIndex, SIZES.length - 1)];
}

export function layoutTiers(people: LayoutPerson[], { width, height, top, bottom, tiers }: Options): TierLayout {
  const bandHeight = (height - top - bottom) / tiers.length;
  // A radius well beyond the width keeps the arcs gentle on any screen.
  const innerRadius = Math.max(600, width * 1.5);
  const center = { x: width / 2, y: height - bottom + innerRadius };

  const bands: Band[] = [];
  const bubbles: (Bubble | Overflow)[] = [];

  tiers.forEach((tier, i) => {
    const outerRadius = innerRadius + bandHeight * (i + 1);
    const size = bubbleSize(i);
    const inTier = people.filter((p) => p.closeness === tier.value).sort((a, b) => a.name.localeCompare(b.name));
    bands.push({ tier: tier.value, label: tier.label, count: inTier.length, outerRadius, labelY: center.y - outerRadius + 12 });
    if (inTier.length === 0) return;

    // How many bubbles fit side by side, leaving room for names under them.
    const halfWidth = width / 2 - SIDE_MARGIN - size / 2;
    const minGap = size + 18;
    const capacity = Math.max(1, Math.floor((2 * halfWidth) / minGap) + 1);
    const overflow = inTier.length > capacity;
    const shown = overflow ? inTier.slice(0, capacity - 1) : inTier;
    const slots = shown.length + (overflow ? 1 : 0);

    // Spread naturally, but never wider than the screen allows.
    const spread = Math.min(halfWidth, ((slots - 1) * size * 1.75) / 2);
    const ring = outerRadius - LABEL_GAP - size / 2;
    const place = (slot: number) => {
      const dx = slots === 1 ? 0 : -spread + (2 * spread * slot) / (slots - 1);
      return { x: center.x + dx, y: center.y - Math.sqrt(ring * ring - dx * dx), size };
    };

    shown.forEach((person, slot) => bubbles.push({ kind: "person", person, ...place(slot) }));
    if (overflow) bubbles.push({ kind: "overflow", tier: tier.value, hidden: inTier.length - shown.length, ...place(slots - 1) });
  });

  return { center, innerRadius, bands, bubbles };
}

/**
 * Which tier a point (in the same coordinates as the layout) falls in, by its distance from the
 * arcs' center. Below the closest arc counts as the closest tier; past the farthest, the farthest.
 */
export function tierAt(layout: Pick<TierLayout, "center" | "bands">, point: { x: number; y: number }) {
  const distance = Math.hypot(point.x - layout.center.x, point.y - layout.center.y);
  const band = layout.bands.find((b) => distance <= b.outerRadius) ?? layout.bands.at(-1);
  return band?.tier;
}
