import { Assignment, Personnel } from "../types";

interface PersonnelListModalProps {
  personnel: Personnel[];
  assignments: Assignment[];
  onAdd: () => void;
  onEdit: (p: Personnel) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function PersonnelListModal({
  personnel,
  assignments,
  onAdd,
  onEdit,
  onDelete,
  onClose,
}: PersonnelListModalProps) {
  const sorted = [...personnel].sort((a, b) => a.name.localeCompare(b.name));

  function assignmentCount(id: string): number {
    return assignments.filter((a) => a.personnelId === id).length;
  }

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

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
          <h2 className="font-display text-xl text-ink">Personnel</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onAdd}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-navy-dark hover:bg-navy/10"
            >
              + Add
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
            No one on the roster yet. Add a name to get started.
          </p>
        ) : (
          <ul className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {sorted.map((p) => {
              const count = assignmentCount(p.id);
              return (
                <li
                  key={p.id}
                  className="group flex items-center gap-3 rounded-lg border border-rule p-3 transition hover:border-navy/30"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-mono text-xs font-semibold text-navy-dark">
                    {initials(p.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {p.name}
                  </span>
                  {count > 0 && (
                    <span
                      className="shrink-0 rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[10px] text-amber"
                      title={`${count} assignment${count === 1 ? "" : "s"}`}
                    >
                      {count}
                    </span>
                  )}
                  <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded px-2 py-1 text-xs text-slate hover:bg-ink/5 hover:text-ink"
                      aria-label={`Edit ${p.name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="rounded px-2 py-1 text-xs text-slate hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${p.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
