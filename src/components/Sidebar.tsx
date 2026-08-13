import {
  Appointment,
  Assignment,
  Personnel,
  UnavailablePeriod,
} from "../types";
import { useClock } from "../store/useClock";
import {
  formatClock,
  isSameDay,
  getStatus,
  itemsInMonth,
  parseDateOnly,
} from "../lib/time";
import {
  exportAppointmentsToPdf,
  exportAssignmentsToPdf,
} from "../lib/exportPdf";

export type SidebarMode = "appointments" | "personnel";

interface SidebarProps {
  mode: SidebarMode;
  onModeChange: (mode: SidebarMode) => void;
  /** The month currently showing on whichever calendar is active — exports are scoped to this. */
  monthCursor: Date;
  showToast: (message: string, variant?: "success" | "error") => void;

  appointments: Appointment[];
  unavailablePeriods: UnavailablePeriod[];
  onNewAppointment: () => void;
  onMarkUnavailable: () => void;
  onRemoveUnavailable: (id: string) => void;

  assignments: Assignment[];
  personnel: Personnel[];
  onNewAssignment: () => void;
  onAddPersonnel: (name: string) => void;
  onRemovePersonnel: (id: string) => void;
}

export function Sidebar({
  mode,
  onModeChange,
  monthCursor,
  showToast,
  appointments,
  unavailablePeriods,
  onNewAppointment,
  onMarkUnavailable,
  onRemoveUnavailable,
  assignments,
  personnel,
  onNewAssignment,
  onAddPersonnel,
  onRemovePersonnel,
}: SidebarProps) {
  const now = useClock();

  const items: (Appointment | Assignment)[] =
    mode === "appointments" ? appointments : assignments;
  const today = items.filter((a) => isSameDay(new Date(a.datetime), now));
  const soon = items.filter((a) => getStatus(a.datetime, now) === "soon");
  const upcoming = items.filter(
    (a) => getStatus(a.datetime, now) === "upcoming",
  );

  const monthLabel = monthCursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const itemsThisMonth = itemsInMonth(items, monthCursor);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-rule bg-ink px-6 py-8 text-paper">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
          {now.toLocaleDateString(undefined, { weekday: "long" })}
        </p>
        <p className="mt-1 font-display text-2xl leading-tight">
          {now.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
        </p>
        <p className="mt-3 font-mono text-3xl tabular tracking-tight text-navy-light">
          {formatClock(now)}
        </p>

        <div className="mt-6 flex rounded-md border border-paper/15 bg-paper/5 p-0.5">
          <ModeTab
            label="Appointments"
            active={mode === "appointments"}
            onClick={() => onModeChange("appointments")}
          />
          <ModeTab
            label="Personnel"
            active={mode === "personnel"}
            onClick={() => onModeChange("personnel")}
          />
        </div>

        <button
          onClick={mode === "appointments" ? onNewAppointment : onNewAssignment}
          className="mt-4 w-full rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-navy-light active:scale-[0.98]"
        >
          {mode === "appointments" ? "New appointment" : "New assignment"}
        </button>

        <button
          onClick={() => {
            try {
              const filename =
                mode === "appointments"
                  ? exportAppointmentsToPdf(
                      itemsInMonth(appointments, monthCursor) as Appointment[],
                    )
                  : exportAssignmentsToPdf(
                      itemsInMonth(assignments, monthCursor) as Assignment[],
                    );
              showToast(`Saved "${filename}" to your Downloads folder`);
            } catch {
              showToast("Export failed — please try again.", "error");
            }
          }}
          disabled={itemsThisMonth.length === 0}
          title={`Export ${monthLabel}`}
          className="mt-2 w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2 text-center text-xs font-medium text-paper transition hover:bg-paper/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-paper/5"
        >
          Export {monthLabel} (.pdf)
        </button>

        <dl className="mt-10 space-y-5">
          <Stat label="Today" value={today.length} />
          <Stat label="Starting soon" value={soon.length} accent />
          <Stat label="Upcoming" value={upcoming.length} />
        </dl>
      </div>

      {mode === "appointments" ? (
        <div className="mt-8 flex min-h-0 flex-1 flex-col border-t border-paper/10 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-paper/80">Unavailable</p>
            <button
              onClick={onMarkUnavailable}
              className="text-xs font-medium text-navy-light hover:underline"
            >
              + Mark
            </button>
          </div>

          {unavailablePeriods.length === 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-paper/40">
              No blocked days. Mark holidays or days off to keep them from being
              booked.
            </p>
          ) : (
            <ul className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
              {unavailablePeriods.map((p) => (
                <li
                  key={p.id}
                  className="group flex items-start justify-between gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-paper/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-paper/80">{p.label}</p>
                    <p className="font-mono text-paper/40 tabular">
                      {formatRange(p.from, p.to)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveUnavailable(p.id)}
                    className="shrink-0 text-paper/30 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                    aria-label={`Remove ${p.label}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <PersonnelRoster
          personnel={personnel}
          onAdd={onAddPersonnel}
          onRemove={onRemovePersonnel}
        />
      )}

      <div className="mt-6 border-t border-paper/10 pt-4">
        <p className="font-mono text-[11px] leading-relaxed text-paper/40">
          {mode === "appointments" ? (
            <>
              Notifications fire{" "}
              <span className="text-paper/60">15 min before</span> each
              appointment, and again when it starts.
            </>
          ) : (
            <>
              Assignments sync live across every device signed in to this app.
            </>
          )}
        </p>
      </div>
    </aside>
  );
}

function PersonnelRoster({
  personnel,
  onAdd,
  onRemove,
}: {
  personnel: Personnel[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mt-8 flex min-h-0 flex-1 flex-col border-t border-paper/10 pt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-paper/80">Personnel</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem(
            "name",
          ) as HTMLInputElement;
          const value = input.value.trim();
          if (!value) return;
          onAdd(value);
          input.value = "";
        }}
        className="mt-2 flex gap-1.5"
      >
        <input
          name="name"
          placeholder="Add a name…"
          className="min-w-0 flex-1 rounded-md border border-paper/15 bg-paper/5 px-2.5 py-1.5 text-xs text-paper placeholder:text-paper/30 outline-none focus:border-navy-light"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-navy px-2.5 py-1.5 text-xs font-medium text-paper hover:bg-navy-light"
        >
          Add
        </button>
      </form>

      {personnel.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-paper/40">
          No one on the roster yet. Add names above so they show up in the
          assignment form.
        </p>
      ) : (
        <ul className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {personnel.map((p) => (
            <li
              key={p.id}
              className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-paper/5"
            >
              <span className="truncate text-paper/80">{p.name}</span>
              <button
                onClick={() => onRemove(p.id)}
                className="shrink-0 text-paper/30 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                aria-label={`Remove ${p.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
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

function ModeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
        active ? "bg-navy text-paper" : "text-paper/60 hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-sm text-paper/60">{label}</dt>
      <dd
        className={`font-mono text-xl tabular ${accent && value > 0 ? "text-amber-light" : "text-paper"}`}
      >
        {value}
      </dd>
    </div>
  );
}
