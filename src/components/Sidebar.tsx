import {
  Appointment,
  Assignment,
  Personnel,
  UnavailablePeriod,
} from "../types";
import { useClock } from "../store/useClock";
import { formatClock, isSameDay, getStatus, itemsInMonth } from "../lib/time";
import {
  exportAppointmentsToPdf,
  exportAssignmentsToPdf,
} from "../lib/exportPdf";
import { openExternalLink } from "../lib/openExternalLink";
import { UpcomingModal } from "./UpcomingModal";
import { UnavailableModal } from "./UnavailableModal";
import { useState } from "react";

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
  onAddPersonnel: () => void;
  onViewPersonnel: () => void;
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
  onViewPersonnel,
}: SidebarProps) {
  const now = useClock();

  const [upcomingOpen, setUpcomingOpen] = useState(false);
  const [unavailableOpen, setUnavailableOpen] = useState(false);

  const items: (Appointment | Assignment)[] =
    mode === "appointments" ? appointments : assignments;

  const today = items.filter((item) => isSameDay(new Date(item.datetime), now));

  const soon = items.filter((item) => getStatus(item.datetime, now) === "soon");

  const upcoming = items.filter(
    (item) => getStatus(item.datetime, now) === "upcoming",
  );

  const monthLabel = monthCursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const itemsThisMonth = itemsInMonth(items, monthCursor);

  const handleExport = () => {
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
  };

  return (
    <>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-rule bg-ink px-6 py-8 text-paper">
        <div>
          {/* Date */}
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
            })}
          </p>

          <p className="mt-1 font-display text-2xl leading-tight">
            {now.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </p>

          {/* Clock */}
          <p className="mt-3 font-mono text-3xl tabular tracking-tight text-navy-light">
            {formatClock(now)}
          </p>

          {/* Mode tabs */}
          <div className="mt-7 flex rounded-md border border-paper/15 bg-paper/5 p-0.5">
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

          {/* New appointment / assignment */}
          <button
            type="button"
            onClick={
              mode === "appointments" ? onNewAppointment : onNewAssignment
            }
            className="mt-4 w-full rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-navy-light active:scale-[0.98]"
          >
            {mode === "appointments" ? "New appointment" : "New assignment"}
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            disabled={itemsThisMonth.length === 0}
            title={`Export ${monthLabel}`}
            className="mt-3 w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-center text-xs font-medium text-paper transition hover:bg-paper/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-paper/5"
          >
            Export {monthLabel} (.pdf)
          </button>

          {/* Stats */}
          <dl className="mt-10 space-y-4">
            <Stat label="Today" value={today.length} />

            <Stat label="Starting soon" value={soon.length} accent />

            <Stat
              label="Upcoming"
              value={upcoming.length}
              onClick={() => setUpcomingOpen(true)}
            />
          </dl>
        </div>

        {/* Appointment-specific section */}
        {mode === "appointments" ? (
          <div className="mt-8 flex flex-col border-t border-paper/10 pt-6">
            {/* Section heading + Mark button */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-paper/80">Unavailable</p>

              <button
                type="button"
                onClick={onMarkUnavailable}
                className="text-xs font-medium text-navy-light hover:underline"
              >
                + Mark
              </button>
            </div>

            {/* Open unavailable periods */}
            <button
              type="button"
              onClick={() => setUnavailableOpen(true)}
              className="mt-3 flex w-full items-center justify-between rounded-md border border-paper/20 bg-paper/5 px-4 py-3 text-left transition hover:bg-paper/10 active:scale-[0.98]"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-paper/80">
                  Unavailable Periods
                </p>

                <p className="mt-1 text-xs text-paper/40">
                  View blocked days and periods
                </p>
              </div>

              <span className="ml-3 shrink-0 font-mono text-sm tabular text-paper/40">
                {unavailablePeriods.length}
              </span>
            </button>
          </div>
        ) : (
          /* Personnel section */
          <div className="mt-8 flex flex-col gap-2 border-t border-paper/10 pt-6">
            <button
              type="button"
              onClick={onAddPersonnel}
              className="w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-paper/10"
            >
              Add Personnel
            </button>

            <button
              type="button"
              onClick={onViewPersonnel}
              className="w-full rounded-md border border-paper/20 bg-paper/5 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-paper/10"
            >
              View Personnel
            </button>

            <p className="mt-1 text-center text-xs text-paper/40">
              {personnel.length} {personnel.length === 1 ? "person" : "people"}{" "}
              on the roster
            </p>
          </div>
        )}

        {/* Bottom information */}
        <div className="mt-8 border-t border-paper/10 pt-5">
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

        {/* Footer */}
        <p className="mt-4 text-center font-mono text-[10px] text-paper/30">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://andreiadlawan.vercel.app/"
            onClick={(event) => {
              event.preventDefault();
              openExternalLink("https://andreiadlawan.vercel.app/");
            }}
            className="cursor-pointer text-paper/50 underline decoration-paper/20 underline-offset-2 hover:text-paper/80"
          >
            Andrei Gabrielle Adlawan
          </a>
        </p>
      </aside>

      {/* Upcoming modal */}
      {upcomingOpen && (
        <UpcomingModal
          mode={mode}
          items={upcoming}
          onClose={() => setUpcomingOpen(false)}
        />
      )}

      {/* Unavailable periods modal */}
      {unavailableOpen && (
        <UnavailableModal
          periods={unavailablePeriods}
          onClose={() => setUnavailableOpen(false)}
          onRemoveUnavailable={onRemoveUnavailable}
        />
      )}
    </>
  );
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
      type="button"
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
  onClick,
}: {
  label: string;
  value: number;
  accent?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <dt className="text-sm text-paper/60">{label}</dt>

      <dd
        className={`font-mono text-xl tabular ${
          accent && value > 0 ? "text-amber-light" : "text-paper"
        }`}
      >
        {value}
      </dd>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="-mx-1 flex w-[calc(100%+0.5rem)] items-baseline justify-between rounded px-1 py-0.5 text-left transition hover:bg-paper/5"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-baseline justify-between">{content}</div>;
}
