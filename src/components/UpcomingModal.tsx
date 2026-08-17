import { useMemo, useState } from "react";
import { Appointment, Assignment } from "../types";
import { formatTime, groupItemsByMonth, toDateOnlyValue } from "../lib/time";

interface UpcomingModalProps {
  mode: "appointments" | "personnel";
  items: (Appointment | Assignment)[];
  onClose: () => void;
}

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

export function UpcomingModal({ mode, items, onClose }: UpcomingModalProps) {
  const isAppointments = mode === "appointments";
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const years = useMemo(() => {
    const set = new Set(items.map((i) => new Date(i.datetime).getFullYear()));
    return [...set].sort((a, b) => a - b);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const d = new Date(item.datetime);
      if (yearFilter !== "all" && d.getFullYear() !== yearFilter) return false;
      if (monthFilter !== "all" && d.getMonth() !== monthFilter) return false;
      return true;
    });
  }, [items, monthFilter, yearFilter]);

  const groups = useMemo(() => groupItemsByMonth(filtered), [filtered]);
  const hasFilter = monthFilter !== "all" || yearFilter !== "all";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-rule bg-paper p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">
            Upcoming {isAppointments ? "appointments" : "assignments"}
          </h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FilterSelect
            value={monthFilter}
            onChange={setMonthFilter}
            ariaLabel="Filter by month"
            allLabel="All months"
            options={MONTHS.map((m, i) => ({ value: i, label: m }))}
          />
          <FilterSelect
            value={yearFilter}
            onChange={setYearFilter}
            ariaLabel="Filter by year"
            allLabel="All years"
            options={years.map((y) => ({ value: y, label: String(y) }))}
          />
          {hasFilter && (
            <button
              onClick={() => {
                setMonthFilter("all");
                setYearFilter("all");
              }}
              className="text-xs font-medium text-navy-dark hover:underline"
            >
              Reset
            </button>
          )}
          <span className="ml-auto font-mono text-xs text-slate">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-ink/50">
            {items.length === 0
              ? "Nothing upcoming right now."
              : "No entries match this filter."}
          </p>
        ) : (
          <div className="mt-4 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.key}>
                <h3 className="mb-2 font-mono text-xs font-medium uppercase tracking-wide text-navy-dark">
                  {group.label}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item) => {
                    const d = new Date(item.datetime);
                    const appt = item as Appointment;
                    const assignment = item as Assignment;

                    return (
                      <li
                        key={item.id}
                        className="rounded-lg border border-rule p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-display text-sm font-medium text-ink">
                            {isAppointments
                              ? appt.name
                              : assignment.personnelName}
                          </span>
                          <span className="shrink-0 font-mono text-xs tabular text-slate">
                            {toDateOnlyValue(d)} · {formatTime(d)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink/60">
                          {isAppointments
                            ? `${appt.organization} — ${appt.reason}`
                            : assignment.description}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterSelectProps {
  value: number | "all";
  onChange: (value: number | "all") => void;
  options: { value: number; label: string }[];
  allLabel: string;
  ariaLabel: string;
}

function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  ariaLabel,
}: FilterSelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value === "all" ? "all" : Number(e.target.value))
        }
        aria-label={ariaLabel}
        className="cursor-pointer appearance-none rounded-md border border-rule bg-white py-1.5 pl-3 pr-7 text-xs text-ink hover:border-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
      >
        <option value="all">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 h-3 w-3 text-ink/40"
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
