"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { firstName, initials } from "@/lib/names";
import { personColor } from "@/lib/person-colors";
import { layoutTiers, type LayoutPerson } from "@/lib/tier-layout";
import { TIERS } from "@/lib/tiers";

// When the side panel opens the arcs get narrower; everything glides to its new place.
const GLIDE = "motion-safe:transition-[left,top,width,height] motion-safe:duration-300 motion-safe:ease-out";
// Bubbles pop in one after another, capped so a bubble that appears later (say, an overflow
// bubble when the panel narrows the arcs) never waits long to show.
const stagger = (i: number) => Math.min(i * 25, 250);
const BAND_FILLS = ["bg-band-1", "bg-band-2", "bg-band-3", "bg-band-4"];
const DESK_QUERY = "(min-width: 1024px)"; // matches the `desk` breakpoint in globals.css

function useIsDesk() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESK_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESK_QUERY).matches,
    () => false,
  );
}

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

  const desk = useIsDesk();
  const selectedId = Number(usePathname().match(/^\/people\/(\d+)/)?.[1]);
  const layout = size && layoutTiers(people, { ...size, tiers: TIERS, top: desk ? 110 : 96, bottom: desk ? 40 : 150 });

  return (
    <div ref={ref} className="relative -mb-28 h-dvh overflow-hidden desk:mb-0">
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
              className={`absolute inset-x-0 text-center text-[10px] font-medium tracking-[0.14em] text-muted uppercase ${GLIDE}`}
            >
              {band.label} · {band.count}
            </p>
          ))}

          {layout.bubbles.map((b, i) =>
            b.kind === "person" ? (
              <PersonBubble key={b.person.id} person={b.person} x={b.x} y={b.y} size={b.size} delay={stagger(i)} selected={b.person.id === selectedId} />
            ) : (
              <div
                key={`more-${b.tier}`}
                style={{ left: b.x - b.size / 2, top: b.y - b.size / 2, width: b.size, animationDelay: `${stagger(i)}ms` }}
                className={`absolute flex flex-col items-center gap-1.5 ${GLIDE} motion-safe:animate-pop-in`}
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
          className="flex items-center gap-1.5 rounded-full border border-line bg-paper p-2.5 text-sm font-medium transition-colors hover:border-muted hover:bg-surface desk:px-4 desk:py-2"
        >
          <Plus size={18} />
          <span className="hidden desk:inline">Add person</span>
        </Link>
      </header>

      {people.length === 0 && layout && <EmptyPrompt bands={layout.bands} />}
    </div>
  );
}

/** Centred inside a middle band, clear of the tier labels and arc edges. */
function EmptyPrompt({ bands }: { bands: { labelY: number }[] }) {
  const i = Math.floor(bands.length / 2);
  const top = bands[i].labelY + 22;
  const bottom = bands[i - 1].labelY - 12;
  return (
    <div style={{ top, height: bottom - top }} className="absolute inset-x-0 flex flex-col items-center justify-center gap-1.5 px-8 text-center">
      <p className="font-serif text-[22px]">No one here yet.</p>
      <p className="text-[13px] text-muted">Add the people in your life, closest at the bottom.</p>
      <Link href="/people/new" className="mt-1 text-[13px] font-medium text-accent underline-offset-4 hover:underline">
        Add your first person
      </Link>
    </div>
  );
}

function Circle({ cx, cy, r, className }: { cx: number; cy: number; r: number; className: string }) {
  return <div style={{ left: cx - r, top: cy - r, width: r * 2, height: r * 2 }} className={`absolute rounded-full ${GLIDE} ${className}`} />;
}

type BubbleProps = { person: LayoutPerson; x: number; y: number; size: number; delay: number; selected: boolean };

function PersonBubble({ person, x, y, size, delay, selected }: BubbleProps) {
  const color = personColor(person.color);
  return (
    <Link
      href={`/people/${person.id}`}
      style={{ left: x - size / 2 - 20, top: y - size / 2, width: size + 40, animationDelay: `${delay}ms` }}
      className={`group absolute flex flex-col items-center gap-1.5 rounded-lg outline-none ${GLIDE} motion-safe:animate-pop-in`}
    >
      <span
        style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
        className={`flex items-center justify-center rounded-full font-serif shadow-[0_2px_6px_rgba(90,74,58,0.10)] ${selected ? "ring-[2.5px] ring-accent" : "ring-2 ring-white/90"} transition group-hover:shadow-[0_6px_14px_rgba(90,74,58,0.18)] group-focus-visible:ring-ink group-active:scale-95 motion-safe:group-hover:-translate-y-0.5 ${color.fill} ${color.ink}`}
      >
        {initials(person.name)}
      </span>
      <span className={`max-w-full truncate text-xs ${selected ? "font-medium" : person.closeness === TIERS[TIERS.length - 1].value ? "text-muted" : ""}`}>
        {firstName(person.name)}
      </span>
    </Link>
  );
}
