import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Assignment, AssignmentDraft, Personnel } from "../types";
import { toDatetimeLocalValue } from "../lib/time";

interface AssignmentFormProps {
  initial?: Assignment | null;
  initialDate?: string | null;
  personnel: Personnel[];
  onSave: (draft: AssignmentDraft) => void;
  onClose: () => void;
}

type FormState = {
  personnelId: string;
  description: string;
  datetime: string;
};

function makeEmptyState(personnel: Personnel[]): FormState {
  return {
    personnelId: personnel[0]?.id ?? "",
    description: "",
    datetime: toDatetimeLocalValue(new Date()),
  };
}

export function AssignmentForm({
  initial,
  initialDate,
  personnel,
  onSave,
  onClose,
}: AssignmentFormProps) {
  const [form, setForm] = useState<FormState>(() => makeEmptyState(personnel));
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  useEffect(() => {
    if (initial) {
      setForm({
        personnelId: initial.personnelId,
        description: initial.description,
        datetime: toDatetimeLocalValue(new Date(initial.datetime)),
      });
    } else if (initialDate) {
      setForm({
        ...makeEmptyState(personnel),
        datetime: toDatetimeLocalValue(new Date(initialDate)),
      });
    } else {
      setForm(makeEmptyState(personnel));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, initialDate]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.personnelId) next.personnelId = "Choose a person to assign.";
    if (!form.description.trim()) next.description = "Enter a description.";
    if (!form.datetime) next.datetime = "Pick a date and time.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const person = personnel.find((p) => p.id === form.personnelId);
    if (!person) return;
    onSave({
      personnelId: person.id,
      personnelName: person.name,
      description: form.description.trim(),
      datetime: new Date(form.datetime).toISOString(),
    });
  }

  const noPersonnel = personnel.length === 0;

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
          {initial ? "Edit assignment" : "New assignment"}
        </h2>

        {noPersonnel ? (
          <div className="mt-5 rounded-lg border border-dashed border-rule bg-ink/5 px-4 py-6 text-center text-sm text-ink/60">
            No personnel added yet. Add names in the "Personnel" panel in the
            sidebar first.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Personnel" error={errors.personnelId}>
              <select
                value={form.personnelId}
                onChange={(e) => update("personnelId", e.target.value)}
                className={inputClass(!!errors.personnelId)}
              >
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Description" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="e.g. site inspection"
                rows={2}
                className={`${inputClass(!!errors.description)} resize-none`}
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
                {initial ? "Save changes" : "Add assignment"}
              </button>
            </div>
          </form>
        )}

        {noPersonnel && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-ink/70 hover:bg-ink/5"
            >
              Close
            </button>
          </div>
        )}
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
