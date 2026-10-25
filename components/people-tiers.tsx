"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { firstName, initials } from "@/lib/names";
import { personColor } from "@/lib/person-colors";
import { layoutTiers, type LayoutPerson } from "@/lib/tier-layout";
import { TIERS } from "@/lib/tiers";

const BAND_FILLS = ["bg-band-1", "bg-band-2", "bg-band-3", "bg-band-4"];
const DESK = 1024;

export function PeopleTiers({ people }: { people: LayoutPerson[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const desk = (size?.width ?? 0) >= DESK - 240; // the sidebar takes 240px on desktop
  const layout = size && layoutTiers(people, { ...size, tiers: TIERS, top: desk ? 110 : 96, bottom: desk ? 40 : 150 });

  return (
    <div ref={ref} className="relative h-dvh overflow-hidden">
      {layout && (
        <>
          {[...layout.bands].reverse().map((band, i) => (
            <Circle
              key={band.tier}
              cx={layout.center.x}
              cy={layout.center.y}
              r={band.outerRadius}
              className={`${BAND_FILLS[Math.min(layout.bands.length - 1 - i, BAND_FILLS.length - 1)]} border border-line`}
            />
          ))}
          {/* The closest tier also fills everything below its arc. */}
          <Circle cx={layout.center.x} cy={layout.center.y} r={layout.innerRadius} className="bg-band-1" />

          {layout.bands.map((band) => (
            <p
              key={band.tier}
              style={{ top: band.labelY }}
              className="absolute inset-x-0 text-center text-[10px] font-medium tracking-[0.14em] text-muted uppercase"
            >
              {band.label} · {band.count}
            </p>
          ))}

          {layout.bubbles.map((b) =>
            b.kind === "person" ? (
              <PersonBubble key={b.person.id} person={b.person} x={b.x} y={b.y} size={b.size} />
            ) : (
              <div
                key={`more-${b.tier}`}
                style={{ left: b.x - b.size / 2, top: b.y - b.size / 2, width: b.size }}
                className="absolute flex flex-col items-center gap-1.5"
              >
                <span
                  style={{ width: b.size, height: b.size }}
                  className="flex items-center justify-center rounded-full border border-dashed border-muted text-sm font-medium"
                >
                  +{b.hidden}
                </span>
                <span className="text-[11px] text-muted">more</span>
              </div>
            ),
          )}
        </>
      )}

      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-7 pt-12 desk:px-10 desk:pt-8">
        <div>
          <h1 className="hidden text-2xl font-medium desk:block">People</h1>
          <p className="text-[13px] text-muted">
            {people.length} {people.length === 1 ? "person" : "people"}
          </p>
        </div>
        <Link
          href="/people/new"
          aria-label="Add person"
          className="flex items-center gap-1.5 rounded-full border border-line bg-paper p-2.5 text-sm font-medium desk:px-4 desk:py-2"
        >
          <Plus size={18} />
          <span className="hidden desk:inline">Add person</span>
        </Link>
      </header>

      {people.length === 0 && (
        <div className="absolute inset-x-0 top-1/3 px-10 text-center">
          <p className="font-serif text-xl">No one here yet.</p>
          <Link href="/people/new" className="mt-2 inline-block text-sm font-medium text-accent">
            Add your first person
          </Link>
        </div>
      )}
    </div>
  );
}

function Circle({ cx, cy, r, className }: { cx: number; cy: number; r: number; className: string }) {
  return <div style={{ left: cx - r, top: cy - r, width: r * 2, height: r * 2 }} className={`absolute rounded-full ${className}`} />;
}

function PersonBubble({ person, x, y, size }: { person: LayoutPerson; x: number; y: number; size: number }) {
  const color = personColor(person.color);
  return (
    <div style={{ left: x - size / 2 - 20, top: y - size / 2, width: size + 40 }} className="absolute flex flex-col items-center gap-1.5">
      <span
        style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
        className={`flex items-center justify-center rounded-full font-serif shadow-[0_2px_6px_rgba(90,74,58,0.10)] ring-2 ring-white/90 ${color.fill} ${color.ink}`}
      >
        {initials(person.name)}
      </span>
      <span className={`max-w-full truncate text-xs ${person.closeness === TIERS[TIERS.length - 1].value ? "text-muted" : ""}`}>
        {firstName(person.name)}
      </span>
    </div>
  );
}
