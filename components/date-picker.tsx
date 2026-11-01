"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { longDate, monthGrid, monthLabel, shiftMonth, shortMonth } from "@/lib/dates";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const YEARS_PER_PAGE = 12;

// onClose(true) asks for focus back on the opener (Escape); a tap elsewhere leaves focus where it lands.
type Props = { date: string; today: string; onPick: (date: string) => void; onClose: (refocus: boolean) => void };
// Tapping the heading zooms out: days → months of a year → a page of years.
type View = "days" | "months" | "years";

/** A month calendar in a card. Picking a day, Escape, or a tap outside closes it. */
export function DatePicker({ date, today, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("days");
  const [month, setMonth] = useState(date.slice(0, 7) + "-01"); // the 1st of the month on show
  const year = Number(month.slice(0, 4));
  const firstYear = Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;

  useEffect(() => {
    // The parent holds the button that opened the card, which toggles it on its own.
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose(false);
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
  }, [onClose]);

  // Keep keyboard focus in the grid as the view changes: on the picked cell, else the first one.
  useEffect(() => {
    const cells = [...(ref.current?.querySelectorAll<HTMLButtonElement>("[aria-pressed]") ?? [])];
    (cells.find((c) => c.getAttribute("aria-pressed") === "true") ?? cells[0])?.focus();
  }, [view]);

  const step = { days: 1, months: 12, years: 12 * YEARS_PER_PAGE }[view];
  const heading = {
    days: { label: monthLabel(month), zoom: "months" as const },
    months: { label: String(year), zoom: "years" as const },
    years: { label: `${firstYear} – ${firstYear + YEARS_PER_PAGE - 1}`, zoom: null },
  }[view];
  const unit = { days: "month", months: "year", years: "years" }[view];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Pick a date"
      className="absolute top-full left-0 z-10 mt-3 -ml-1 w-[19.375rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-raised px-3.5 pt-3.5 pb-3 font-sans shadow-(--shadow-pop)"
    >
      <div className="flex items-center">
        <button type="button" onClick={() => setMonth(shiftMonth(month, -step))} aria-label={`Previous ${unit}`} className="rounded-full p-1.5 hover:bg-surface">
          <ChevronLeft size="1.25rem" />
        </button>
        <div className="flex flex-1 justify-center" aria-live="polite">
          {heading.zoom ? (
            <button
              type="button"
              onClick={() => setView(heading.zoom)}
              className="rounded-full px-2 font-serif text-xl italic underline-offset-4 decoration-line hover:underline"
            >
              {heading.label}
            </button>
          ) : (
            <span className="font-serif text-xl italic">{heading.label}</span>
          )}
        </div>
        <button type="button" onClick={() => setMonth(shiftMonth(month, step))} aria-label={`Next ${unit}`} className="rounded-full p-1.5 hover:bg-surface">
          <ChevronRight size="1.25rem" />
        </button>
      </div>

      {view === "days" && <Days month={month} date={date} today={today} onPick={onPick} />}

      {view === "months" && (
        <div className="mt-3 grid grid-cols-3 gap-y-1">
          {Array.from({ length: 12 }, (_, i) => {
            const m = shiftMonth(`${year}-01-01`, i);
            return (
              <Cell
                key={m}
                wide
                label={monthLabel(m)}
                picked={m.slice(0, 7) === date.slice(0, 7)}
                current={m.slice(0, 7) === today.slice(0, 7)}
                onClick={() => {
                  setMonth(m);
                  setView("days");
                }}
              >
                {shortMonth(m)}
              </Cell>
            );
          })}
        </div>
      )}

      {view === "years" && (
        <div className="mt-3 grid grid-cols-3 gap-y-1">
          {Array.from({ length: YEARS_PER_PAGE }, (_, i) => {
            const y = firstYear + i;
            return (
              <Cell
                key={y}
                wide
                label={String(y)}
                picked={String(y) === date.slice(0, 4)}
                current={String(y) === today.slice(0, 4)}
                onClick={() => {
                  setMonth(`${y}${month.slice(4)}`);
                  setView("months");
                }}
              >
                {y}
              </Cell>
            );
          })}
        </div>
      )}

      <button type="button" onClick={() => onPick(today)} className="mt-1 rounded-full px-1.5 py-1 text-[0.8125rem] font-medium text-accent hover:bg-surface">
        Today
      </button>
    </div>
  );
}

function Days({ month, date, today, onPick }: { month: string; date: string; today: string; onPick: (date: string) => void }) {
  const { blanks, days } = monthGrid(month);
  return (
    <>
      <div className="mt-2 grid grid-cols-7 text-center text-[0.625rem] font-medium tracking-[0.14em] text-muted" aria-hidden>
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7">
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((d) => (
          <Cell key={d} label={longDate(d)} picked={d === date} current={d === today} onClick={() => onPick(d)}>
            {Number(d.slice(8))}
          </Cell>
        ))}
      </div>
    </>
  );
}

/** One choice in the grid. Picked is filled with the accent; the current one (today, this month, this year) is ringed. */
function Cell({
  label,
  picked,
  current,
  wide,
  onClick,
  children,
}: {
  label: string;
  picked: boolean;
  current: boolean;
  wide?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={picked}
      aria-current={current ? "date" : undefined}
      className={`group flex items-center justify-center outline-none ${wide ? "h-11" : "h-9"}`}
    >
      <span
        className={`flex items-center justify-center rounded-full text-sm transition-colors group-focus-visible:ring-2 group-focus-visible:ring-accent/40 ${
          wide ? "h-9 w-16" : "size-8"
        } ${
          picked
            ? "bg-accent font-medium text-on-accent"
            : current
              ? "font-medium text-accent ring-[1.5px] ring-line ring-inset group-hover:bg-surface"
              : "text-ink group-hover:bg-surface"
        }`}
      >
        {children}
      </span>
    </button>
  );
}
