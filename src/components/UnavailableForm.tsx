import { FormEvent, useState } from "react";
import { UnavailableDraft } from "../types";
import { toDateOnlyValue } from "../lib/time";

interface UnavailableFormProps {
  initialDate?: string | null;
  onSave: (draft: UnavailableDraft) => void;
  onClose: () => void;
}

export function UnavailableForm({
  initialDate,
  onSave,
  onClose,
}: UnavailableFormProps) {
  const base = initialDate
    ? toDateOnlyValue(new Date(initialDate))
    : toDateOnlyValue(new Date());

  const [multiDay, setMultiDay] = useState(false);
  const [date, setDate] = useState(base);
  const [from, setFrom] = useState(base);
  const [to, setTo] = useState(base);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const start = multiDay ? from : date;
    const end = multiDay ? to : date;

    if (!start || !end) {
      setError("Please choose a date.");
      return;
    }

    if (start > end) {
      setError("The start date must be on or before the end date.");
      return;
    }

    setError(null);

    onSave({
      from: start,
      to: end,
      label: label.trim() || "Unavailable",
    });
  }

  return (
    <div
      className="w-full max-w-sm rounded-xl border border-rule bg-paper p-6 shadow-card"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-semibold text-ink">Mark unavailable</h2>

      <p className="mt-1 text-sm text-slate">
        Select a day that is unavailable for appointments. Need to block several
        days? Turn on <strong>Block multiple days</strong>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {!multiDay ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm font-mono text-ink outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/30"
            />
          </label>
        ) : (
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
        )}

        <label className="flex items-center gap-3 rounded-md border border-rule bg-white px-3 py-2">
          <input
            type="checkbox"
            checked={multiDay}
            onChange={(e) => {
              const checked = e.target.checked;
              setMultiDay(checked);

              if (checked) {
                setFrom(date);
                setTo(date);
              } else {
                setDate(from);
              }
            }}
            className="h-4 w-4 accent-navy"
          />
          <span className="text-sm text-ink">Block multiple days</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
            Reason (optional)
          </span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Out of town"
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
            className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-paper transition hover:bg-navy-light"
          >
            Mark unavailable
          </button>
        </div>
      </form>
    </div>
  );
}
