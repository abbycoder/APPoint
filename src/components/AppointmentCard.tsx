import { Appointment } from "../types";
import { formatTime, getStatus, minutesUntil } from "../lib/time";
import { useClock } from "../store/useClock";

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (a: Appointment) => void;
  onDelete: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  const now = useClock(30_000);
  const status = getStatus(appointment.datetime, now);
  const diff = minutesUntil(new Date(appointment.datetime), now);

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
          {formatTime(new Date(appointment.datetime))}
        </span>
        {status === "soon" && (
          <span className="mt-1 font-mono text-[10px] uppercase tracking-wide text-amber">
            {diff <= 0 ? "now" : `in ${diff}m`}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-display text-lg font-medium text-ink">
            {appointment.name}
          </h3>
          <span className="rounded-full bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy-dark">
            {appointment.organization}
          </span>
          {appointment.isWalkIn && (
            <span className="rounded-full bg-amber/15 px-2 py-0.5 text-xs font-medium text-amber">
              Walk-in
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-ink/70">{appointment.reason}</p>
        <p className="mt-2 font-mono text-xs tabular text-slate">
          {appointment.contactNumber}
        </p>
      </div>

      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          onClick={() => onEdit(appointment)}
          className="rounded px-2 py-1 text-xs text-slate hover:bg-ink/5 hover:text-ink"
          aria-label={`Edit appointment with ${appointment.name}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(appointment.id)}
          className="rounded px-2 py-1 text-xs text-slate hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete appointment with ${appointment.name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
