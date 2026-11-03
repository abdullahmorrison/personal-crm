"use client";

import { useEffect, useRef, useState } from "react";
import { fromClock, toClock } from "@/lib/dates";

// onClose(true) asks for focus back on the opener (Escape, Now); a tap elsewhere leaves focus where it lands.
type Props = { time: string; now: string; opener: React.RefObject<HTMLElement | null>; onPick: (time: string) => void; onClose: (refocus: boolean) => void };

const HOURS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
const MINUTES = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, "0") }));
const HALVES = [
  { value: 0, label: "AM" },
  { value: 1, label: "PM" },
];

/** Hour, minute and AM/PM wheels in a card; each settled wheel picks right away. Now, Escape, or a tap outside closes it. */
export function TimePicker({ time, now, opener, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // An empty time starts the wheels at noon.
  const [clock, setClock] = useState(() => toClock(time || "12:00"));

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      // The opener toggles the card on its own.
      if (!ref.current?.contains(target) && !opener.current?.contains(target)) onClose(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(true);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, opener]);

  const set = (part: Partial<typeof clock>) => {
    const next = { ...clock, ...part };
    setClock(next);
    onPick(fromClock(next));
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Pick a time"
      className="absolute top-full right-0 z-10 mt-3 w-[14.5rem] rounded-2xl border border-line bg-raised px-3.5 pt-3.5 pb-3 font-sans shadow-(--shadow-pop)"
    >
      <div className="relative flex items-center">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 rounded-[0.625rem] bg-surface" />
        <Wheel label="Hour" items={HOURS} value={clock.hour} onChange={(hour) => set({ hour })} />
        <span aria-hidden className="relative text-base font-medium">
          :
        </span>
        <Wheel label="Minute" items={MINUTES} value={clock.minute} onChange={(minute) => set({ minute })} />
        <Wheel label="AM or PM" items={HALVES} value={clock.pm ? 1 : 0} onChange={(half) => set({ pm: half === 1 })} />
      </div>
      <button
        type="button"
        onClick={() => {
          onPick(now);
          onClose(true);
        }}
        className="mt-1 rounded-full px-1.5 py-1 text-[0.8125rem] font-medium text-accent hover:bg-surface"
      >
        Now
      </button>
    </div>
  );
}

/**
 * A column that scrolls and snaps; the row in the middle is the value. Tapping a row or the arrow keys
 * scroll it into the middle, and the value changes once the scroll settles.
 */
function Wheel({ label, items, value, onChange }: { label: string; items: { value: number; label: string }[]; value: number; onChange: (value: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const index = items.findIndex((i) => i.value === value);
  const rowHeight = () => (ref.current?.firstElementChild as HTMLElement | null)?.offsetHeight ?? 1;
  const scrollTo = (i: number, behavior: ScrollBehavior = "smooth") => ref.current?.scrollTo({ top: i * rowHeight(), behavior });

  // Start with the value in the middle. Later scrolls come from the wheel itself, so it's done once.
  useEffect(() => {
    scrollTo(index, "instant");
    return () => clearTimeout(settle.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={() => {
        clearTimeout(settle.current);
        settle.current = setTimeout(() => {
          const i = Math.min(items.length - 1, Math.max(0, Math.round((ref.current?.scrollTop ?? 0) / rowHeight())));
          if (items[i].value !== value) onChange(items[i].value);
        }, 120);
      }}
      onKeyDown={(e) => {
        const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
        if (!step) return;
        e.preventDefault();
        scrollTo(Math.min(items.length - 1, Math.max(0, index + step)));
      }}
      className="relative h-45 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain py-18 outline-none [scrollbar-width:none] [mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)] focus-visible:rounded-[0.625rem] focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {items.map((item, i) => (
        <div
          key={item.value}
          role="option"
          aria-selected={i === index}
          onClick={() => scrollTo(i)}
          className={`flex h-9 cursor-pointer snap-center items-center justify-center ${i === index ? "text-base font-medium text-ink" : "text-[0.9375rem] text-muted"}`}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
