import { Assignment } from "../types";
import { formatTime, getStatus, minutesUntil } from "../lib/time";
import { useClock } from "../store/useClock";

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (a: Assignment) => void;
  onDelete: (id: string) => void;
}

export function AssignmentCard({
  assignment,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const now = useClock(30_000);
  const status = getStatus(assignment.datetime, now);
  const diff = minutesUntil(new Date(assignment.datetime), now);

  const statusRing =
    status === "soon"
      ? "ring-1 ring-amber/50"
      : status === "past"
        ? "opacity-55"
        : "ring-1 ring-transparent";

  return (
    <div
      className={`group relative flex animate-riseIn gap-4 rounded-lg border border-rule bg-white/60 p-4 shadow-card transition hover:border-navy/40 ${statusRing}`}
    >
      <div className="flex w-16 shrink-0 flex-col items-start">
        <span className="font-mono text-sm font-medium tabular text-ink">
          {formatTime(new Date(assignment.datetime))}
        </span>
        {status === "soon" && (
          <span className="mt-1 font-mono text-[10px] uppercase tracking-wide text-amber">
            {diff <= 0 ? "now" : `in ${diff}m`}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg font-medium text-ink">
          {assignment.personnelName}
        </h3>
        <p className="mt-1 text-sm text-ink/70">{assignment.description}</p>
      </div>

      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={() => onEdit(assignment)}
          className="rounded px-2 py-1 text-xs text-slate hover:bg-ink/5 hover:text-ink"
          aria-label={`Edit assignment for ${assignment.personnelName}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(assignment.id)}
          className="rounded px-2 py-1 text-xs text-slate hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete assignment for ${assignment.personnelName}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
