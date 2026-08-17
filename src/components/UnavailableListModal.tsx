import { UnavailablePeriod } from "../types";
import { parseDateOnly } from "../lib/time";

interface UnavailableListModalProps {
  periods: UnavailablePeriod[];
  onAdd: () => void;
  onEdit: (p: UnavailablePeriod) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function UnavailableListModal({
  periods,
  onAdd,
  onEdit,
  onDelete,
  onClose,
}: UnavailableListModalProps) {
  const sorted = [...periods].sort((a, b) =>
    a.from < b.from ? -1 : a.from > b.from ? 1 : 0,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl border border-rule bg-paper p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Unavailable days</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onAdd}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-navy-dark hover:bg-navy/10"
            >
              + Mark
            </button>
            <button
              onClick={onClose}
              className="rounded px-2 py-1 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-10 text-center text-sm text-ink/50">
            No blocked days. Mark holidays or days off to keep them from being
            booked.
          </p>
        ) : (
          <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {sorted.map((p) => (
              <li
                key={p.id}
                className="group flex items-center gap-3 rounded-lg border border-rule p-3 transition hover:border-navy/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {p.label}
                  </p>
                  <p className="font-mono text-xs tabular text-slate">
                    {formatRange(p.from, p.to)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(p)}
                    className="rounded px-2 py-1 text-xs text-slate hover:bg-ink/5 hover:text-ink"
                    aria-label={`Edit ${p.label}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="rounded px-2 py-1 text-xs text-slate hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${p.label}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatRange(from: string, to: string): string {
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (from === to) return fromDate.toLocaleDateString(undefined, opts);
  return `${fromDate.toLocaleDateString(undefined, opts)} – ${toDate.toLocaleDateString(undefined, opts)}`;
}
