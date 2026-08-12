import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Appointment, AppointmentDraft, UnavailablePeriod } from "../types";
import { findUnavailablePeriod, toDatetimeLocalValue } from "../lib/time";

interface AppointmentFormProps {
  initial?: Appointment | null;
  /** ISO datetime to prefill when creating a new appointment (e.g. a day picked on the calendar). */
  initialDate?: string | null;
  /** Blocked days/weeks; booking on one of these is rejected. */
  unavailablePeriods: UnavailablePeriod[];
  onSave: (draft: AppointmentDraft) => void;
  onClose: () => void;
}

type FormState = {
  name: string;
  contactNumber: string;
  organization: string;
  reason: string;
  datetime: string;
  isWalkIn: boolean;
};

const emptyState: FormState = {
  name: "",
  contactNumber: "",
  organization: "",
  reason: "",
  datetime: toDatetimeLocalValue(new Date()),
  isWalkIn: false,
};

export function AppointmentForm({
  initial,
  initialDate,
  unavailablePeriods,
  onSave,
  onClose,
}: AppointmentFormProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        contactNumber: initial.contactNumber,
        organization: initial.organization,
        reason: initial.reason,
        datetime: toDatetimeLocalValue(new Date(initial.datetime)),
        isWalkIn: initial.isWalkIn,
      });
    } else if (initialDate) {
      setForm({
        ...emptyState,
        datetime: toDatetimeLocalValue(new Date(initialDate)),
      });
    } else {
      setForm(emptyState);
    }
  }, [initial, initialDate]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Enter the visitor's name.";
    if (!form.contactNumber.trim())
      next.contactNumber = "Enter a contact number.";
    else if (!/^[0-9+()\-\s]{6,}$/.test(form.contactNumber.trim()))
      next.contactNumber = "Use digits, spaces, +, -, or ().";
    if (!form.organization.trim())
      next.organization = "Enter the organization or office.";
    if (!form.reason.trim()) next.reason = "Enter the reason for visit.";

    if (!form.datetime) {
      next.datetime = "Pick a date and time.";
    } else {
      const chosen = new Date(form.datetime);
      const blocked = findUnavailablePeriod(chosen, unavailablePeriods);
      if (blocked) {
        next.datetime = `This day is marked unavailable (${blocked.label}). Choose another date.`;
      }
    }
    // Same-time slots are allowed — the walk-in flag below is what
    // distinguishes an unscheduled visitor from a prior booking.

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      contactNumber: form.contactNumber.trim(),
      organization: form.organization.trim(),
      reason: form.reason.trim(),
      datetime: new Date(form.datetime).toISOString(),
      isWalkIn: form.isWalkIn,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-rule bg-paper p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl text-ink">
          {initial ? "Edit appointment" : "New appointment"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Name" error={errors.name}>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Visitor's full name"
              className={inputClass(!!errors.name)}
            />
          </Field>

          <Field label="Contact number" error={errors.contactNumber}>
            <input
              value={form.contactNumber}
              onChange={(e) => update("contactNumber", e.target.value)}
              placeholder="09xx xxx xxxx"
              className={`${inputClass(!!errors.contactNumber)} font-mono`}
            />
          </Field>

          <Field label="Organization / office" error={errors.organization}>
            <input
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              placeholder="e.g. Records Office"
              className={inputClass(!!errors.organization)}
            />
          </Field>

          <Field label="Reason for visit" error={errors.reason}>
            <textarea
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              placeholder="Brief description"
              rows={2}
              className={`${inputClass(!!errors.reason)} resize-none`}
            />
          </Field>

          <Field label="Date & time" error={errors.datetime}>
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => update("datetime", e.target.value)}
              className={`${inputClass(!!errors.datetime)} font-mono`}
            />
          </Field>

          <div className="flex items-center justify-between rounded-md border border-rule bg-white px-3 py-2.5">
            <div>
              <p className="text-sm text-ink">Walk-in</p>
              <p className="text-xs text-ink/50">
                No prior scheduling — visitor showed up directly.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isWalkIn}
              onClick={() => update("isWalkIn", !form.isWalkIn)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                form.isWalkIn ? "bg-navy" : "bg-rule"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  form.isWalkIn ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

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
              {initial ? "Save changes" : "Add appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-md border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:ring-2 focus:ring-navy/30 ${
    hasError ? "border-red-400" : "border-rule focus:border-navy"
  }`;
}
