import { FormEvent, useEffect, useState } from "react";
import { Personnel, PersonnelDraft } from "../types";

interface PersonnelFormProps {
  initial?: Personnel | null;
  onSave: (draft: PersonnelDraft) => void;
  onClose: () => void;
}

export function PersonnelForm({
  initial,
  onSave,
  onClose,
}: PersonnelFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initial?.name ?? "");
  }, [initial]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a name.");
      return;
    }
    setError(null);
    onSave({ name: trimmed });
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
          {initial ? "Edit personnel" : "Add personnel"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate">
              Name
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:ring-2 focus:ring-navy/30 ${
                error ? "border-red-400" : "border-rule focus:border-navy"
              }`}
            />
            {error && (
              <span className="mt-1 block text-xs text-red-600">{error}</span>
            )}
          </label>

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
              {initial ? "Save changes" : "Add personnel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
