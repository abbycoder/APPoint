import { UnavailablePeriod } from "../types";
import { parseDateOnly } from "../lib/time";

interface UnavailableModalProps {
  periods: UnavailablePeriod[];
  onRemoveUnavailable: (id: string) => void;
  onClose: () => void;
}

export function UnavailableModal({
  periods,
  onRemoveUnavailable,
  onClose,
}: UnavailableModalProps) {
  const sorted = [...periods].sort((a, b) => a.from.localeCompare(b.from));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-rule bg-paper p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Unavailable Periods</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Empty state */}
        {sorted.length === 0 ? (
          <p className="mt-10 text-center text-sm text-ink/50">
            No unavailable periods yet. Mark a holiday or day off to get
            started.
          </p>
        ) : (
          <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {sorted.map((period) => (
              <li
                key={period.id}
                className="group flex items-center gap-3 rounded-lg border border-rule p-3 transition hover:border-navy/30"
              >
                {/* Period icon */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-mono text-[10px] font-semibold text-navy-dark">
                  OFF
                </span>

                {/* Period details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {period.label}
                  </p>

                  <p className="mt-0.5 font-mono text-[11px] tabular text-ink/45">
                    {formatRange(period.from, period.to)}
                  </p>
                </div>

                {/* Delete */}
                <div className="flex shrink-0 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onRemoveUnavailable(period.id)}
                    className="rounded px-2 py-1 text-xs text-slate hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${period.label}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {sorted.length > 0 && (
          <div className="mt-4 border-t border-rule pt-3">
            <p className="font-mono text-[10px] text-ink/35">
              {sorted.length}{" "}
              {sorted.length === 1
                ? "unavailable period"
                : "unavailable periods"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRange(from: string, to: string): string {
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);

  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  if (from === to) {
    return fromDate.toLocaleDateString(undefined, opts);
  }

  return `${fromDate.toLocaleDateString(
    undefined,
    opts,
  )} – ${toDate.toLocaleDateString(undefined, opts)}`;
}
