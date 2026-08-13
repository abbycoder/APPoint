import { useEffect, useMemo, useState } from "react";
import { Assignment } from "../types";
import {
  assignmentsOnDay,
  dayLabel,
  getMonthGrid,
  isSameDay,
} from "../lib/time";
import { AssignmentCard } from "./AssignmentCard";

interface PersonnelCalendarViewProps {
  assignments: Assignment[];
  monthCursor: Date;
  onMonthChange: (month: Date) => void;
  onEdit: (a: Assignment) => void;
  onDelete: (id: string) => void;
  onNew: (date?: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const PAGE_SIZE = 3;

export function PersonnelCalendarView({
  assignments,
  monthCursor,
  onMonthChange,
  onEdit,
  onDelete,
  onNew,
}: PersonnelCalendarViewProps) {
  const today = new Date();
  const [selected, setSelected] = useState(today);
  const [page, setPage] = useState(0);

  const grid = getMonthGrid(monthCursor);
  const selectedAssignments = assignmentsOnDay(assignments, selected);
  const totalPages = Math.max(
    1,
    Math.ceil(selectedAssignments.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages - 1);
  const pagedAssignments = selectedAssignments.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  useEffect(() => {
    setPage(0);
  }, [selected, selectedAssignments.length]);

  const years = useMemo(() => {
    const years_ = assignments.map((a) => new Date(a.datetime).getFullYear());
    const min = Math.min(today.getFullYear() - 2, ...years_);
    const max = Math.max(today.getFullYear() + 5, ...years_);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [assignments, today]);

  function changeMonth(delta: number) {
    onMonthChange(
      new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1),
    );
  }

  function jumpToMonth(monthIndex: number) {
    onMonthChange(new Date(monthCursor.getFullYear(), monthIndex, 1));
  }

  function jumpToYear(year: number) {
    onMonthChange(new Date(year, monthCursor.getMonth(), 1));
  }

  function goToday() {
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today);
  }

  return (
    <div>
      {/* Month header with direct jump controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-1">
          <DropdownSelect
            value={monthCursor.getMonth()}
            onChange={jumpToMonth}
            options={MONTHS.map((m, i) => ({ value: i, label: m }))}
            ariaLabel="Jump to month"
          />
          <DropdownSelect
            value={monthCursor.getFullYear()}
            onChange={jumpToYear}
            options={years.map((y) => ({ value: y, label: String(y) }))}
            ariaLabel="Jump to year"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="rounded-md px-2.5 py-1 text-sm text-ink/60 hover:bg-ink/5"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={goToday}
            className="rounded-md px-3 py-1 text-xs font-medium text-navy-dark hover:bg-navy/10"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="rounded-md px-2.5 py-1 text-sm text-ink/60 hover:bg-ink/5"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-rule pb-2">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-center font-mono text-[11px] uppercase tracking-wide text-slate"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1 pt-1">
        {grid.map(({ date, inMonth }) => {
          const count = assignmentsOnDay(assignments, date).length;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selected);

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelected(date)}
              className={`mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-full text-sm transition ${
                isSelected
                  ? "bg-navy text-paper"
                  : isToday
                    ? "border border-navy text-navy-dark"
                    : "hover:bg-ink/5"
              } ${!inMonth && !isSelected ? "opacity-40" : ""} ${
                inMonth && !isSelected ? "text-ink" : ""
              }`}
            >
              <span className="font-mono leading-none tabular">
                {date.getDate()}
              </span>
              {count > 0 && (
                <span
                  className={`mt-1 h-1 w-1 rounded-full ${isSelected ? "bg-paper" : "bg-amber"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day's assignments */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">
            {dayLabel(selected)}
          </h3>
          <button
            onClick={() => onNew(selected)}
            className="text-xs font-medium text-navy-dark hover:underline"
          >
            + Add assignment
          </button>
        </div>

        {selectedAssignments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-rule py-8 text-center text-sm text-ink/50">
            No assignments this day.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {pagedAssignments.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-3">
                <span className="font-mono text-xs tabular text-slate">
                  {currentPage + 1} / {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={currentPage === 0}
                    className="rounded-md px-2.5 py-1 text-sm text-ink/60 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(p + 1, totalPages - 1))
                    }
                    disabled={currentPage === totalPages - 1}
                    className="rounded-md px-2.5 py-1 text-sm text-ink/60 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface DropdownSelectProps {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  ariaLabel: string;
}

function DropdownSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: DropdownSelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className="cursor-pointer appearance-none rounded bg-transparent py-0.5 pl-0 pr-5 font-display text-xl text-ink hover:text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-0.5 h-3.5 w-3.5 text-ink/50"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
