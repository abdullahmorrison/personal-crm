"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { longDate, monthGrid, monthLabel, shiftMonth } from "@/lib/dates";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

type Props = { date: string; today: string; onPick: (date: string) => void; onClose: () => void };

/** A month calendar in a card. Picking a day, Escape, or a tap outside closes it. */
export function DatePicker({ date, today, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [month, setMonth] = useState(date);
  const { blanks, days } = monthGrid(month);

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("[aria-pressed=true]")?.focus();
    // The parent holds the button that opened the card, which toggles it on its own.
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Pick a date"
      className="absolute top-full left-0 z-10 mt-3 -ml-1 w-[310px] rounded-2xl border border-line bg-white px-3.5 pt-3.5 pb-3 font-sans shadow-[0_8px_24px_rgba(90,74,58,0.14)]"
    >
      <div className="flex items-center">
        <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month" className="rounded-full p-1.5 hover:bg-surface">
          <ChevronLeft size={20} />
        </button>
        <p className="flex-1 text-center font-serif text-xl italic" aria-live="polite">
          {monthLabel(month)}
        </p>
        <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month" className="rounded-full p-1.5 hover:bg-surface">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-[10px] font-medium tracking-[0.14em] text-muted" aria-hidden>
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7">
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((d) => {
          const picked = d === date;
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onPick(d)}
              aria-label={longDate(d)}
              aria-pressed={picked}
              aria-current={isToday ? "date" : undefined}
              className="group flex h-9 items-center justify-center outline-none"
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full text-sm transition-colors group-focus-visible:ring-2 group-focus-visible:ring-accent/40 ${
                  picked
                    ? "bg-accent font-medium text-white"
                    : isToday
                      ? "font-medium text-accent ring-[1.5px] ring-line ring-inset group-hover:bg-surface"
                      : "text-ink group-hover:bg-surface"
                }`}
              >
                {Number(d.slice(8))}
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={() => onPick(today)} className="mt-1 rounded-full px-1.5 py-1 text-[13px] font-medium text-accent hover:bg-surface">
        Today
      </button>
    </div>
  );
}
