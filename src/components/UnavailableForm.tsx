import { FormEvent, useEffect, useState } from "react";
import { UnavailableDraft, UnavailablePeriod } from "../types";
import { toDateOnlyValue } from "../lib/time";

interface UnavailableFormProps {
  initial?: UnavailablePeriod | null;
  initialDate?: string | null;
  onSave: (draft: UnavailableDraft) => void;
  onClose: () => void;
}

export function UnavailableForm({
  initial,
  initialDate,
  onSave,
  onClose,
}: UnavailableFormProps) {
  const base = initialDate
    ? toDateOnlyValue(new Date(initialDate))
    : toDateOnlyValue(new Date());
  const [isRange, setIsRange] = useState(() =>
    initial ? initial.from !== initial.to : false,
  );
  const [from, setFrom] = useState(initial?.from ?? base);
  const [to, setTo] = useState(initial?.to ?? base);
  const [label, setLabel] = useState(initial?.label ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setIsRange(initial.from !== initial.to);
      setFrom(initial.from);
      setTo(initial.to);
      setLabel(initial.label);
    }
  }, [initial]);

  function handleSingleDateChange(value: string) {
    setFrom(value);
    setTo(value);
  }

  function toggleRange(checked: boolean) {
    setIsRange(checked);
    if (!checked) setTo(from);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!from || !to) {
      setError("Pick both a start and end date.");
      return;
    }
    if (from > to) {
      setError("The start date must be on or before the end date.");
      return;
    }
    setError(null);
    onSave({ from, to, label: label.trim() || "Unavailable" });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-rule bg-paper p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg text-ink">
          {initial ? "Edit unavailable period" : "Mark unavailable"}
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Block a day, or a whole week, from taking new appointments.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex items-center justify-between rounded-md border border-rule bg-white px-3 py-2.5">
            <div>
              <p className="text-sm text-ink">Block multiple days</p>
              <p className="text-xs text-ink/50">Off blocks just one day.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isRange}
              onClick={() => toggleRange(!isRange)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                isRange ? "bg-navy" : "bg-rule"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  isRange ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {isRange ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
                  From
                </span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm font-mono text-ink outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/30"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
                  To
                </span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm font-mono text-ink outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/30"
                />
              </label>
            </div>
          ) : (
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
                Date
              </span>
              <input
                type="date"
                value={from}
                onChange={(e) => handleSingleDateChange(e.target.value)}
                className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm font-mono text-ink outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/30"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
              Reason (optional)
            </span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Holiday, Office closed"
              className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/30"
            />
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-ink/70 hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-paper hover:bg-navy-light"
            >
              {initial ? "Save changes" : "Mark unavailable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
